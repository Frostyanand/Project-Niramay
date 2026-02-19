"""
Model Tester: Tests all candidate Gemini models with a pharmacogenomics prompt.
Outputs which models work and which fail.
"""
import os
from google import genai
from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Candidate text-generation models (filtered from full list)
CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite-001",
    "gemini-2.0-flash-lite",
    "gemini-exp-1206",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash-preview-09-2025",
    "gemini-2.5-flash-lite-preview-09-2025",
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
]

SAMPLE_PROMPT = """You are a clinical pharmacogenomics expert. Explain the biological mechanism of risk for a patient taking SIMVASTATIN with a SLCO1B1 *5/*5 diplotype (Poor Function).

STRICT RULES:
1. Explain WHY the genetic variant alters metabolism or transport.
2. Explicitly cite the patient's *5/*5 diplotype.
3. DO NOT recommend a specific dosage.
4. Keep the explanation to exactly 3 sentences."""

working = []
failed = []

for model_name in CANDIDATE_MODELS:
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=SAMPLE_PROMPT
        )
        text = response.text.strip()
        if text and len(text) > 20:
            working.append(model_name)
            print(f"✅ {model_name} — OK ({len(text)} chars)")
        else:
            failed.append((model_name, "Empty or too short response"))
            print(f"⚠️ {model_name} — Empty response")
    except Exception as e:
        err = str(e)[:80]
        failed.append((model_name, err))
        print(f"❌ {model_name} — {err}")

print("\n" + "="*60)
print(f"WORKING MODELS ({len(working)}):")
for m in working:
    print(f"  ✅ {m}")
print(f"\nFAILED MODELS ({len(failed)}):")
for m, reason in failed:
    print(f"  ❌ {m}: {reason}")
print("="*60)

# Save working models to file
with open("working_models.txt", "w") as f:
    f.write("\n".join(working))
print(f"\nSaved {len(working)} working models to working_models.txt")
