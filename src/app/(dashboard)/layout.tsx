"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch {
        // User fetch failed silently -- middleware handles redirect
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        toast.error("Failed to log out. Please try again.");
        return;
      }

      window.location.href = "/login";
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  function getRoleLabel(role: string): string {
    switch (role) {
      case "athlete":
        return "Athlete";
      case "trainer":
        return "Trainer";
      case "centre_admin":
        return "Centre Admin";
      default:
        return role;
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold">
              FitBook
            </Link>
            {user && (
              <nav className="hidden items-center gap-4 text-sm md:flex">
                {user.role === "athlete" && (
                  <Link
                    href="/classes"
                    className={`transition-colors hover:text-foreground ${
                      pathname === "/classes"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Classes
                  </Link>
                )}
                {user.role === "trainer" && (
                  <Link
                    href="/trainer/dashboard"
                    className={`transition-colors hover:text-foreground ${
                      pathname === "/trainer/dashboard"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === "centre_admin" && (
                  <Link
                    href="/centre/dashboard"
                    className={`transition-colors hover:text-foreground ${
                      pathname === "/centre/dashboard"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="hidden text-sm text-muted-foreground sm:block">
                  <span className="font-medium text-foreground">
                    {user.fullName}
                  </span>{" "}
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Log out"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
