import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Flame } from "lucide-react";
import { WHATSAPP } from "@/lib/servicos-data";

export function Footer() {
  const footerCards = [
    {
      title: "Meu portfólio",
      description:
        "Projetos, cases e aplicações web que mostram meu trabalho na prática.",
      href: "https://main-portfolio-sigma-flame.vercel.app/",
      image: "/images/icons/portfolio.png",
    },
    {
      title: "Minha landing page",
      description:
        "Veja meus serviços de sites, landing pages e web aplicações sob medida.",
      href: "https://e-commerce-landing-page-lime.vercel.app/",
      image: "/images/icons/landing-page.png",
    },
    {
      title: "Meu Linktree",
      description:
        "Acesse meus links principais, contato e canais oficiais em um só lugar.",
      href: "https://personal-link-tree-livid.vercel.app/",
      image: "/images/icons/linktree.jpg",
      external: true,
    },
  ];

  return (
    <footer className="border-t border-border-subtle bg-cafe-dark-900">
      <div className="before:mx-auto before:block before:h-px before:w-full before:max-w-7xl before:bg-gradient-to-r before:from-transparent before:via-cafe-orange-500/30 before:to-transparent">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[0.9fr_1.8fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-xl font-bold text-text-primary"
            >
              <Flame className="h-6 w-6 text-cafe-orange-500" />
              <span className="text-gradient-fire">CAFÉ STORE</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-text-muted">
              Eu crio sites, landing pages, web aplicações e experiências
              digitais para marcas, criadores e negócios.
            </p>
            <p className="mt-3 text-xs leading-5 text-text-muted">
              A vitrine de itens CAFÉ funciona como apoio simbólico ao projeto.
              As imagens são ilustrativas e não representam entrega física.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {footerCards.map((card) => {
              const className =
                "group rounded-card border border-border-subtle bg-background-card p-5 transition hover:border-cafe-orange-500/40 hover:bg-cafe-dark-800";
              const content = (
                <>
                  <div className="mb-4 flex size-11 items-center justify-center overflow-hidden rounded-xl border border-cafe-orange-500/20 bg-cafe-orange-500/10 p-1">
                    <Image
                      src={card.image}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-lg object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {card.title}
                    </h3>
                    <ExternalLink className="h-3.5 w-3.5 text-text-muted opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    {card.description}
                  </p>
                </>
              );

              return card.external ? (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <Link key={card.title} href={card.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border-subtle">
          <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-text-muted sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()} CAFÉ STORE. Todos os direitos
              reservados.
            </p>
            <div className="flex gap-4">
              <Link
                href="/servicos"
                className="transition hover:text-cafe-orange-500"
              >
                Política de privacidade
              </Link>
              <Link
                href="/servicos"
                className="transition hover:text-cafe-orange-500"
              >
                Termos de uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
