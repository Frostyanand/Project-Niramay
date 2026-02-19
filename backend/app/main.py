from dotenv import load_dotenv
load_dotenv()  # loads backend/.env → populates os.environ before any service initializes

import asyncio
import time
import logging
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import AnalysisRequest
from app.services import bio_parser, rules_engine, rag_agent

logger = logging.getLogger("main")

app = FastAPI(title="Niramay Pharmacogenomics API", version="2.0.0")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/analyze-vcf")
async def analyze_patient_vcf(request: AnalysisRequest):
    start_time = time.time()

    try:
        # 1. Ingest & Parse
        vcf_path = bio_parser.download_temp_vcf(request.vcf_url)
        parsed_data = bio_parser.parse_genomic_data(vcf_path)
        parse_time = time.time() - start_time
        logger.info(f"[PIPELINE] VCF parsed in {parse_time:.2f}s")

        vcf_parsing_success = len(parsed_data.get("variants", [])) > 0

        # 2. Calculate Deterministic Risk (instant, no API calls)
        clinical_assessments = rules_engine.evaluate_risk(parsed_data, request.drugs)
        logger.info(f"[PIPELINE] Rules evaluated for {len(clinical_assessments)} drugs")

        # 3. Generate ALL Explainable AI Narratives IN PARALLEL
        explanation_tasks = []
        task_indices = []

        for i, assessment in enumerate(clinical_assessments):
            if "pharmacogenomic_profile" in assessment:
                drug = assessment["drug"]
                gene = assessment["pharmacogenomic_profile"]["primary_gene"]
                phenotype = assessment["pharmacogenomic_profile"]["phenotype"]
                diplotype = assessment["pharmacogenomic_profile"].get("diplotype", "Unknown")

                explanation_tasks.append(
                    rag_agent.generate_explanation_async(drug, gene, phenotype, diplotype)
                )
                task_indices.append(i)

        # Fire ALL RAG+LLM calls simultaneously
        logger.info(f"[PIPELINE] Launching {len(explanation_tasks)} parallel RAG+LLM tasks...")
        parallel_start = time.time()
        explanations = await asyncio.gather(*explanation_tasks, return_exceptions=True)
        logger.info(f"[PIPELINE] All {len(explanation_tasks)} explanations completed in {time.time() - parallel_start:.2f}s")

        # Attach results back to assessments
        for idx, explanation in zip(task_indices, explanations):
            if isinstance(explanation, Exception):
                logger.error(f"[PIPELINE] Exception for drug at index {idx}: {explanation}")
                clinical_assessments[idx]["llm_generated_explanation"] = {
                    "summary": "Explanation generation failed due to a transient API error.",
                    "citations": ["CPIC Database"],
                    "model_used": "error",
                    "error": str(explanation)
                }
            else:
                clinical_assessments[idx]["llm_generated_explanation"] = explanation

        total_time = time.time() - start_time
        logger.info(f"[PIPELINE] ✅ Total request completed in {total_time:.2f}s")

        # 4. Construct Final Output — Schema-Compliant
        timestamp = datetime.now(timezone.utc).isoformat()
        results = []

        for assessment in clinical_assessments:
            result = {
                "patient_id": request.patient_id or "PATIENT_001",
                "drug": assessment["drug"],
                "timestamp": timestamp,
                "risk_assessment": assessment.get("risk_assessment", {}),
                "pharmacogenomic_profile": assessment.get("pharmacogenomic_profile", {}),
                "clinical_recommendation": assessment.get("clinical_recommendation", {}),
                "llm_generated_explanation": assessment.get("llm_generated_explanation", {}),
                "quality_metrics": {
                    "vcf_parsing_success": vcf_parsing_success,
                    "annotation_completeness": 1.0 if assessment.get("pharmacogenomic_profile", {}).get("detected_variants") else 0.8,
                    "pipeline_version": "2.0.0-neurosymbolic"
                }
            }
            results.append(result)

        return {
            "results": results,
            "performance": {
                "total_seconds": round(total_time, 2),
                "parse_seconds": round(parse_time, 2),
                "drugs_analyzed": len(clinical_assessments),
                "parallel_tasks": len(explanation_tasks)
            }
        }

    except Exception as e:
        logger.error(f"[PIPELINE] Fatal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "2.0.0"}
