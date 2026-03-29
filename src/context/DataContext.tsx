import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface AssetData {
  pair: string;
  price: string;
  rsi: string;
  macd: string;
  sentiment: string;
  signal: string;
  variation: string;
}

interface AiResult {
  price: string;
  signal: string;
  sentiment: string;
  loss: number | null;
  interpretation: string;
}

interface FearGreedEntry {
  value: number;
  label: string;
}

interface FearGreedSummary {
  today: FearGreedEntry | null;
  yesterday: FearGreedEntry | null;
  lastWeek: FearGreedEntry | null;
  lastMonth: FearGreedEntry | null;
}

interface StatsData {
  btcPrice: string;
  marketCap: string;
  confidence: string;
  updateTime: string;
}

interface DataContextType {
  stats: StatsData;
  assets: AssetData[];
  aiData: Record<string, AiResult>;
  fearGreedSummary: FearGreedSummary | null;
  lastRefresh: string;
  countdown: number;
  isLoading: boolean;
  refreshAll: () => void;
}

const REFRESH_INTERVAL = 3600000; // 1 heure

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [stats, setStats] = useState<StatsData>({ btcPrice: "", marketCap: "", confidence: "", updateTime: "" });
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [aiData, setAiData] = useState<Record<string, AiResult>>({});
  const [fearGreedSummary, setFearGreedSummary] = useState<FearGreedSummary | null>(null);
  const [lastRefresh, setLastRefresh] = useState("");
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchAll = useCallback(() => {
    const autoEncoderEnabled = JSON.parse(localStorage.getItem("config_autoencoder") || "true");

    Promise.all([
      fetch("/api/dashboard/stats").then(r => r.json()).catch(() => null),
      fetch("/api/dashboard/assets").then(r => r.json()).catch(() => []),
      autoEncoderEnabled
        ? fetch("/api/dashboard/ai-analysis").then(r => r.json()).catch(() => ({}))
        : Promise.resolve({}),
      fetch("/api/chart/feargreed/summary").then(r => r.json()).catch(() => null),
    ]).then(([statsData, assetsData, aiResult, fgSummary]) => {
      if (statsData) setStats(statsData);
      setAssets(assetsData);
      setAiData(aiResult);
      setFearGreedSummary(fgSummary);
      setLastRefresh(new Date().toLocaleTimeString("fr-FR"));
      setCountdown(REFRESH_INTERVAL / 1000);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAll();
    }

    const dataInterval = setInterval(fetchAll, REFRESH_INTERVAL);
    const tickInterval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [fetchAll]);

  return (
    <DataContext.Provider value={{
      stats, assets, aiData, fearGreedSummary,
      lastRefresh, countdown, isLoading,
      refreshAll: fetchAll
    }}>
      {children}
    </DataContext.Provider>
  );
};
