
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function TrafficLightDashboard() {
    const safetyLevels = {
        safe: { label: "Safe", color: "bg-green-500 hover:bg-green-600" },
        caution: { label: "Adjust", color: "bg-yellow-500 hover:bg-yellow-600" },
        danger: { label: "Toxic", color: "bg-red-500 hover:bg-red-600" }
    };

    const mockData = [
        {
            drug: "Warfarin",
            risk: "danger",
            gene: "CYP2C9",
            phenotype: "Poor Metabolizer",
            recommendation: "Consider alternative anticoagulant or significantly reduce dosage.",
            details: "Variant *3/*3 detected. Metabolism reduced by >90%."
        },
        {
            drug: "Clopidogrel",
            risk: "caution",
            gene: "CYP2C19",
            phenotype: "Intermediate Metabolizer",
            recommendation: "Standard dose may be less effective. Monitor platelet function.",
            details: "Variant *1/*2 detected. Reduced enzymatic activity."
        },
        {
            drug: "Simvastatin",
            risk: "safe",
            gene: "SLCO1B1",
            phenotype: "Normal Function",
            recommendation: "Standard dosing guidelines apply.",
            details: "No risk alleles detected."
        }
    ];

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Pharmacogenomic Risk Profile</CardTitle>
                <CardDescription>Analysis based on uploaded VCF data.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {mockData.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <span className="font-semibold text-lg">{item.drug}</span>
                                    <Badge className={`${safetyLevels[item.risk].color} text-white border-0`}>
                                        {safetyLevels[item.risk].label}
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 p-2 bg-muted/30 rounded-md">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-sm">Gene:</span>
                                        <span className="text-sm">{item.gene}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-sm">Phenotype:</span>
                                        <span className="text-sm">{item.phenotype}</span>
                                    </div>
                                    <div className="pt-2">
                                        <p className="font-medium text-sm mb-1">Recommendation:</p>
                                        <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                                    </div>
                                    <div className="pt-2 border-t mt-2">
                                        <p className="text-xs text-muted-foreground">Technical Details: {item.details}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
