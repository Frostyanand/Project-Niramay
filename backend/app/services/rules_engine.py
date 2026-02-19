# app/services/rules_engine.py

# CPIC Exhaustive Lookup Tables (The "Symbolic Core")
CPIC_DATABASE = {
    "SIMVASTATIN": {
        "target_gene": "SLCO1B1",
        "variants": {
            "rs4149056": {
                "star": "*5", "phenotype": "Poor Function", "risk": "Toxic", "severity": "critical",
                "action": "Prescribe alternative statin (e.g., Rosuvastatin). High risk of rhabdomyolysis.",
                "dosing": "Contraindicated at standard doses. If statin required, use Rosuvastatin ≤20mg or Pravastatin.",
                "alternatives": ["Rosuvastatin", "Pravastatin", "Fluvastatin"]
            }
        },
        "wild_type": {
            "star": "*1/*1", "phenotype": "Normal Function", "risk": "Safe", "severity": "none",
            "action": "Standard simvastatin prescribing protocols. Normal myopathy risk.",
            "dosing": "Standard dosing per clinical guidelines. No pharmacogenomic dose adjustment needed.",
            "alternatives": []
        }
    },
    "WARFARIN": {
        "target_gene": "CYP2C9",
        "variants": {
            "rs1799853": {
                "star": "*2", "phenotype": "Intermediate Metabolizer", "risk": "Adjust Dosage", "severity": "moderate",
                "action": "Decrease calculated initial dose by 15-30%. Monitor INR closely.",
                "dosing": "Reduce initial dose by 15-30% from calculated dose. Use FDA-approved warfarin dosing algorithm incorporating CYP2C9 genotype.",
                "alternatives": ["Direct Oral Anticoagulants (DOACs)", "Apixaban", "Rivaroxaban"]
            },
            "rs1057910": {
                "star": "*3", "phenotype": "Poor Metabolizer", "risk": "Adjust Dosage", "severity": "high",
                "action": "Decrease calculated initial dose by 20-40%. Extreme caution regarding hemorrhage risk.",
                "dosing": "Reduce initial dose by 20-40%. Increase INR monitoring frequency. Consider DOAC alternative.",
                "alternatives": ["Apixaban", "Rivaroxaban", "Edoxaban"]
            }
        },
        "wild_type": {
            "star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none",
            "action": "Initiate standard dosing protocols based on clinical factors.",
            "dosing": "Standard dosing per clinical guidelines. No pharmacogenomic dose adjustment needed.",
            "alternatives": []
        }
    },
    "CLOPIDOGREL": {
        "target_gene": "CYP2C19",
        "variants": {
            "rs4244285": {
                "star": "*2", "phenotype": "Poor Metabolizer", "risk": "Ineffective", "severity": "critical",
                "action": "Avoid clopidogrel. Use alternative P2Y12 inhibitor (Prasugrel or Ticagrelor).",
                "dosing": "Do not use clopidogrel. Switch to Prasugrel 10mg/day or Ticagrelor 90mg BID.",
                "alternatives": ["Prasugrel", "Ticagrelor"]
            },
            "rs4986893": {
                "star": "*3", "phenotype": "Poor Metabolizer", "risk": "Ineffective", "severity": "critical",
                "action": "Avoid clopidogrel. Use alternative P2Y12 inhibitor.",
                "dosing": "Do not use clopidogrel. Switch to Prasugrel or Ticagrelor.",
                "alternatives": ["Prasugrel", "Ticagrelor"]
            }
        },
        "wild_type": {
            "star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none",
            "action": "Initiate standard dosing (75 mg/day).",
            "dosing": "Standard 75 mg/day maintenance dose. No pharmacogenomic dose adjustment needed.",
            "alternatives": []
        }
    },
    "AZATHIOPRINE": {
        "target_gene": "TPMT",
        "variants": {
            "rs1142345": {
                "star": "*3C", "phenotype": "Poor Metabolizer", "risk": "Toxic", "severity": "critical",
                "action": "Contraindication for thiopurines. Reduce dose to 10% of standard or avoid.",
                "dosing": "Reduce dose to 10% of standard (3x/week) or consider alternative immunosuppressant. Mandatory NUDT15 evaluation for Asian/Hispanic descent.",
                "alternatives": ["Mycophenolate mofetil", "Methotrexate"]
            },
            "rs1800460": {
                "star": "*3A", "phenotype": "Poor Metabolizer", "risk": "Toxic", "severity": "critical",
                "action": "Contraindication for thiopurines. Reduce dose to 10% of standard.",
                "dosing": "Reduce dose to 10% of standard. Monitor CBC weekly for first 8 weeks.",
                "alternatives": ["Mycophenolate mofetil", "Methotrexate"]
            }
        },
        "wild_type": {
            "star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none",
            "action": "Initiate standard dosing. Ensure NUDT15 is also wild-type.",
            "dosing": "Standard dosing per clinical guidelines. No pharmacogenomic dose adjustment needed.",
            "alternatives": []
        }
    },
    "FLUOROURACIL": {
        "target_gene": "DPYD",
        "variants": {
            "rs3918290": {
                "star": "*2A", "phenotype": "Poor Metabolizer", "risk": "Toxic", "severity": "critical",
                "action": "Extreme risk of severe/fatal toxicity. Avoid 5-FU. Use alternative regimens.",
                "dosing": "Do NOT administer 5-FU or capecitabine. Use alternative non-fluoropyrimidine chemotherapy.",
                "alternatives": ["Raltitrexed", "Tegafur (with close monitoring)"]
            }
        },
        "wild_type": {
            "star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none",
            "action": "Standard 5-FU dosing protocols. Normal risk for toxicity.",
            "dosing": "Standard dosing per clinical guidelines. No pharmacogenomic dose adjustment needed.",
            "alternatives": []
        }
    },
    "CODEINE": {
        "target_gene": "CYP2D6",
        "variants": {
            "rs3892097": {
                "star": "*4", "phenotype": "Poor Metabolizer", "risk": "Ineffective", "severity": "high",
                "action": "Avoid codeine due to lack of efficacy. Use alternative non-tramadol option.",
                "dosing": "Do not use codeine or tramadol. Use morphine, oxycodone, or non-opioid analgesic.",
                "alternatives": ["Morphine", "Oxycodone", "Non-opioid analgesics (NSAIDs)"]
            }
        },
        "wild_type": {
            "star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none",
            "action": "Use codeine label-recommended age- or weight-specific dosing.",
            "dosing": "Standard dosing per clinical guidelines. No pharmacogenomic dose adjustment needed.",
            "alternatives": []
        }
    }
}

