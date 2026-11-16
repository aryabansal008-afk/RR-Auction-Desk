import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Bundle, Player } from "../types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; bundle: Bundle; byKey: Map<string, Player> };

const DataContext = createContext<State>({ status: "loading" });

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/bundle.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Data file returned ${response.status}.`);
        return response.json() as Promise<Bundle>;
      })
      .then((bundle) => {
        const byKey = new Map(bundle.players.map((player) => [player.key, player]));
        setState({ status: "ready", bundle, byKey });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "The data file could not be read.",
        });
      });
    return () => controller.abort();
  }, []);

  const value = useMemo(() => state, [state]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): State {
  return useContext(DataContext);
}
