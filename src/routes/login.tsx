import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import logoUrl from "@/assets/halagpt-logo.png";

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
      { title: "Sign in — Hala AI" },
      { name: "description", content: "Sign in to Hala AI to save your chats." },
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
    const t = setTimeout(() => setMounted(true), 50);
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
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: typeof window !== "undefined" ? window.location.origin + "/chat" : undefined,
      });
      if (result.error) {
        setError(result.error instanceof Error ? result.error.message : String(result.error));
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: search.redirect });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      {/* Ambient luxe glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[120px]" />
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6">
        {/* Slides DOWN from top into center */}
        <div
          className="flex flex-col items-center text-center transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-80vh)",
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 -m-6 rounded-full bg-white/10 blur-2xl" />
            <img
              src={logoUrl}
              alt="Hala AI"
              className="relative h-20 w-20 rounded-3xl shadow-[0_30px_80px_-20px_rgba(255,255,255,0.35)]"
            />
          </div>
          <h1 className="mt-7 bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-semibold tracking-tight text-transparent">
            Hala AI
          </h1>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/50">
            A Palestinian AI assistant. Refined. Multilingual. Yours.
          </p>
        </div>

        {/* Spacer so top + bottom land in the middle together */}
        <div className="h-12" />

        {/* Slides UP from bottom into center */}
        <div
          className="w-full transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(80vh)",
            transitionDelay: "120ms",
          }}
        >
          <button
            onClick={signIn}
            disabled={loading}
            className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-white px-5 py-4 text-[15px] font-medium text-black shadow-[0_20px_60px_-20px_rgba(255,255,255,0.5)] transition active:scale-[0.99] hover:bg-white/95 disabled:opacity-60"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            <GoogleMark />
            {loading ? "Opening Google…" : "Continue with Google"}
          </button>

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200">
              {error}
            </p>
          )}

          <p className="mt-8 text-center text-[11px] leading-relaxed text-white/40">
            By continuing you agree to Hala AI's Terms and Privacy.
          </p>
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
