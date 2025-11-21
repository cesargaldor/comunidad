"use client";
import { createContext, useContext } from "react";

type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  return context;
}
