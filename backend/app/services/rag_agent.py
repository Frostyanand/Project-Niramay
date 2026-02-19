# app/services/rag_agent.py
import os
import logging
from google import genai
from google.genai import types
from pinecone import Pinecone

# Configure logging for debug visibility
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("rag_agent")

# Initialize clients (API keys injected via Docker --env-file)
gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Pinecone Vector DB
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index("niramay-cpic")

# ─── MODEL FALLBACK ARRAY ─────────────────────────────────────────────
# Tested on 2026-02-19 with a pharmacogenomics prompt.
# Ordered by preference: fastest/cheapest first, heavier models as backup.
# If ALL fail, the system returns a safe fallback message.
GEMINI_MODEL_CASCADE = [
    "gemini-2.5-flash",               # Primary: Best speed/quality ratio
    "gemini-2.5-flash-lite",           # Backup 1: Lighter, still fast
    "gemini-flash-latest",             # Backup 2: Alias for latest flash
    "gemini-flash-lite-latest",        # Backup 3: Alias for latest lite
    "gemini-3-flash-preview",          # Backup 4: Next-gen preview
    "gemini-2.5-flash-lite-preview-09-2025",  # Backup 5: Older preview
]

# ─── EMBEDDING MODEL ──────────────────────────────────────────────────
EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768  # Must match Pinecone index dimensions


def retrieve_cpic_context(drug, phenotype):
    """
    Queries the live Pinecone 'niramay-cpic' index using semantic search.
    Embeds the query, then retrieves the top-matching CPIC guideline chunk.
    """
    query_text = f"{drug} {phenotype} pharmacogenomic mechanism biological pathway"
    logger.info(f"[RAG] Embedding query: '{query_text[:60]}...'")

    try:
        query_embedding = gemini_client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=query_text,
            config=types.EmbedContentConfig(output_dimensionality=EMBEDDING_DIMENSIONS)
        )
        query_vector = query_embedding.embeddings[0].values

        results = index.query(
            vector=query_vector,
            top_k=1,
            include_metadata=True,
            filter={"drug": {"$eq": drug.upper()}}
        )

        if results.matches:
            score = results.matches[0].score
            text = results.matches[0].metadata.get("text", "No context found.")
            logger.info(f"[RAG] Pinecone hit: score={score:.4f}, drug={drug}")
            return text

    except Exception as e:
        logger.warning(f"[RAG] Pinecone query failed: {e}")

    logger.warning(f"[RAG] No Pinecone context found for {drug}. Using fallback.")
    return f"No specific CPIC context found for {drug}. Consult official guidelines."


def generate_explanation(drug, primary_gene, phenotype, diplotype):
    """
    The Neural Cortex: Generates a safe, 3-sentence biological explanation
    grounded ONLY on retrieved Pinecone context (RAG pattern).
    Uses cascading model fallback for resilience.
    """
    # 1. Retrieve the medical fact from Pinecone (RAG)
    context = retrieve_cpic_context(drug, phenotype)

    # 2. Construct the constrained prompt
    prompt = f"""
    You are a clinical pharmacogenomics expert. Explain the biological mechanism of risk for a patient taking {drug} with a {primary_gene} {diplotype} diplotype ({phenotype}). 
    
    STRICT RULES:
    1. ONLY use the provided clinical context: "{context}"
    2. Explain WHY the genetic variant alters metabolism or transport.
    3. Explicitly cite the patient's {diplotype} diplotype.
    4. DO NOT recommend a specific dosage.
    5. Keep the explanation to exactly 3 sentences.
    """

    # 3. Cascade through models until one works
    for i, model_name in enumerate(GEMINI_MODEL_CASCADE):
        try:
            logger.info(f"[LLM] Attempting model {i+1}/{len(GEMINI_MODEL_CASCADE)}: {model_name}")
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            text = response.text.strip()

            if text and len(text) > 20:
                logger.info(f"[LLM] ✅ Success with '{model_name}' ({len(text)} chars)")
                return {
                    "summary": text,
                    "citations": ["CPIC Database", "PharmGKB"],
                    "rag_source": "pinecone/niramay-cpic",
                    "model_used": model_name
                }
            else:
                logger.warning(f"[LLM] ⚠️ '{model_name}' returned empty/short response. Trying next...")

        except Exception as e:
            logger.warning(f"[LLM] ❌ '{model_name}' failed: {str(e)[:100]}. Trying next...")
            continue

    # 4. ALL models exhausted — return safe fallback
    logger.error(f"[LLM] 🚨 ALL {len(GEMINI_MODEL_CASCADE)} models failed for {drug}. API key may need refresh.")
    return {
        "summary": f"Explanation generation temporarily unavailable. The {primary_gene} {diplotype} diplotype ({phenotype}) affects {drug} metabolism. Consult CPIC guidelines for clinical guidance.",
        "citations": ["CPIC Database"],
        "rag_source": "pinecone/niramay-cpic",
        "model_used": "FALLBACK_NONE",
        "error": "All Gemini models exhausted. Please refresh API key or check quota."
    }
