import { Link } from "wouter";
import { Sparkles, Heart, Gift, MessageCircleHeart } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-background/60 backdrop-blur-xl transition-all">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-serif text-xl font-medium tracking-tight">Aura</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/create">
            <span className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"><Heart className="h-4 w-4"/> Create</span>
          </Link>
          <Link href="#stories">
            <span className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"><Heart className="h-4 w-4"/> Stories</span>
          </Link>
          <Link href="#wishes">
            <span className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"><MessageCircleHeart className="h-4 w-4"/> Wishes</span>
          </Link>
          <Link href="#shop">
            <span className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"><Gift className="h-4 w-4"/> Shop</span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/create">
            <button className="bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm">
              Create Website
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}