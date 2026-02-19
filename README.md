# NIRMAY 🧬
### _Precision Pharmacogenomics. Deterministic. Explainable. Clinician-Ready._

---

> **NIRMAY** (निर्मय) — Sanskrit for *free from disease*. A clinical-grade pharmacogenomics platform that bridges the gap between a patient's genomic data and safer, evidence-based prescribing decisions.

---

## The Problem

Every day, clinicians prescribe medications without knowing how a patient's genome will respond to them. This is not a rare edge case — it is the default.

Adverse drug reactions (ADRs) account for approximately **700,000 emergency department visits in the United States annually**, and a significant proportion of these are genetically predictable. Drugs like Clopidogrel, Warfarin, Simvastatin, and Azathioprine have well-documented gene–drug interactions governed by enzymes such as CYP2C19, CYP2C9, SLCO1B1, and TPMT. Guidelines from CPIC (Clinical Pharmacogenomics Implementation Consortium) have existed for years. Yet at the point of care, this knowledge is almost never applied systematically.

The reasons are structural:
- Genomic data is locked in raw VCF files that clinicians cannot interpret
- Existing tools are either research-grade or enterprise cost-prohibitive
- Most AI-based proposals are opaque — a clinician cannot explain *why* a recommendation was made

The consequence: patients receive the wrong drug, at the wrong dose, based entirely on population averages — not their biology.

---

## Our Solution — NIRMAY

NIRMAY is a purpose-built pharmacogenomics decision-support platform. It accepts a patient's Variant Call Format (VCF) genomic file, maps detected variants against a curated CPIC guideline database, and returns structured, interpretable clinical assessments — one drug at a time.

The system is designed around three principles:

**1. Determinism over probability.**  
Clinical decisions cannot be left to probabilistic black boxes. NIRMAY's core engine is a rule-based system grounded in CPIC guidelines. Every risk flag is traceable to a specific rsID variant and a published guideline action. The output is auditable.

**2. Explainability as a first-class feature.**  
Each assessment surfaces the gene, the diplotype, the metabolizer phenotype, the risk rationale, and the recommended clinical action — not a score. A clinician reading the output understands *what* the finding means and *why* it matters.

**3. Minimum necessary data.**  
Genomic data is among the most sensitive personal information in existence. NIRMAY processes files through time-limited signed URLs and does not retain raw genomic sequences beyond the analysis window.

---

## Key Features

**Secure VCF Ingestion**
- Client-side format validation before upload (VCFv4.x header check, column structure)
- Files uploaded to isolated, private Supabase Storage buckets under user-scoped paths
- Access controlled via 1-hour signed URLs — data is never directly exposed

**CPIC-Grounded Risk Analysis**
- Deterministic lookup against a curated pharmacogenomics database covering 6 high-impact drug–gene pairs: Simvastatin/SLCO1B1, Warfarin/CYP2C9, Clopidogrel/CYP2C19, Azathioprine/TPMT, Fluorouracil/DPYD, Codeine/CYP2D6
- Risk stratification into Critical, High, Moderate, and Safe tiers with confidence scores
- Equity-aware logic for ethnicity-linked variant considerations (e.g., rs12777823 for African ancestry Warfarin dosing)

**Clinical-Grade User Interface**
- Command-center dashboard designed around cognitive load reduction for clinical readers
- Risk cards with progressive disclosure — summary visible at a glance, full genomic rationale available on expansion
- Animated analysis pipeline with stage-by-stage feedback so users know where in the process the system is

**Explainable AI Narrative Layer** *(implemented with guardrails)*
- Retrieval-Augmented Generation (RAG) pipeline using Pinecone vector search over CPIC guideline text
- Gemini-powered 3-sentence biological explanation grounded exclusively on retrieved clinical context
- Model cascade fallback — if primary model is unavailable, the system degrades gracefully to alternative models, then to a deterministic fallback message
- Explanations are constrained: the model is explicitly prohibited from recommending specific dosages

