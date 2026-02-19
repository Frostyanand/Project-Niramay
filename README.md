# Niramay: Neuro-Symbolic Pharmacogenomics Platform 🧬💊

> **Hackathon Submission**: Precision Medicine for Everyone.
> *Bridging the gap between genetic data and clinical action.*

| 🔗 Links | |
|---|---|
| **Live Demo** | [🌐 Coming Soon — Deploy to Vercel/Railway] |
| **Video Demo** | [▶️ LinkedIn Video — Coming Soon] |
| **GitHub Repo** | [📦 This Repository] |

## 🚀 Overview

**Niramay** is an advanced AI-powered clinical decision support system that analyzes a patient's genetic profile (VCF data) to predict drug response and toxicity risks.

By combining **Deterministic Clinical Rules** (Symbolic AI) with **Explainable Generative AI** (Neural Networks), Niramay solves the "Black Box" problem in medical AI—providing 100% accurate, guideline-compliant risk assessments backed by natural language explanations grounded in medical literature.

---

## 💡 The Problem

Adverse Drug Reactions (ADRs) are a leading cause of death globally. While pharmacogenomic (PGx) testing exists, the results are often buried in dense, unreadable VCF files that clinicians struggle to interpret during a 15-minute consultation.

## 🛠️ The Solution: Neuro-Symbolic AI

Niramay uses a hybrid architecture:
1.  **The "Symbolic" Engine**: A deterministic rules engine that strictly follows **CPIC (Clinical Pharmacogenetics Implementation Consortium)** guidelines. It never "hallucinates" a risk level. If the guidelines say "Avoid Codeine," the system says "Avoid Codeine."
2.  **The "Neural" Cortex**: A Retrieval-Augmented Generation (RAG) system using **Google Gemini** and **Pinecone**. It reads the patient's specific genetic markers and explains *why* a drug is risky in plain English (e.g., *"The CYP2D6 *4 variant prevents the liver from activating Codeine into Morphine, leading to lack of efficacy."*).

---

## 🏗️ Technical Architecture

### 1. Frontend: Next.js 14 (App Router)
*   **Framework**: Next.js (React) with Tailwind CSS and Shadcn/UI for a clean, clinical-grade interface.
*   **VCF Upload**: Secure client-side handling of genomic files using direct uploads.
*   **Traffic Light Dashboard**: Visualizes risk (Green/Yellow/Red) for quick clinical scanning.
*   **Real-time Analysis**: Connects to the backend via a proxy API route (`/api/analyze`) to avoid CORS issues.

### 2. Backend: Python FastAPI Microservice
*   **Containerization**: Fully Dockerized for reproducibility across environments.
*   **Bio-Parser Service**: Uses `cyvcf2` (C-optimized VCF parser) to extract genotype data (e.g., `rs4149056` at `chr12:21131583`).
*   **Rules Engine Service**: Maps parsed genotypes to haplotypes (e.g., `*5`) and diplotypes (e.g., `*5/*5`), then looks up CPIC clinical recommendation tables.
*   **Neuro-Symbolic Orchestrator**: Manages parallel execution of genotype parsing, rule evaluation, and AI generation.

### 3. AI & Knowledge Base
*   **Vector Database**: **Pinecone** stores a vectorized version of the CPIC Clinical Guidelines.
*   **Embedding Model**: `gemini-embedding-001` (768 dimensions) converts medical text into semantic vectors.
*   **LLM**: **Google Gemini 2.0 Flash** generates the final narrative.
*   **RAG Pipeline**:
    1.  Patient's Drug + Phenotype is embedded.
    2.  System retrieves the official guideline text from Pinecone.
    3.  LLM generates a 3-sentence explanation using *only* the retrieved guidelines (Grounded Generation).
    4.  **Multi-Model Cascade**: A resilient fallback system tries multiple Gemini models (Flash 2.5, Pro, etc.) and rotates API keys to ensure 99.9% uptime during high load.

---

## 🔄 How It Works (End-to-End Flow)

1.  **Upload**: The clinician uploads a standard `.vcf` file (Variant Call Format) via the Dashboard.
2.  **Ingestion**: The backend downloads and parses the file using `cyvcf2`, extracting variants for key pharmacogenes (`CYP2C9`, `CYP2C19`, `SLCO1B1`, etc.).
3.  **Deterministic Evaluation**:
    *   The `Rules Engine` identifies the patient's Diplotype (e.g., `SLCO1B1 *5/*5`).
    *   It determines the Phenotype (e.g., "Poor Function").
    *   It assigns a Risk Level (High/Moderate/Low) based on CPIC tables.
4.  **Neural Explanation (Parallel)**:
    *   For every drug with a genetic finding, the system fires an asynchronous RAG task.
    *   It retrieves the exact paragraph from the 2025 CPIC Guidelines relevant to that diplotype.
    *   Gemini synthesizes a "clinical impact statement" explaining the biological mechanism.
