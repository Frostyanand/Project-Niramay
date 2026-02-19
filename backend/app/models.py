from pydantic import BaseModel
from typing import List

class AnalysisRequest(BaseModel):
    vcf_url: str  
    drugs: List[str]