**Audit Trail**
- All upload events are logged to a `genomic_files` table with timestamps and processing status
- Row-Level Security (RLS) on all tables — users can only access their own records

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                  │
│   Next.js 14 App Router  ─────────────►  Supabase Auth (OAuth)  │
│   /dashboard (protected)               Google Identity Provider  │
│         │                                                        │
│         │  VCF File (validated client-side)                      │
│         ▼                                                        │
│   Supabase Storage  ◄──── user-scoped path ────── Signed URL    │
└───────────────────────────────┬──────────────────────────────────┘
                                │  POST /api/analyze
                                │  { vcf_url, drugs[] }
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Next.js API Route (Proxy)                     │
│                    /app/api/analyze/route.js                     │
│          Validates request, forwards to Python backend           │
└───────────────────────────────┬──────────────────────────────────┘
                                │  POST /api/v1/analyze-vcf
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Python)                       │
│                                                                  │
│   bio_parser  ──►  Download VCF via signed URL                  │
│       │             Parse variants with cyvcf2                   │
│       │                                                          │
│       ▼                                                          │
│   rules_engine  ──►  CPIC rsID lookup                           │
│       │              Risk + phenotype + clinical action          │
│       │                                                          │
│       ▼                                                          │
│   rag_agent  ──►  Pinecone semantic search (CPIC text chunks)   │
│                   Gemini LLM with constrained prompt             │
│                   Returns { summary, citations, model_used }     │
└───────────────────────────────┬──────────────────────────────────┘
                                │  JSON response
                                ▼
                   Dashboard renders RiskResults
                   (per drug: gene · diplotype · risk · action · explanation)
