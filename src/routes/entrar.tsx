import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Server } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { getBaseUrl, getToken, setBaseUrl } from "@/lib/api/client";
import { login, register } from "@/lib/api/auth";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Mapa Local" },
      { name: "description", content: "Acesse sua conta para gerenciar lojas, produtos e mapas." },
      { property: "og:title", content: "Entrar — Mapa Local" },
      { property: "og:description", content: "Acesse sua conta para gerenciar lojas, produtos e mapas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [base, setBase] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    setBase(getBaseUrl());
    if (getToken()) navigate({ to: "/painel" });
  }, [navigate]);

  async function submit(mode: "login" | "register") {
    setBusy(true);
    try {
      setBaseUrl(base);
      if (mode === "login") await login(form.email, form.password);
      else {
        await register(form.name, form.email, form.password);
        if (!getToken()) await login(form.email, form.password).catch(() => null);
        if (!getToken()) {
          toast.success("Conta criada. Confirme seu e-mail e depois entre.");
          return;
        }
      }
      await qc.invalidateQueries();
      navigate({ to: "/painel" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  const field = (k: keyof typeof form, label: string, type = "text") => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="min-h-screen grid-paper">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-xl border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-bold">Acesse sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre para gerenciar suas lojas, produtos e mapas.</p>
          <Tabs defaultValue="login" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 pt-4">
              {field("email", "E-mail", "email")}
              {field("password", "Senha", "password")}
              <Button className="w-full" disabled={busy} onClick={() => submit("login")}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
              </Button>
            </TabsContent>
            <TabsContent value="register" className="space-y-4 pt-4">
              {field("name", "Nome")}
              {field("email", "E-mail", "email")}
              {field("password", "Senha", "password")}
              <Button className="w-full" disabled={busy} onClick={() => submit("register")}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Criar conta
              </Button>
            </TabsContent>
          </Tabs>
          <div className="mt-6 space-y-1.5 border-t pt-4">
            <Label htmlFor="base" className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Server className="h-3.5 w-3.5" /> Endereço da API
            </Label>
            <Input id="base" value={base} onChange={(e) => setBase(e.target.value)} className="h-8 text-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
