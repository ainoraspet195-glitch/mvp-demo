import WaitlistForm from "@/components/WaitlistForm";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function getMissingEnv(): string[] {
  return REQUIRED_ENV.filter((key) => !process.env[key]);
}

export default function Home() {
  const missing = getMissingEnv();

  if (missing.length > 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="mb-2 text-xl font-semibold text-red-700">
            Missing env vars
          </h1>
          <p className="text-sm text-red-600">
            Set these in <code>.env.local</code>:
          </p>
          <ul className="mt-3 space-y-1 font-mono text-sm text-red-600">
            {missing.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">
          Join the waitlist
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          Be first to know when we launch.
        </p>
        <WaitlistForm />
      </div>
    </main>
  );
}
