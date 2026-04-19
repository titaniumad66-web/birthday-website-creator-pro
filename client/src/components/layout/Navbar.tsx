import { memo, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { clearAuthToken, getAuthPayload } from "../../lib/queryClient";
import { requestHomeScrollTo } from "../../lib/homeAnchorScroll";
import { Menu } from "lucide-react";

function NavbarComponent() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const goHomeSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    elementId: string,
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setMenuOpen(false);
    if (location === "/" || location === "") {
      document.getElementById(elementId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      requestHomeScrollTo(elementId);
      setLocation("/");
    }
  };

  useEffect(() => {
    const updateRole = () => {
      const payload = getAuthPayload();
      setUserRole(payload?.role ?? null);
    };

    updateRole();
    window.addEventListener("auth-changed", updateRole);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("auth-changed", updateRole);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setUserRole(null);
    setLocation("/login");
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[100] transition-all ${
        scrolled
          ? "border-b border-[#FFD6E7]/90 bg-[#FFF7FA]/90 shadow-[0_8px_32px_-12px_rgba(255,107,157,0.1)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-lg font-semibold text-foreground transition-[transform,opacity] duration-200 hover:opacity-90 motion-safe:hover:scale-[1.02]"
        >
          Aura ✨
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-[transform,color] duration-200 hover:text-foreground motion-safe:hover:scale-[1.02]"
          >
            Home
          </Link>
          <Link
            href="/create"
            className="text-sm font-medium text-muted-foreground transition-[transform,color] duration-200 hover:text-foreground motion-safe:hover:scale-[1.02]"
          >
            Create
          </Link>
          <Link
            href="/templates"
            className="text-sm font-medium text-muted-foreground transition-[transform,color] duration-200 hover:text-foreground motion-safe:hover:scale-[1.02]"
          >
            Templates
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-[transform,color] duration-200 hover:text-foreground motion-safe:hover:scale-[1.02]"
          >
            Dashboard
          </Link>
          <a
            href="/#features"
            className="cursor-pointer text-sm font-medium text-muted-foreground transition-[transform,color] duration-200 hover:text-foreground motion-safe:hover:scale-[1.02]"
            onClick={(e) => goHomeSection(e, "features")}
          >
            Features
          </a>
          <a
            href="/#demo"
            className="cursor-pointer text-sm font-medium text-muted-foreground transition-[transform,color] duration-200 hover:text-foreground motion-safe:hover:scale-[1.02]"
            onClick={(e) => goHomeSection(e, "demo")}
          >
            Demo
          </a>
          {userRole === "admin" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAdminOpen((v) => !v)}
                className="inline-flex items-center rounded-full border border-[#FFD6E7] bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#FFE4EC]/60 hover:shadow-[0_8px_24px_-8px_rgba(255,107,157,0.2)] motion-safe:hover:scale-[1.03] active:scale-[0.97]"
              >
                Admin
                <span className="ml-1.5 inline-block h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground/50" />
              </button>
              {adminOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[#FFD6E7] bg-white shadow-2xl shadow-[#FF6B9D]/10"
                  onMouseLeave={() => setAdminOpen(false)}
                >
                  <div className="flex flex-col divide-y divide-[#FFE4EC]">
                    <Link href="/admin" onClick={() => setAdminOpen(false)} className="px-4 py-3 text-sm transition-colors hover:bg-[#FFF7FA]">
                      Dashboard
                    </Link>
                    <Link href="/admin?tab=users" onClick={() => setAdminOpen(false)} className="px-4 py-3 text-sm transition-colors hover:bg-[#FFF7FA]">
                      Users
                    </Link>
                    <Link href="/admin?tab=templates" onClick={() => setAdminOpen(false)} className="px-4 py-3 text-sm transition-colors hover:bg-[#FFF7FA]">
                      Templates Manager
                    </Link>
                    <Link href="/admin?tab=images" onClick={() => setAdminOpen(false)} className="px-4 py-3 text-sm transition-colors hover:bg-[#FFF7FA]">
                      Image Manager
                    </Link>
                    <Link href="/admin?tab=analytics" onClick={() => setAdminOpen(false)} className="px-4 py-3 text-sm transition-colors hover:bg-[#FFF7FA]">
                      Analytics
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {userRole && (
            <span className="text-sm font-medium text-muted-foreground">
              {userRole === "admin" ? "Admin" : "Signed in"}
            </span>
          )}

          {userRole ? (
            <button
              onClick={handleLogout}
              className="rounded-full border border-[#FFD6E7] bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#FFE4EC]/80 hover:shadow-[0_8px_24px_-8px_rgba(255,107,157,0.18)] motion-safe:hover:scale-[1.03] active:scale-[0.97]"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-[#FF6B9D]/25 transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#e85a8a] hover:shadow-[0_12px_32px_-8px_rgba(255,107,157,0.35)] motion-safe:hover:scale-[1.03] active:scale-[0.97]"
            >
              Login
            </Link>
          )}
        </div>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex items-center justify-center rounded-full border border-[#FFD6E7] bg-white/90 p-2 shadow-sm transition-[transform,box-shadow] duration-200 hover:shadow-[0_8px_24px_-8px_rgba(255,107,157,0.2)] motion-safe:active:scale-[0.96] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      </div>
      <div
        className={`md:hidden absolute inset-x-0 top-full mx-auto max-w-6xl px-6 transition-all duration-300 ${
          menuOpen ? "max-h-[min(90vh,520px)] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-[#FFD6E7] bg-white/95 shadow-xl shadow-[#FF6B9D]/10 backdrop-blur-md">
          <div className="flex flex-col divide-y divide-[#FFE4EC]">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-4 text-sm font-medium hover:bg-[#FFF7FA]"
            >
              Home
            </Link>
            <Link
              href="/create"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-4 text-sm font-medium hover:bg-[#FFF7FA]"
            >
              Create
            </Link>
            <Link
              href="/templates"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-4 text-sm font-medium hover:bg-[#FFF7FA]"
            >
              Templates
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-4 text-sm font-medium hover:bg-[#FFF7FA]"
            >
              Dashboard
            </Link>
            <a
              href="/#features"
              onClick={(e) => goHomeSection(e, "features")}
              className="px-5 py-4 text-sm font-medium hover:bg-[#FFF7FA]"
            >
              Features
            </a>
            <a
              href="/#demo"
              onClick={(e) => goHomeSection(e, "demo")}
              className="px-5 py-4 text-sm font-medium hover:bg-[#FFF7FA]"
            >
              Demo
            </a>
            {userRole ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-5 py-4 text-left text-sm font-medium hover:bg-[#FFF7FA]"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mx-4 mb-3 mt-1 block rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-primary-foreground shadow-md shadow-[#FF6B9D]/25 transition-[transform,box-shadow] duration-200 hover:bg-[#e85a8a] hover:shadow-[0_12px_32px_-8px_rgba(255,107,157,0.35)] motion-safe:active:scale-[0.98]"
              >
                Login
              </Link>
            )}
            {userRole === "admin" && (
              <>
                <div className="px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Admin
                </div>
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-medium hover:bg-[#FFF7FA]">
                  Dashboard
                </Link>
                <Link href="/admin?tab=users" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-medium hover:bg-[#FFF7FA]">
                  Users
                </Link>
                <Link href="/admin?tab=payments" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-medium hover:bg-[#FFF7FA]">
                  Payments
                </Link>
                <Link href="/admin?tab=pricing" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-medium hover:bg-[#FFF7FA]">
                  Pricing
                </Link>
                <Link href="/admin?tab=templates" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-medium hover:bg-[#FFF7FA]">
                  Templates
                </Link>
                <Link href="/admin?tab=images" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-medium hover:bg-[#FFF7FA]">
                  Image Manager
                </Link>
                <Link href="/admin?tab=analytics" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-medium hover:bg-[#FFF7FA]">
                  Analytics
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export const Navbar = memo(NavbarComponent);

