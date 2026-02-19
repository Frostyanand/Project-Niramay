
"use client";

import VcfUploader from "@/components/VcfUploader";
import TrafficLightDashboard from "@/components/TrafficLightDashboard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground space-y-8">
      <div className="text-center space-y-4 mb-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Niramay Clinical Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">
          Advanced Pharmacogenomics Risk Analysis
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl items-start">
        <section className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <h2 className="text-2xl font-semibold tracking-tight">Step 1: Upload Data</h2>
          </div>
          <VcfUploader />
        </section>

        <section className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <h2 className="text-2xl font-semibold tracking-tight">Step 2: Risk Analysis</h2>
          </div>
          <TrafficLightDashboard />
        </section>
      </div>

      <footer className="mt-16 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Niramay. Secure Clinical Genomics.
      </footer>
    </main>
  );
}