```

**Design principles:**
- The Next.js frontend never directly calls the Python backend — all traffic routes through the Next.js API layer, preserving the backend as a private service
- Each layer has a single, well-defined responsibility
- The system degrades gracefully at every boundary — if the AI layer fails, the deterministic result is still returned

---

## UI/UX Philosophy

NIRMAY is designed to feel like a clinical instrument, not a web app.

The dashboard follows a **command-center aesthetic**: dark background, high-contrast data hierarchy, and tight information density. This is deliberate. Clinicians and researchers reading genetic risk data need to trust the interface before they trust the output. An interface that looks like a consumer app undermines that trust.

Specific choices made:
- **Progressive disclosure** — risk severity is communicated at a glance (colour + label); full genomic evidence is one click away. Cognitive load is minimized at the summary level.
- **Monospace typography for genomic data** — rsIDs, diplotypes, and variant strings are rendered in monospace to reinforce precision and reduce misreading.
- **Animated pipeline feedback** — the analysis pipeline stages (parse → rules → LLM → compile) are shown in sequence during processing. Users know the system is working, and *what* it is doing.
- **State-driven layout** — the interface moves cleanly between: awaiting upload → processing → results, with no jarring reloads or modal interruptions.

---

## Security & Ethical Commitments 🛡️

Genomic data is not ordinary health data. It is permanent, heritable, and uniquely identifying. NIRMAY is designed with this weight in mind.

| Principle | Implementation |
|---|---|
| Minimum data retention | Raw VCF files are accessed via 1-hour signed URLs. NIRMAY does not store genomic sequences in any long-term database table. |
| User-scoped isolation | Every file is stored under `{user_id}/{timestamp}_{filename}` in Supabase Storage. Storage RLS policies enforce that users cannot access each other's files. |
| No public bucket exposure | The `vcf_uploads` bucket is private. All access requires a valid signed URL generated from an authenticated session. |
| Least privilege | Database RLS ensures each user can only SELECT and INSERT their own records. No cross-user data access is possible at the application layer. |
| Constrained AI output | The LLM is given a strict system prompt: explain the mechanism, cite the variant, do not recommend dosage. This prevents the model from generating actionable medical advice. |
| Transparency | Every risk card surfaces its guideline source (CPIC), confidence score, and the specific variant(s) that triggered the flag. Nothing is hidden inside a score. |

NIRMAY is a decision-support tool. It surfaces evidence. The clinical decision remains with the clinician.

---

## What Makes NIRMAY Different

Most pharmacogenomics tools in the hackathon space fall into one of two traps: they are either pure rule-lookup tables with no intelligence layer, or they are LLM wrappers with no grounding in clinical evidence. NIRMAY deliberately occupies neither.

**Determinism is the foundation, not a limitation.**  
The rules engine is the medical source of truth. It does not guess, it does not estimate — it maps a variant to a CPIC-published outcome with 0.95–0.99 confidence. The AI layer adds explanatory language *around* this, not instead of it.

**The AI layer is constrained by design.**  
The Gemini model receives only retrieved CPIC text as its context and is explicitly told what it cannot do. It cannot recommend a dose. It cannot introduce external knowledge. This is not a limitation of the demo — it is the correct architecture for clinical AI.

**The system is demonstrable end-to-end.**  
The full pipeline — VCF upload → validation → analysis → risk card display — works in real time with a test VCF file. There are no mock responses served to judges. The output shown is the output produced.

**The UX communicates trust.**  
Clinical software needs to feel reliable. The design, information hierarchy, and error handling are all built with the assumption that a real clinician might one day interact with this system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, JSX, React Server Components) |
| Styling | Tailwind CSS, Framer Motion |
| Authentication | Supabase Auth — Google OAuth 2.0 |
| Storage | Supabase Storage (private bucket, signed URLs) |
| Database | Supabase PostgreSQL (RLS-enforced) |
| API Proxy | Next.js Route Handlers |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Bioinformatics | cyvcf2 (VCF parsing) |
| Deterministic Engine | Custom CPIC rules engine (Python) |
| Vector Search | Pinecone (`niramay-cpic` index, 768-dim embeddings) |
| LLM | Google Gemini (constrained RAG, model cascade) |
| Containerisation | Docker |

---

## Hackathon Scope & Roadmap

### Phase 1 — Foundation ✅ Completed
- Next.js 14 application with App Router
- Google OAuth via Supabase, session persistence, protected routes
- VCF upload pipeline: client-side validation → Supabase Storage → signed URL generation
- Clinical dashboard UI with command-center aesthetic

### Phase 2 — Deterministic Analysis Engine ✅ Completed
- FastAPI backend with `/api/v1/analyze-vcf` endpoint
- cyvcf2-based VCF parser
- CPIC rules engine covering 6 drug–gene pairs with equity-aware logic
- Next.js API proxy layer connecting frontend to backend

### Phase 3 — Explainability Layer ✅ Implemented (with guardrails)
- Pinecone vector index with CPIC guideline text chunks
- Gemini-powered 3-sentence biological explanation per drug–gene pair
- Constrained prompt engineering preventing unsupported medical claims
- Model cascade fallback for resilience

### Phase 4 — Future Scope 🔭 Planned
- Population-level genomic frequency overlays (gnomAD integration)
- Multi-patient cohort analysis for institutional use
- EHR system integration (HL7 FHIR-compatible output)
- Polygenic risk score support
- Clinical audit reports (PDF export)
- Clinician annotation layer — human-in-the-loop review

---

## Running the Project

### Prerequisites
- Node.js 18+
- Python 3.11+
- A Supabase project with Google OAuth and a `vcf_uploads` storage bucket
- A `.env.local` file in `/niramay` and a `.env` file in `/backend`

### Frontend

```bash
cd niramay
npm install
npm run dev
```

Open `http://localhost:3000`. Sign in with Google to access the dashboard.

### Backend

**Option A — Docker (recommended)**
```bash
cd backend
docker build -t niramay-backend .
docker run -p 8000:8000 --env-file .env niramay-backend
```

**Option B — Direct (development)**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Environment Variables

`niramay/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
BACKEND_URL=http://localhost:8000
```

`backend/.env`
```
GEMINI_API_KEY=<your_gemini_key>
PINECONE_API_KEY=<your_pinecone_key>
```

### Testing

A sample VCF file with high-risk variants (rs4149056, rs4244285) is provided at `testing/high_risk_sample.vcf` for end-to-end demo validation.

---

## Disclaimer ⚕️

NIRMAY is a research and educational prototype developed for hackathon evaluation purposes. It is not a certified medical device, clinical decision support system, or therapeutic recommendation engine under any regulatory framework (FDA, CE, CDSCO, or equivalent).

The system is designed to demonstrate software architecture, genomic data handling, and responsible AI integration in a clinical domain. It must not be used to inform real patient care decisions.

All pharmacogenomic risk assessments produced by this system are for demonstration only.

---

<div align="center">

**Built with clinical seriousness. Designed for the real world.**

</div>
