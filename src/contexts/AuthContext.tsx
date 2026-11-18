"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@/types";
import { getUsers, initializeStorage, saveSession, STORAGE_KEYS } from "@/services/storage";

interface AuthValue {
  session: Session | null;
  ready: boolean;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);
const SESSION_CHANGE_EVENT = "eteon:session-change";

function subscribeToSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SESSION_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SESSION_CHANGE_EVENT, onStoreChange);
  };
}

function getSessionSnapshot() {
  return window.localStorage.getItem(STORAGE_KEYS.session);
}

function parseSession(serializedSession: string | null): Session | null {
  if (!serializedSession) return null;
  try {
    return JSON.parse(serializedSession) as Session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const serializedSession = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
  const session = useMemo(() => parseSession(serializedSession), [serializedSession]);
  const ready = true;

  useEffect(() => {
    initializeStorage();
  }, []);

  const router = useRouter();

  const login = (username: string, password: string) => {
    initializeStorage();
    const cleanUsername = username.trim();
    const user = getUsers().find((item: User) => item.username.toLowerCase() === cleanUsername.toLowerCase() && item.password === password);
    if (!user) return { success: false, message: "Usuário ou senha incorretos." };

    const nextSession: Session = { userId: user.id, role: user.role, name: user.name, studentId: user.studentId };
    saveSession(nextSession);
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
    router.push(user.role === "admin" ? "/admin" : "/aluno");
    return { success: true, message: "Login realizado com sucesso." };
  };

  const logout = () => {
    saveSession(null);
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
    router.push("/login");
  };

  return <AuthContext.Provider value={{ session, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
