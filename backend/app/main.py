from fastapi import FastAPI, HTTPException
from app.models import AnalysisRequest
from app.services import bio_parser, rules_engine, rag_agent

app = FastAPI(title="Niramay Neuro-Symbolic API")

@app.post("/api/v1/analyze-vcf")
async def analyze_patient_vcf(request: AnalysisRequest):
    try:
        # 1. Ingest & Parse
        vcf_path = bio_parser.download_temp_vcf(request.vcf_url)
        parsed_data = bio_parser.parse_genomic_data(vcf_path)
        
        # 2. Calculate Deterministic Risk
        clinical_assessments = rules_engine.evaluate_risk(parsed_data, request.drugs)
        
        # 3. Generate Explainable AI Narratives
        for assessment in clinical_assessments:
            # Only generate explanations for drugs that have a genetic profile found
            if "pharmacogenomic_profile" in assessment:
                drug = assessment["drug"]
                gene = assessment["pharmacogenomic_profile"]["primary_gene"]
                phenotype = assessment["pharmacogenomic_profile"]["phenotype"]
                diplotype = assessment["pharmacogenomic_profile"].get("diplotype", "Unknown")
                
                # Fetch the Gemini explanation
                explanation = rag_agent.generate_explanation(drug, gene, phenotype, diplotype)
                assessment["llm_generated_explanation"] = explanation

        # 4. Construct Final Output
        return {
            "patient_id": "PATIENT_001",
            "timestamp": "2026-02-19T14:00:00Z",
            "results": clinical_assessments,
            "quality_metrics": parsed_data["quality_metrics"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}
