# Niramay (निरामय) 🧬
**A Neuro-Symbolic Pharmacogenomics Clinical Decision Support System**

> *Niramay (निरामय): Completely free from illness, untainted by disease or toxicity.*

Niramay is a state-of-the-art Pharmacogenomic Clinical Decision Support System (CDSS) built for the **RIFT 2026 Hackathon (HealthTech Track)**. [cite_start]Utilizing a novel **Neuro-Symbolic AI architecture**, Niramay completely bypasses the hallucination risks of predictive machine learning. It pairs a deterministic, rule-based inference engine for clinical dosage calculations with a highly constrained, multi-evidence RAG LLM layer to deliver safe, explainable, and culturally equitable genomic insights.

## 🏆 Mandatory Submission Links
* **Live Application URL:** [Insert Vercel/Render Link Here]
* **LinkedIn Video Demonstration:** [Insert LinkedIn Public Video Link Here] *(Tags: #RIFT2026 #PharmaGuard #Pharmacogenomics #AIinHealthcare)*
* **Sample VCF Files:** Located in `/test-data`

---

## 🚀 Core Innovations & Differentiators

While legacy systems rely on probabilistic ML or brittle rule engines, Niramay introduces three major clinical informatics breakthroughs:

1. **Neuro-Symbolic Architecture:** We strictly bifurcate our logic. [cite_start]A deterministic "Symbolic Core" handles all mathematical CPIC dose calculations to guarantee 100% accuracy[cite: 828, 873]. [cite_start]An LLM "Neural Cortex" (via Gemini API) is restricted solely to explaining the biological mechanism using Pinecone-retrieved literature[cite: 828, 887, 890].
2. **Health Equity & Diversity Algorithms:** Legacy tools often overdose patients of African ancestry by ignoring multigenic factors. [cite_start]Niramay explicitly checks for the `rs12777823` variant in Warfarin dosing and mandates concurrent `NUDT15` evaluation for Azathioprine, ensuring equitable care across all ethnicities[cite: 833, 835, 836].
3. **CYP2D6 Read-Depth Heuristic:** Standard VCF parsers miss fatal whole-gene deletions (*5) in the highly polymorphic CYP2D6 gene. We engineered a custom bioinformatics heuristic to evaluate the `DP` (Depth) tag against stable housekeeping genes to flag structural variations that others miss[cite: 839, 841].
4. **Combating Alert Fatigue:** Our Next.js UI implements a strict "Traffic Light" progressive disclosure model. Safe (Green) drugs are minimized, while Toxic (Red) alerts forcefully command attention, preventing clinical desensitization[cite: 862, 868].

---

## 🏗️ System Architecture 

Niramay utilizes a decoupled, high-performance microservices architecture:

* [cite_start]**Frontend (Next.js & Firebase):** * Handles user authentication and secure Firebase VCF storage[cite: 855].
  * [cite_start]Executes client-side VCF pre-validation (`FileReader`) to strictly enforce the 5MB limit and `##fileformat=VCFv4.2` compliance before server ingestion[cite: 857, 859, 860].
* **Bioinformatics Engine (Python / FastAPI / `cyvcf2`):**
  * [cite_start]Parses raw VCF files rapidly, extracting `GENE`, `RS` (rsID), and `GT` (phasing) tags[cite: 874, 875, 876]. 
  * [cite_start]Maps mutations to Star Alleles, calculates Activity Scores, and determines clinical Phenotypes[cite: 879].
* **Intelligence Layer (Pinecone Vector DB + Gemini API):**
  * [cite_start]**Retrieval:** Queries Pinecone to fetch exact biological pathways from official CPIC guidelines[cite: 887, 888].
  * [cite_start]**Generation:** Uses the Gemini API with strict guardrails to generate a 3-sentence explanation citing the specific diplotype, strictly forbidding hallucinated dosages[cite: 890, 892].

---

## 💻 Tech Stack
* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Backend:** Python, FastAPI, Uvicorn, Docker
* [cite_start]**Genomics & Data:** `cyvcf2` (VCF Parsing) [cite: 874]
* [cite_start]**AI & Search:** Google Gemini API, Pinecone (Vector Database) [cite: 884]
* [cite_start]**Cloud & Storage:** Vercel (Frontend), Render (FastAPI Docker Container), Firebase (Auth & Storage) [cite: 853, 872]

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/niramay.git](https://github.com/yourusername/niramay.git)
cd niramay
2. Frontend Setup (Next.js)
Bash
cd frontend
npm install
# Create a .env.local file with your Firebase config
npm run dev
3. Backend Setup (FastAPI)
Requires Python 3.9+ and C-compilers for cyvcf2.

Bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create a .env file with your Gemini API and Pinecone keys
uvicorn main:app --reload

🔮 Future Scope (Phase 2 Architecture)
While our MVP utilizes a highly optimized Pinecone vector database for semantic Retrieval-Augmented Generation (RAG), our production roadmap includes transitioning to a GraphRAG architecture.


Neo4j Biomedical Knowledge Graph: We will explicitly map node-edge relationships between 100+ pharmacogenes, variants, and drug phenotypes to unlock complex "multi-hop reasoning" capabilities.


Phenoconversion Engine: Integrating Flockhart tables to account for dynamic Drug-Drug-Gene interactions (e.g., modifying genetic Activity Scores if a patient is taking a CYP2D6 inhibitor like Fluoxetine).
+1


WebGL Network Visualizations: GPU-accelerated 3D rendering of complex metabolic pathways using Sigma.js.

👥 Team Members
Frosty Coder - Lead Developer (Architecture & Bioinformatics)

Sudhanshu Kumar - Frontend & Firebase Engineer

[Teammate 3 Name] - Prompt Engineering & RAG Implementation

Built with precision for the RIFT 2026 Hackathon.
