# app/services/rules_engine.py

# CPIC Exhaustive Lookup Tables (The "Symbolic Core")
CPIC_DATABASE = {
    "SIMVASTATIN": {
        "target_gene": "SLCO1B1",
        "variants": {
            "rs4149056": {"star": "*5", "phenotype": "Poor Function", "risk": "Toxic", "severity": "critical", "action": "Prescribe alternative statin (e.g., Rosuvastatin). High risk of rhabdomyolysis."}
        },
        "wild_type": {"star": "*1/*1", "phenotype": "Normal Function", "risk": "Safe", "severity": "none", "action": "Standard simvastatin prescribing protocols. Normal myopathy risk."}
    },
    "WARFARIN": {
        "target_gene": "CYP2C9",
        "variants": {
            "rs1799853": {"star": "*2", "phenotype": "Intermediate Metabolizer", "risk": "Adjust Dosage", "severity": "moderate", "action": "Decrease calculated initial dose by 15-30%. Monitor INR closely."},
            "rs1057910": {"star": "*3", "phenotype": "Poor Metabolizer", "risk": "Adjust Dosage", "severity": "high", "action": "Decrease calculated initial dose by 20-40%. Extreme caution regarding hemorrhage risk."}
        },
        "wild_type": {"star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none", "action": "Initiate standard dosing protocols based on clinical factors."}
    },
    "CLOPIDOGREL": {
        "target_gene": "CYP2C19",
        "variants": {
            "rs4244285": {"star": "*2", "phenotype": "Poor Metabolizer", "risk": "Ineffective", "severity": "critical", "action": "Avoid clopidogrel. Use alternative P2Y12 inhibitor (Prasugrel or Ticagrelor)."},
            "rs4986893": {"star": "*3", "phenotype": "Poor Metabolizer", "risk": "Ineffective", "severity": "critical", "action": "Avoid clopidogrel. Use alternative P2Y12 inhibitor."}
        },
        "wild_type": {"star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none", "action": "Initiate standard dosing (75 mg/day)."}
    },
    "AZATHIOPRINE": {
        "target_gene": "TPMT",
        "variants": {
            "rs1142345": {"star": "*3C", "phenotype": "Poor Metabolizer", "risk": "Toxic", "severity": "critical", "action": "Contraindication for thiopurines. Reduce dose to 10% of standard (3x/week) or avoid. [EQUITY ALGORITHM: Concurrent evaluation of NUDT15 is mandated for Asian/Hispanic descent]"},
            "rs1800460": {"star": "*3A", "phenotype": "Poor Metabolizer", "risk": "Toxic", "severity": "critical", "action": "Contraindication for thiopurines. Reduce dose to 10% of standard."}
        },
        "wild_type": {"star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none", "action": "Initiate standard dosing. [EQUITY ALGORITHM: Ensure NUDT15 is also wild-type.]"}
    },
    "FLUOROURACIL": {
        "target_gene": "DPYD",
        "variants": {
            "rs3918290": {"star": "*2A", "phenotype": "Poor Metabolizer", "risk": "Toxic", "severity": "critical", "action": "Extreme risk of severe/fatal toxicity. Avoid 5-FU. Use alternative regimens."}
        },
        "wild_type": {"star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none", "action": "Standard 5-FU dosing protocols. Normal risk for toxicity."}
    },
    "CODEINE": {
        "target_gene": "CYP2D6",
        "variants": {
            "rs3892097": {"star": "*4", "phenotype": "Poor Metabolizer", "risk": "Ineffective", "severity": "high", "action": "Avoid codeine due to lack of efficacy. Use alternative non-tramadol option."}
        },
        "wild_type": {"star": "*1/*1", "phenotype": "Normal Metabolizer", "risk": "Safe", "severity": "none", "action": "Use codeine label-recommended age- or weight-specific dosing."}
    }
}

def evaluate_risk(parsed_vcf_data, requested_drugs):
    variants = parsed_vcf_data.get("variants", [])
    assessments = []

    # Fast lookup for patient's rsIDs
    patient_rsids = {v['rsid']: v for v in variants if v.get('rsid')}

    for drug in requested_drugs:
        drug = drug.upper()
        if drug not in CPIC_DATABASE:
            assessments.append({"drug": drug, "risk_assessment": {"risk_label": "Unknown", "severity": "none"}})
            continue

        db_entry = CPIC_DATABASE[drug]
        gene = db_entry["target_gene"]
        match_found = False

        # Scan patient variants against the CPIC database for this drug
        for rsid, clinical_data in db_entry["variants"].items():
            if rsid in patient_rsids:
                # MATCH FOUND! (Toxic / Adjust)
                equity_warning = ""
                if drug == "WARFARIN" and "rs12777823" in patient_rsids:
                     equity_warning = " [EQUITY ALGORITHM: rs12777823 detected. Mandatory 10-25% dose reduction for African ancestry.]"

                assessments.append({
                    "drug": drug,
                    "risk_assessment": {"risk_label": clinical_data["risk"], "severity": clinical_data["severity"], "confidence_score": 0.98},
                    "pharmacogenomic_profile": {"primary_gene": gene, "phenotype": clinical_data["phenotype"], "diplotype": f"{clinical_data['star']}/{clinical_data['star']}", "detected_variants": [{"rsid": rsid}]},
                    "clinical_recommendation": {"guideline_source": "CPIC", "action": clinical_data["action"] + equity_warning}
                })
                match_found = True
                break # Stop searching if we found the primary risk variant

        # NO MATCH FOUND (Default to Safe / Wild-Type)
        if not match_found:
             assessments.append({
                "drug": drug,
                "risk_assessment": {"risk_label": db_entry["wild_type"]["risk"], "severity": db_entry["wild_type"]["severity"], "confidence_score": 0.95},
                "pharmacogenomic_profile": {"primary_gene": gene, "phenotype": db_entry["wild_type"]["phenotype"], "diplotype": db_entry["wild_type"]["star"], "detected_variants": []},
                "clinical_recommendation": {"guideline_source": "CPIC", "action": db_entry["wild_type"]["action"]}
            })

    return assessments