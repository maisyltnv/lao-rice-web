"use client";

import { useState, useEffect, type ComponentType } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export type LoginPortal = "customer" | "admin";

export interface LoginScreenProps {
  portal: LoginPortal;
  Icon: ComponentType<{ className?: string }>;
  brandTitle: string;
  brandSubtitle: string;
  redirectIfAuthed: string;
  redirectAfterAuth: string;
  /** Customer register only — POST /auth/register */
  registerRole?: string;
  alternateHint: {
    href: string;
    label: string;
    description: string;
  };
}

export function LoginScreen({
  portal,
  Icon,
  brandTitle,
  brandSubtitle,
  redirectIfAuthed,
  redirectAfterAuth,
  registerRole,
  alternateHint,
}: LoginScreenProps) {
  const router = useRouter();
  const {
    login,
    register,
    loginAdmin,
    user,
    adminUser,
    isReady,
  } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = portal === "admin";
  const sessionUser = isAdmin ? adminUser : user;

  useEffect(() => {
    if (!isReady || !sessionUser) return;
    router.replace(redirectIfAuthed);
  }, [isReady, sessionUser, router, redirectIfAuthed]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <p className="text-muted-foreground text-sm">ກຳລັງໂຫຼດ...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isAdmin) {
        await loginAdmin(username.trim(), password);
      } else if (mode === "login") {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password, registerRole);
      }
      router.push(redirectAfterAuth);
    } catch (err) {
      const apiMsg = axios.isAxiosError(err)
        ? (() => {
            const body = err.response?.data;
            if (body && typeof body === "object" && "error" in body) {
              return String((body as { error: unknown }).error);
            }
            return err.message;
          })()
        : err instanceof Error
          ? err.message
          : null;
      const base =
        isAdmin || mode === "login"
          ? "ເຂົ້າລະບົບບໍ່ສຳເລັດ"
          : "ລົງທະບຽນບໍ່ສຳເລັດ";
      setError(apiMsg ? `${base}: ${apiMsg}` : `${base} — ກວດຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດ`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        isAdmin ? "bg-slate-950/95 text-slate-50" : "bg-primary/5"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-md rounded-2xl border p-8 shadow-sm",
          isAdmin
            ? "border-slate-700 bg-slate-900 text-slate-50"
            : "border-border bg-card text-foreground"
        )}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              isAdmin ? "bg-amber-500 text-slate-950" : "bg-primary text-primary-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                isAdmin ? "text-amber-400/90" : "text-primary"
              )}
            >
              {isAdmin ? "ແອັດມິນ — /auth/admin/login" : "ຮ້ານເຂົ້າສານ — /auth/login"}
            </p>
            <h1 className="text-xl font-bold">{brandTitle}</h1>
            <p
              className={cn(
                "text-sm",
                isAdmin ? "text-slate-400" : "text-muted-foreground"
              )}
            >
              {brandSubtitle}
            </p>
          </div>
        </div>

        {!isAdmin && (
          <div
            className={cn(
              "mb-6 flex rounded-lg p-1",
              "bg-muted"
            )}
          >
            <button
              type="button"
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                mode === "login"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground"
              )}
              onClick={() => {
                setMode("login");
                setError(null);
              }}
            >
              ເຂົ້າລະບົບ
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                mode === "register"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground"
              )}
              onClick={() => {
                setMode("register");
                setError(null);
              }}
            >
              ລົງທະບຽນ
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={cn(
                "mb-1.5 block text-sm font-medium",
                isAdmin && "text-slate-200"
              )}
            >
              ຊື່ຜູ້ໃຊ້
            </label>
            <Input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={isAdmin ? "admin" : "ເບີ ຫຼື ຊື່ຜູ້ໃຊ້"}
              className={cn(isAdmin && "border-slate-600 bg-slate-800 text-slate-50")}
            />
          </div>
          <div>
            <label
              className={cn(
                "mb-1.5 block text-sm font-medium",
                isAdmin && "text-slate-200"
              )}
            >
              ລະຫັດ
            </label>
            <Input
              type="password"
              autoComplete={
                mode === "login" || isAdmin
                  ? "current-password"
                  : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={cn(isAdmin && "border-slate-600 bg-slate-800 text-slate-50")}
            />
          </div>

          {error && (
            <p
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                isAdmin
                  ? "bg-red-950/50 text-red-200"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            className={cn(
              "w-full",
              isAdmin && "bg-amber-500 text-slate-950 hover:bg-amber-400"
            )}
            size="lg"
            disabled={loading}
          >
            {loading
              ? "ກຳລັງດຳເນີນການ..."
              : isAdmin || mode === "login"
                ? "ເຂົ້າລະບົບ"
                : "ສ້າງບັນຊີ"}
          </Button>
        </form>

        <div
          className={cn(
            "mt-6 space-y-3 border-t pt-6 text-center text-sm",
            isAdmin ? "border-slate-700 text-slate-400" : "border-border text-muted-foreground"
          )}
        >
          <p>{alternateHint.description}</p>
          <Link
            href={alternateHint.href}
            className={cn(
              "font-medium hover:underline",
              isAdmin ? "text-amber-400" : "text-primary"
            )}
          >
            {alternateHint.label}
          </Link>
          <div>
            <Link
              href="/"
              className={cn(
                "text-xs hover:underline",
                isAdmin ? "text-slate-500" : "text-muted-foreground"
              )}
            >
              ກັບໜ້າຮ້ານ
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
