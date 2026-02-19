from pydantic import BaseModel
from typing import List, Optional

class AnalysisRequest(BaseModel):
    vcf_url: str  
    drugs: List[str]
    patient_id: Optional[str] = "PATIENT_001"
