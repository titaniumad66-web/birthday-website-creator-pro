import { Github, Linkedin, Twitter } from "lucide-react";

const LINKS = [
  { label: "Product", href: "#features" },
  { label: "Stories", href: "#parallax" },
  { label: "Contact", href: "#" },
  { label: "Privacy", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#020008] py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-bold tracking-tight text-white">AURA</p>
          <p className="mt-2 max-w-xs text-sm text-zinc-500">
            Intelligent design for the next era of digital experiences.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex gap-4">
          <a
            href="#"
            aria-label="Twitter"
            className="rounded-full border border-white/10 p-2.5 text-zinc-400 transition-colors hover:border-purple-500/40 hover:text-purple-300"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="GitHub"
            className="rounded-full border border-white/10 p-2.5 text-zinc-400 transition-colors hover:border-purple-500/40 hover:text-purple-300"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            className="rounded-full border border-white/10 p-2.5 text-zinc-400 transition-colors hover:border-purple-500/40 hover:text-purple-300"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
      <p className="mt-12 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} AURA. All rights reserved.
      </p>
    </footer>
  );
}
