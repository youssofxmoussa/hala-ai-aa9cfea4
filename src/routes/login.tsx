import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/chat",
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: search.redirect });
  },
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — HalaGPT" },
      { name: "description", content: "Sign in to HalaGPT." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: search.redirect });
    });
    return () => {
      clearTimeout(t);
      subscription.unsubscribe();
    };
  }, [navigate, search.redirect]);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin + "/chat" : undefined,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-white text-black">
      <main className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6">
        {/* HalaGPT title — slides DOWN from top into center */}
        <h1
          className="text-6xl font-semibold tracking-tight transition-all ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transitionDuration: "1400ms",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-90vh)",
          }}
        >
          HalaGPT
        </h1>

        <div className="h-16" />

        {/* Google button — slides UP from bottom into center */}
        <div
          className="w-full transition-all ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transitionDuration: "1400ms",
            transitionDelay: "150ms",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(90vh)",
          }}
        >
          <button
            onClick={signIn}
            disabled={loading}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-black/15 bg-white px-5 py-4 text-[15px] font-medium text-black transition active:scale-[0.99] hover:bg-black/[0.03] disabled:opacity-60"
          >
            <GoogleMark />
            {loading ? "Opening Google…" : "Continue with Google"}
          </button>

          {error && (
            <p className="mt-4 rounded-xl border border-black/15 bg-black/[0.03] px-3 py-2 text-center text-xs text-black/70">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.8 35.2 44 30 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
