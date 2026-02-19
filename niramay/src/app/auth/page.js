import AuthForm from "@/components/AuthForm";

export const metadata = {
    title: "Sign In — Niramay",
    description: "Access your Niramay pharmacogenomics dashboard.",
};

export default function AuthPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#f0f9ff] relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#90e0ef]/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#0077b6]/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md px-6 py-20">
                <AuthForm />
            </div>
        </main>
    );
}
