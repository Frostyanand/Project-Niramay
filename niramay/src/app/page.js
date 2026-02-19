import AuthForm from "@/components/AuthForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-24 relative overflow-hidden">
      {/* Background is handled by layout.js (BiomedicalBackground) */}

      {/* Dark Overlay to ensure text readability if background is too bright, 
          though BiomedicalBackground usually handles its own gradient. 
          Let's add a subtle radial gradient to focus attention. */}
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/50 to-slate-950/80 pointer-events-none z-0" />

      <div className="z-10 w-full max-w-md">
        <AuthForm />
      </div>

      <div className="mt-8 text-center z-10 opacity-60">
        <p className="text-xs text-slate-500 font-mono tracking-widest">
          SECURE CONNECTION ESTABLISHED • VER: 2.4.0
        </p>
      </div>
    </main>
  );
}