5.  **Presentation**: The frontend displays a "Traffic Light" card for each drug, combining the rigid safety warning with the nuanced AI explanation.

---

## ⚡ Key Features

*   **100% Guideline Compliance**: Risk levels are hard-coded to standard medical protocols. zero hallucination risk for safety-critical data.
*   **Sub-50ms Parsing**: Uses C-based `htslib` bindings for ultra-fast genomic processing.
*   **Resilient AI**: Implements a "Key Cascade" and "Model Waterfall" to handle API quotas and outages automatically.
*   **Explainable**: Doesn't just say "High Risk"—explains the *mechanism* (e.g., "Defective transporter protein OATP1B1 causes accumulation of Simvastatin in plasma").

---

## 📦 Project Structure

```bash
Project-Niramay/
├── backend/                 # Python/FastAPI Microservice
│   ├── app/
│   │   ├── main.py          # API Entry point & Parallel Orchestrator
│   │   ├── services/
│   │   │   ├── bio_parser.py   # VCF File Processing (cyvcf2)
│   │   │   ├── rules_engine.py # CPIC Guideline Logic (Deterministic)
│   │   │   └── rag_agent.py    # Gemini + Pinecone Pipeline
│   │   └── models.py        # Pydantic Data Models
│   ├── scripts/             # Database Seeding Tools
│   ├── Dockerfile           # Production-ready container config
│   └── requirements.txt     # Python dependencies
│
├── niramay/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App Router Pages
│   │   ├── components/      # UI Components (Dashboard, Uploader)
│   │   └── lib/             # Utilities (Supabase, API clients)
│   └── public/              # Static assets
│
└── testing/                 # Clinical sample data (Synthetic VCFs)
```

## � API Documentation

### `POST /api/v1/analyze-vcf`

**Request Body:**
```json
{
  "vcf_url": "https://your-storage.com/patient.vcf",
  "drugs": ["Warfarin", "Codeine", "Simvastatin"],
  "patient_id": "PATIENT_001"
}
```

**Response (per drug in `results[]`):**
```json
{
  "patient_id": "PATIENT_001",
  "drug": "WARFARIN",
  "timestamp": "2026-02-20T00:00:00Z",
  "risk_assessment": {
    "risk_label": "Adjust Dosage",
    "severity": "moderate",
    "confidence_score": 0.98
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2C9",
    "phenotype": "Intermediate Metabolizer",
    "diplotype": "*2/*2",
    "detected_variants": [{
      "rsid": "rs1799853",
      "gene": "CYP2C9",
      "chrom": "10",
      "pos": 96702047,
      "ref": "C",
      "alt": ["T"]
    }]
  },
  "clinical_recommendation": {
    "guideline_source": "CPIC",
    "action": "Decrease dose by 15-30%.",
    "dosing_recommendation": "Reduce initial dose by 15-30%.",
    "alternative_drugs": ["Apixaban", "Rivaroxaban"]
  },
  "llm_generated_explanation": {
    "summary": "AI-generated clinical explanation...",
    "citations": ["CPIC Warfarin 2025"],
    "model_used": "gemini-2.0-flash"
  },
  "quality_metrics": {
    "vcf_parsing_success": true,
    "annotation_completeness": 1.0,
    "pipeline_version": "2.0.0-neurosymbolic"
  }
}
```

### `GET /health`
Returns `{"status": "healthy", "version": "2.0.0"}`

## �🚀 Getting Started

### Prerequisites
*   Docker & Docker Compose
*   Node.js 18+
*   Google Gemini API Key
*   Pinecone API Key

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/project-niramay.git
    cd project-niramay
    ```

2.  **Backend Setup (Docker)**
    ```bash
    cd backend
    cp .env.example .env
    # Edit .env with your GEMINI_API_KEY and PINECONE_API_KEY
    docker build -t niramay-backend .
    docker run -p 8000:8000 --env-file .env niramay-backend
    ```

3.  **Frontend Setup**
    ```bash
    cd ../niramay
    npm install
    cp .env.example .env
    # Edit .env with your Supabase credentials
    npm run dev
    ```

4.  **Access the Dashboard**
    Open `http://localhost:3000` to start analyzing genomic data.

---

### 🧬 Sample Data
Use the files in the `testing/` directory to simulate different patient profiles:
*   `high_risk_sample.vcf`: Exhibits Poor Metabolizer status for Warfarin, Clopidogrel, and Simvastatin.
*   `normal_sample.vcf`: Extensive Metabolizer (Normal) profile.

---

## 🔮 Future Roadmap
*   **EHR Integration**: FHIR-compliant API for direct hospital system connection.
*   **Polypharmacy**: Check for drug-drug-gene interactions.
*   **Whole Genome Support**: Scale parsing to 30GB+ WGS files using cloud batch processing.

---

## 👥 Team

| Name | Role |
|---|---|
| Anuraag | Full-Stack Developer & AI Engineer |

---

*Built with ❤️ for the Hackathon.*
