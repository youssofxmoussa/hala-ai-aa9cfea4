import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: string, session: { user: unknown } | null) => {
      setOk(!!session);
      if (!session && typeof window !== "undefined") {
        window.location.href = "/login";
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  if (!ok) return null;
  return <Outlet />;
}
