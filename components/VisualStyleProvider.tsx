"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  DEFAULT_VISUAL_STYLE,
  STORAGE_KEY,
  isVisualStyleId,
  type VisualStyleId,
} from "@/lib/visual-styles";
import { useAuth } from "./AuthProvider";

interface VisualStyleState {
  style: VisualStyleId;
  setStyle: (id: VisualStyleId) => void;
  ready: boolean;
}

const VisualStyleContext = createContext<VisualStyleState>({
  style: DEFAULT_VISUAL_STYLE,
  setStyle: () => {},
  ready: false,
});

export const useVisualStyle = () => useContext(VisualStyleContext);

/**
 * Style preference lives in localStorage so it works signed-out and applies
 * instantly, and mirrors to the profile when signed in so it follows the user
 * across devices. Local wins on load conflicts only if the profile has none.
 */
export default function VisualStyleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [style, setStyleState] = useState<VisualStyleId>(DEFAULT_VISUAL_STYLE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isVisualStyleId(stored)) setStyleState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;
    supabase
      .from("profiles")
      .select("visual_style")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.visual_style && isVisualStyleId(data.visual_style)) {
          setStyleState(data.visual_style);
          window.localStorage.setItem(STORAGE_KEY, data.visual_style);
        }
      });
  }, [user]);

  const setStyle = useCallback(
    (id: VisualStyleId) => {
      setStyleState(id);
      window.localStorage.setItem(STORAGE_KEY, id);
      const supabase = getSupabase();
      if (user && supabase) {
        supabase
          .from("profiles")
          .update({ visual_style: id })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error("visual_style save failed:", error.message);
          });
      }
    },
    [user]
  );

  return (
    <VisualStyleContext.Provider value={{ style, setStyle, ready }}>
      {children}
    </VisualStyleContext.Provider>
  );
}
