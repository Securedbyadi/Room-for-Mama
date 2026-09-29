import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { ButtonMain, ButtonOutline, Page } from "../components/rfm/brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Coach sign in — Room for Mama" },
      { name: "description", content: "Sign in to the Room for Mama coach app." },
      { property: "og:title", content: "Coach sign in — Room for Mama" },
      { property: "og:description", content: "Sign in to the Room for Mama coach app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const inputCls = "min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[17px] text-ink placeholder:text-ink-muted";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/coach" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNote(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setNote("That email and password don’t match.");
      else void navigate({ to: "/coach" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
      setNote(error ? "That didn’t work. Try another email or a longer password." : "Check your email to confirm, then sign in.");
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) setNote("Google sign-in didn’t work just now.");
    else if (!result.redirected) void navigate({ to: "/coach" });
  };

  return (
    <Page>
      <h1 className="t-title">{mode === "in" ? "Coach sign in" : "Create the coach account"}</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className={inputCls} type="email" aria-label="Email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inputCls} type="password" aria-label="Password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {note && <p className="rounded-2xl bg-butter-soft p-4">{note}</p>}
        <ButtonMain type="submit" disabled={!email.includes("@") || password.length < 8}>
          {mode === "in" ? "Sign in" : "Create account"}
        </ButtonMain>
      </form>
      <ButtonOutline onClick={google}>Continue with Google</ButtonOutline>
      <button type="button" className="t-caption min-h-12 underline underline-offset-2" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "First time? Create the coach account" : "Already have an account? Sign in"}
      </button>
    </Page>
  );
}
