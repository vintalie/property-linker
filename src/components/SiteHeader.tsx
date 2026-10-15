import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogIn, LogOut, MapPinned, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/api/client";
import { isAdmin, logout } from "@/lib/api/auth";
import { useMe } from "@/lib/queries";

export function SiteHeader() {
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => setHasToken(!!getToken()), []);
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    await logout();
    qc.clear();
    setHasToken(false);
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <MapPinned className="h-5 w-5 text-accent" />
          Mapa Local
        </Link>
        <nav className="flex items-center gap-1">
          {hasToken ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/painel">
                  <LayoutDashboard className="h-4 w-4" /> Painel
                </Link>
              </Button>
              {isAdmin(me) && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">
                    <ShieldCheck className="h-4 w-4" /> Administração
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/entrar">
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
