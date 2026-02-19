from dotenv import load_dotenv
load_dotenv()  # loads backend/.env → populates os.environ before any service initializes

import asyncio
import time
import logging
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from app.models import AnalysisRequest
from app.services import bio_parser, rules_engine, rag_agent

logger = logging.getLogger("main")

app = FastAPI(title="Niramay Neuro-Symbolic API")

@app.post("/api/v1/analyze-vcf")
async def analyze_patient_vcf(request: AnalysisRequest):
    start_time = time.time()

    try:
        # 1. Ingest & Parse
        vcf_path = bio_parser.download_temp_vcf(request.vcf_url)
        parsed_data = bio_parser.parse_genomic_data(vcf_path)
        logger.info(f"[PIPELINE] VCF parsed in {time.time() - start_time:.2f}s")

        # 2. Calculate Deterministic Risk (instant, no API calls)
        clinical_assessments = rules_engine.evaluate_risk(parsed_data, request.drugs)
        logger.info(f"[PIPELINE] Rules evaluated for {len(clinical_assessments)} drugs")

        # 3. Generate ALL Explainable AI Narratives IN PARALLEL
        # Build a list of async tasks for drugs that need explanations
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
                    "summary": "Explanation generation failed.",
                    "error": str(explanation)
                }
            else:
                clinical_assessments[idx]["llm_generated_explanation"] = explanation

        total_time = time.time() - start_time
        logger.info(f"[PIPELINE] ✅ Total request completed in {total_time:.2f}s")

        # 4. Construct Final Output
        return {
            "patient_id": "PATIENT_001",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": clinical_assessments,
            "quality_metrics": parsed_data["quality_metrics"],
            "performance": {
                "total_seconds": round(total_time, 2),
                "drugs_analyzed": len(clinical_assessments),
                "parallel_tasks": len(explanation_tasks)
            }
        }

    except Exception as e:
        logger.error(f"[PIPELINE] Fatal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}
