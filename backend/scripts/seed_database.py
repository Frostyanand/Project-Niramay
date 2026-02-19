import os
import uuid
import asyncio
from google import genai
from pinecone import Pinecone
from dotenv import load_dotenv

# Initialize environment and API keys
load_dotenv()

# New Google GenAI Client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Pinecone Initialization
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index("niramay-cpic")

# 1. Comprehensive Medical Corpus
clinical_corpus = {
    "CODEINE_CYP2D6": """
        Codeine is a weak opioid analgesic that functions as a prodrug. To exert analgesic effects, it must be 
        biologically activated through hepatic metabolism into morphine by the cytochrome P450 2D6 (CYP2D6) 
        enzyme. Genetic polymorphisms in CYP2D6 drastically alter morphine exposure. Poor Metabolizers 
        (e.g., *4/*4) lack enzymatic activity and cannot convert codeine to morphine, resulting in therapeutic 
        failure. Conversely, Ultrarapid Metabolizers (e.g., *1xN) exhibit accelerated activity, causing 
        dangerous spikes in systemic morphine that pose life-threatening risks of respiratory depression.
    """,
    "WARFARIN_CYP2C9": """
        Warfarin acts by inhibiting the vitamin K epoxide reductase complex (VKORC1). The hepatic enzyme 
        CYP2C9 is primarily responsible for the metabolic clearance of the potent S-warfarin enantiomer. 
        Polymorphic variants like *2 and *3 induce structural changes that substantially reduce catalytic 
        efficiency. Intermediate and Poor Metabolizers exhibit significantly prolonged biological half-lives. 
        Administering standard doses to these patients causes supratherapeutic accumulation, drastically 
        elevating the International Normalized Ratio (INR) and precipitating fatal hemorrhagic events.
    """,
    "CLOPIDOGREL_CYP2C19": """
        Clopidogrel is an inactive thienopyridine prodrug requiring two sequential oxidative steps in the liver 
        to generate its active thiol metabolite. The CYP2C19 enzyme is the principal catalyst for this 
        bioactivation. Loss-of-function alleles, notably *2 and *3, render the enzyme catalytically inactive. 
        Intermediate and Poor Metabolizers fail to yield sufficient active metabolite concentrations, resulting 
        in inadequate inhibition of platelet aggregation and precipitating fatal stent thrombosis or stroke.
    """,
    "SIMVASTATIN_SLCO1B1": """
        The SLCO1B1 gene encodes the organic anion-transporting polypeptide 1B1 (OATP1B1), a crucial hepatic 
        membrane influx transporter responsible for facilitating the active cellular uptake of statins like 
        simvastatin from the blood into the liver. The *5 variant (rs4149056) significantly diminishes the 
        functional transport capacity of OATP1B1. Affected patients (Decreased or Poor Function) experience 
        impaired hepatic uptake, leading to massive concentrations of simvastatin acid in the plasma, which 
        are profoundly myotoxic and precipitate life-threatening rhabdomyolysis.
    """,
    "AZATHIOPRINE_TPMT": """
        Azathioprine is a prodrug rapidly converted into 6-mercaptopurine and subsequently into cytotoxic 
        6-thioguanine nucleotides (6-TGNs). The enzyme TPMT acts as a critical competing inactivating pathway. 
        Genetic defects in TPMT (*3A, *3C) shift metabolism pathologically toward the active 6-TGN pathway. 
        In Poor Metabolizers, this leads to a massive, unregulated accumulation of 6-TGNs in hematopoietic 
        tissues, inducing fatal hematopoietic toxicity and profound bone marrow suppression (aplasia).
    """,
    "FLUOROURACIL_DPYD": """
        Fluorouracil (5-FU) is a highly toxic antineoplastic agent. The dihydropyrimidine dehydrogenase (DPYD) 
        enzyme is the primary rate-limiting step in its systemic catabolism, degrading over 80% of the dose. 
        Patients with decreased or non-functional DPYD alleles (e.g., *2A) possess a profound inability to 
        clear the drug. Standard oncology doses lead to massively prolonged systemic exposure, resulting in 
        lethal adverse events like grade 4 neutropenia, devastating mucosal barrier injury, and mucositis.
    """
}

def semantic_chunker(text, size=300, overlap=50):
    words = text.split()
    return [" ".join(words[i:i + size]) for i in range(0, len(words), size - overlap)]

def seed_niramay_db():
    print("🚀 Initializing Neuro-Symbolic Seeding...")
    payloads = []

    for key, text in clinical_corpus.items():
        drug, gene = key.split("_")
        chunks = semantic_chunker(text)
        
        for i, chunk in enumerate(chunks):
            # Generate vectors using Google's gemini-embedding-001
            # Native output is 3072, truncated to 768 to match Pinecone index
            from google.genai import types
            res = client.models.embed_content(
                model="gemini-embedding-001",
                contents=chunk,
                config=types.EmbedContentConfig(output_dimensionality=768)
            )
            embedding = res.embeddings[0].values

            payloads.append({
                "id": f"{key}_chunk_{i}_{uuid.uuid4().hex[:4]}",
                "values": embedding,
                "metadata": {
                    "drug": drug,
                    "gene": gene,
                    "text": chunk,
                    "source": "CPIC Official Guidelines 2025 Standard"
                }
            })

    # Batch upload to Pinecone
    print(f"📦 Uploading {len(payloads)} high-fidelity medical vectors...")
    index.upsert(vectors=payloads)
    print("✅ Niramay Knowledge Base is officially Online. System ready for live RAG.")

if __name__ == "__main__":
    seed_niramay_db()