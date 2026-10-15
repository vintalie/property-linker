import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/painel")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel — Mapa Local" },
      { name: "description", content: "Área em construção do Mapa Local." },
      { property: "og:title", content: "painel — Mapa Local" },
      { property: "og:description", content: "Área em construção do Mapa Local." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Construction className="mx-auto h-8 w-8 text-accent" />
        <h1 className="mt-4 text-2xl font-bold">Em construção</h1>
        <p className="mt-2 text-muted-foreground">Esta área ainda será finalizada.</p>
      </div>
    </div>
  );
}
