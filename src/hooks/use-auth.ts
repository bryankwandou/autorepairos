"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/services/auth-client";

export function useAuthToken() {
  const [authState, setAuthState] = useState<{
    token: string | null;
    ready: boolean;
  }>({
    token: null,
    ready: false,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAuthState({
        token: getAuthToken(),
        ready: true,
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return {
    token: authState.token,
    ready: authState.ready,
    setToken: (token: string | null) => setAuthState({ token, ready: true }),
  };
}