def evaluate_risk(parsed_vcf_data, requested_drugs):
    variants = parsed_vcf_data.get("variants", [])
    assessments = []

    # Fast lookup for patient's rsIDs with full variant data
    patient_rsids = {v['rsid']: v for v in variants if v.get('rsid')}

    for drug in requested_drugs:
        drug = drug.upper()
        if drug not in CPIC_DATABASE:
            assessments.append({"drug": drug, "risk_assessment": {"risk_label": "Unknown", "severity": "none", "confidence_score": 0.0}})
            continue

        db_entry = CPIC_DATABASE[drug]
        gene = db_entry["target_gene"]
        match_found = False

        # Scan patient variants against the CPIC database for this drug
        for rsid, clinical_data in db_entry["variants"].items():
            if rsid in patient_rsids:
                variant_info = patient_rsids[rsid]
                
                assessments.append({
                    "drug": drug,
                    "risk_assessment": {
                        "risk_label": clinical_data["risk"],
                        "severity": clinical_data["severity"],
                        "confidence_score": 0.98
                    },
                    "pharmacogenomic_profile": {
                        "primary_gene": gene,
                        "phenotype": clinical_data["phenotype"],
                        "diplotype": f"{clinical_data['star']}/{clinical_data['star']}",
                        "detected_variants": [{
                            "rsid": rsid,
                            "gene": gene,
                            "chrom": variant_info.get("chrom", "Unknown"),
                            "pos": variant_info.get("pos", 0),
                            "ref": variant_info.get("ref", "N/A"),
                            "alt": variant_info.get("alt", []),
                            "zygosity": "homozygous",
                            "clinical_significance": clinical_data["risk"]
                        }]
                    },
                    "clinical_recommendation": {
                        "guideline_source": "CPIC",
                        "action": clinical_data["action"],
                        "dosing_recommendation": clinical_data.get("dosing", ""),
                        "alternative_drugs": clinical_data.get("alternatives", [])
                    }
                })
                match_found = True
                break

        # NO MATCH — Wild-Type
        if not match_found:
             assessments.append({
                "drug": drug,
                "risk_assessment": {
                    "risk_label": db_entry["wild_type"]["risk"],
                    "severity": db_entry["wild_type"]["severity"],
                    "confidence_score": 0.95
                },
                "pharmacogenomic_profile": {
                    "primary_gene": gene,
                    "phenotype": db_entry["wild_type"]["phenotype"],
                    "diplotype": db_entry["wild_type"]["star"],
                    "detected_variants": []
                },
                "clinical_recommendation": {
                    "guideline_source": "CPIC",
                    "action": db_entry["wild_type"]["action"],
                    "dosing_recommendation": db_entry["wild_type"].get("dosing", ""),
                    "alternative_drugs": db_entry["wild_type"].get("alternatives", [])
                }
            })

    return assessments