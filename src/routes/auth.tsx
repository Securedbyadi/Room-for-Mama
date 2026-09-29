import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { ButtonMain, ButtonOutline, Page } from "../components/rfm/brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Coach sign in | Room for Mama" },
      { name: "description", content: "Sign in to the Room for Mama coach app." },
      { property: "og:title", content: "Coach sign in | Room for Mama" },
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
    if (email.trim().toLowerCase() !== "adilmushtaq088@gmail.com") { setNote("This app is for the coach."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setNote("That email and password don’t match.");
    else void navigate({ to: "/coach" });
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) setNote("Google sign-in didn’t work just now.");
    else if (!result.redirected) void navigate({ to: "/coach" });
  };

  return (
    <Page>
      <h1 className="t-title">Coach sign in</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className={inputCls} type="email" aria-label="Email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inputCls} type="password" aria-label="Password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {note && <p className="rounded-2xl bg-butter-soft p-4">{note}</p>}
        <ButtonMain type="submit" disabled={!email.includes("@") || password.length < 8}>
          Sign in
        </ButtonMain>
      </form>
      <ButtonOutline onClick={google}>Continue with Google</ButtonOutline>
    </Page>
  );
}
