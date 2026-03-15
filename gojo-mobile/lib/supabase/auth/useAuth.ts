import { useCallback, useEffect } from "react";

import { supabase } from "../client";
import { useAuthStore } from "./authStore";
import { SignUpWithPasswordCredentials } from "@supabase/supabase-js";

export function useAuth() {
  const { session, user, setSession, clearSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSession(session);
      else clearSession();
    });

    return () => subscription.unsubscribe();
  }, [setSession, clearSession]);

  const register = useCallback(
    async (credentials: SignUpWithPasswordCredentials) => {
      return await supabase.auth.signUp(credentials);
    },
    [clearSession]
  );

  const login = useCallback(
    async (credentials: SignUpWithPasswordCredentials) => {
      return await supabase.auth.signInWithPassword(credentials);
    },
    [clearSession]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut({ scope: "local" });
    clearSession();
  }, [clearSession]);

  const isAuthenticated = !!session;

  return { session, user, isAuthenticated, register, login, logout };
}
