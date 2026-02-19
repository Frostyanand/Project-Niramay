# app/services/rag_agent.py
import os
import random
import asyncio
import logging
import time
from concurrent.futures import ThreadPoolExecutor
from google import genai
from google.genai import types
from pinecone import Pinecone

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("rag_agent")

# ─── MULTI-KEY INITIALIZATION ─────────────────────────────────────────
_raw_keys = os.environ.get("GEMINI_API_KEY", "")
GEMINI_API_KEYS = [k.strip() for k in _raw_keys.split(",") if k.strip()]

if not GEMINI_API_KEYS:
    logger.error("[INIT] 🚨 No GEMINI_API_KEY found!")
else:
    logger.info(f"[INIT] Loaded {len(GEMINI_API_KEYS)} Gemini API key(s)")

GEMINI_CLIENTS = [genai.Client(api_key=key) for key in GEMINI_API_KEYS]
_dead_key_indices = set()

# Dedicated ThreadPool for parallel processing (at least 20 workers)
# This prevents asyncio from being bottle-necked by a small default pool.
EXECUTOR = ThreadPoolExecutor(max_workers=30)

def _get_live_clients():
    live = [(i, c) for i, c in enumerate(GEMINI_CLIENTS) if i not in _dead_key_indices]
    if not live:
        logger.warning("[KEY-POOL] All keys marked dead. Resetting pool...")
        _dead_key_indices.clear()
        live = list(enumerate(GEMINI_CLIENTS))
    random.shuffle(live)
    return live

def _mark_key_dead(index, error_msg):
    if index not in _dead_key_indices:
        _dead_key_indices.add(index)
        logger.warning(f"[KEY-POOL] 🔑 Key #{index+1} marked DEAD: {error_msg}. "
                       f"{len(GEMINI_CLIENTS) - len(_dead_key_indices)} remaining.")

def _is_key_error(error_str):
    """Detects if an error is related to the API key itself or general quota (429)."""
    error_str = error_str.lower()
    key_errors = [
        "api key expired", "api key not valid", "invalid_argument", 
        "api_key_invalid", "permission_denied", "forbidden", "400",
        "resource_exhausted", "429", "quota"
    ]
    return any(e in error_str for e in key_errors)

# Pinecone Vector DB
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index("niramay-cpic")

GEMINI_MODEL_CASCADE = [
    "gemini-2.0-flash",           # New 2.0 Flash is faster
    "gemini-2.5-flash", 
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
]

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768


def _embed_query(query_text):
    """Embed query with key cascade + retries."""
    for idx, client in _get_live_clients():
        try:
            result = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=query_text,
                config=types.EmbedContentConfig(output_dimensionality=EMBEDDING_DIMENSIONS)
            )
            return result.embeddings[0].values
        except Exception as e:
            err = str(e)
            if _is_key_error(err):
                _mark_key_dead(idx, err[:60])
                continue
            logger.warning(f"[EMBED] Transient error with key #{idx+1}: {err[:80]}")
    return None


def _retrieve_cpic_context_sync(drug, phenotype):
    """Queries Pinecone with retry for SSL/Network issues."""
    query_text = f"{drug} {phenotype} pharmacogenomic mechanism biological pathway"
    
    # 1. Embed query (cascading keys)
    query_vector = _embed_query(query_text)
    if query_vector is None:
        return ""

    # 2. Query Pinecone with retry logic
    for attempt in range(3):
        try:
            results = index.query(
                vector=query_vector,
                top_k=1,
                include_metadata=True,
                filter={"drug": {"$eq": drug.upper()}}
            )
            if results.matches:
                return results.matches[0].metadata.get("text", "")
            break
        except Exception as e:
            logger.warning(f"[PINE] Attempt {attempt+1} failed for {drug}: {str(e)[:60]}")
            time.sleep(1) # Small delay before retry
    
    return ""


def _generate_explanation_sync(drug, primary_gene, phenotype, diplotype):
    """Core RAG+LLM sync pipeline."""
    context = _retrieve_cpic_context_sync(drug, phenotype)
    
    # Improved fallback context if RAG yields nothing
    if not context:
        context = (f"The {drug} mechanism involves changes in drug metabolism or transport "
                  f"regulated by the {primary_gene} pathway. Genetic variations like {diplotype} "
                  f"can significantly alter the pharmacokinetics of this drug.")

    prompt = f"""You are a clinical pharmacogenomics expert. Explain the biological mechanism of risk for a patient taking {drug} with a {primary_gene} {diplotype} diplotype ({phenotype}). 

STRICT RULES:
1. ONLY use the provided context: "{context}"
2. Explain WHY the genetic variant alters metabolism or transport.
3. Explicitly cite the patient's {diplotype} diplotype.
4. DO NOT recommend a specific dosage.
5. Keep the explanation to exactly 3 sentences.
6. NO INTRODUCTIONS. Start directly with the explanation."""

    # Key Cascade (Outer) x Model Cascade (Inner)
    for idx, client in _get_live_clients():
        for model_name in GEMINI_MODEL_CASCADE:
            try:
                response = client.models.generate_content(model=model_name, contents=prompt)
                text = response.text.strip()
                if text and len(text) > 30:
                    logger.info(f"[LLM] ✅ {drug}: Success with {model_name} (key#{idx+1})")
                    return {
                        "summary": text,
                        "citations": ["CPIC Database", "PharmGKB"],
                        "model_used": model_name
                    }
            except Exception as e:
                err = str(e)
                if _is_key_error(err):
                    _mark_key_dead(idx, err[:60])
                    break # Skip to next key
                continue # Try next model with same key
    
    return {
        "summary": f"The {primary_gene} {diplotype} diplotype affects {drug} metabolism.",
        "citations": ["CPIC Database"],
        "error": "All keys/models exhausted."
    }


async def generate_explanation_async(drug, primary_gene, phenotype, diplotype):
    """Runs the sync pipeline in the large ThreadPoolExecutor."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        EXECUTOR, 
        _generate_explanation_sync, 
        drug, primary_gene, phenotype, diplotype
    )
