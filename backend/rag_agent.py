# rag_agent.py
import os
import google.generativeai as genai

# The API key will be passed via Docker environment variables
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def retrieve_cpic_context(drug, phenotype):
    """
    Simulates querying a Pinecone Vector DB for official CPIC guidelines.
    (Replace the mock dictionary with actual Pinecone queries once your index is populated).
    """
    drug = drug.upper()
    mock_pinecone_db = {
        "SIMVASTATIN": "The SLCO1B1 gene encodes OATP1B1, a hepatic membrane transporter. The *5 variant significantly reduces transporter efficacy, impairing the cellular uptake of simvastatin into the liver. This causes elevated systemic plasma concentrations, drastically increasing the risk of myopathy and rhabdomyolysis.",
        "CLOPIDOGREL": "CYP2C19 is a hepatic enzyme essential for converting the prodrug clopidogrel into its active thiol metabolite. Poor metabolizers exhibit significantly reduced active metabolite formation, leading to impaired platelet inhibition and a higher risk of stent thrombosis.",
        "WARFARIN": "CYP2C9 is the primary enzyme responsible for the metabolic clearance of the more potent S-warfarin enantiomer. Variants like *2 and *3 severely reduce catalytic efficiency, prolonging the drug's half-life and precipitating severe hemorrhagic bleeding events if standard doses are given."
    }
    
    return mock_pinecone_db.get(drug, "Biological mechanism is documented in CPIC guidelines.")

def generate_explanation(drug, primary_gene, phenotype, diplotype):
    """
    The Neural Cortex: Generates a safe, 3-sentence biological explanation based ONLY on retrieved facts.
    """
    # 1. Retrieve the medical fact (RAG)
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
    
    try:
        # Using gemini-1.5-flash for ultra-fast, cheap, sub-second generation
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        return {
            "summary": response.text.strip(),
            "citations": ["CPIC Database", "PharmGKB"]
        }
    except Exception as e:
        return {
            "summary": f"Explanation generation temporarily unavailable. Mechanism relies on {primary_gene} pathway.",
            "error": str(e)
        }