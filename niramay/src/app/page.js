
import AuthForm from "@/components/AuthForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-center w-full">
          Nirmay
        </h1>
      </div>

      <div className="w-full max-w-md">
        <AuthForm />
      </div>

      <div className="mt-8 text-center">
        <p className="text-xl text-muted-foreground">
          Secure Medical Application Scaffold
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Ready for development.
        </p>
      </div>
    </main>
  );
}
