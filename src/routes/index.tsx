import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Code2, FileSpreadsheet, MapPin, MessageCircle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import heroImg from "@/assets/hero-map.jpg";

const WHATSAPP = "https://wa.me/5513981412290?text=" + encodeURIComponent("Olá, quero saber mais sobre o Mapa Local.");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mapa Local — lojas e produtos no mapa" },
      { name: "description", content: "Cadastre suas lojas e produtos e publique um mapa interativo no seu site." },
      { property: "og:title", content: "Mapa Local — lojas e produtos no mapa" },
      { property: "og:description", content: "Cadastre suas lojas e produtos e publique um mapa interativo no seu site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Store, title: "Cadastre suas lojas", text: "Informe o endereço por extenso. Ruas, bairros e cidades novos são criados automaticamente." },
  { icon: Boxes, title: "Vincule produtos", text: "Cada produto pertence a uma loja, com preço, fotos, descrição e estoque." },
  { icon: MapPin, title: "Gere seu mapa", text: "Um clique em uma loja mostra os produtos que ela possui." },
  { icon: Code2, title: "Incorpore onde quiser", text: "Use o link direto ou cole o código iframe no seu site." },
  { icon: FileSpreadsheet, title: "Importe e exporte", text: "Atualize lojas e produtos de uma vez com planilha ou JSON." },
];

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Ilustração de mapa urbano com lojas marcadas" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 md:py-40">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">Comércio local, no mapa</p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] md:text-7xl">
            Mostre onde estão suas lojas e o que cada uma oferece.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            O Mapa Local reúne propriedades e produtos em um mapa interativo que você publica no seu site ou compartilha por link.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/entrar">Começar agora <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <h2 className="text-3xl font-bold md:text-4xl">Como funciona</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-5">
          {features.map((f, i) => (
            <div key={f.title} className="bg-card p-6">
              <span className="font-display text-sm text-muted-foreground">0{i + 1}</span>
              <f.icon className="mt-6 h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-20 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Vamos conversar?</h2>
            <p className="mt-3 max-w-lg opacity-80">
              Quer colocar seu comércio no mapa ou tirar dúvidas sobre o projeto? Fale com a gente pelo WhatsApp: (13) 98141-2290.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
            </a>
          </Button>
        </div>
      </section>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">Mapa Local</footer>
    </div>
  );
}
