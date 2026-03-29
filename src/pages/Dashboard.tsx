import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useData } from "../context/DataContext";

interface ChartPoint {
  time: string;
  close: number;
}

const TIMEFRAMES: Record<string, { limit: number; aggregate: string }> = {
  "Jour": { limit: 24, aggregate: "hourly" },
  "Semaine": { limit: 168, aggregate: "hourly" },
  "Mois": { limit: 720, aggregate: "hourly" },
  "Année": { limit: 365, aggregate: "daily" }
};

const Dashboard = () => {
  const { stats, assets, aiData, lastRefresh, countdown } = useData();
  const [chartData, setChartData] = useState<Record<string, ChartPoint[]>>({});
  const [selectedTf, setSelectedTf] = useState<Record<string, string>>({});

  const finbertEnabled = JSON.parse(localStorage.getItem("config_finbert") || "true");
  const autoEncoderEnabled = JSON.parse(localStorage.getItem("config_autoencoder") || "true");

  const cryptos = ["BTC", "ETH", "SOL", "XRP"];

  const fetchChart = (crypto: string, tf: string) => {
    const config = TIMEFRAMES[tf] || TIMEFRAMES["Jour"];
    fetch(`/api/chart/ohlcv?crypto=${crypto}&limit=${config.limit}&aggregate=${config.aggregate}`)
      .then((res) => res.json())
      .then((data) => setChartData((prev) => ({ ...prev, [crypto]: data })))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    // Charts are page-specific, fetch on mount only if not already loaded
    if (Object.keys(chartData).length === 0) {
      cryptos.forEach((c) => fetchChart(c, "Jour"));
      const initTf: Record<string, string> = {};
      cryptos.forEach((c) => (initTf[c] = "Jour"));
      setSelectedTf(initTf);
    }
  }, []);

  const handleTfChange = (crypto: string, tf: string) => {
    setSelectedTf((prev) => ({ ...prev, [crypto]: tf }));
    fetchChart(crypto, tf);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="p-4 sm:p-8 text-white min-h-screen" style={{ backgroundColor: "#0b1220" }}>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-wide">Vue d'Ensemble du Marché</h1>
        <p className="text-gray-400 text-sm mt-1">Surveillance temps réel active sur 4 actifs — Dernière MAJ : {lastRefresh || stats.updateTime}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#131f33] rounded-2xl p-4 border border-gray-800 text-center shadow-lg">
          <h3 className="text-gray-500 text-xs font-semibold tracking-widest mb-2 uppercase">Prix du BTC</h3>
          <div className="text-xl font-bold">{stats.btcPrice || "€0,00"}</div>
          <div className={`text-xs mt-1 ${assets[0] && parseFloat(assets[0].variation) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{assets[0] ? `${parseFloat(assets[0].variation) >= 0 ? '↗' : '↘'} ${assets[0].variation}%` : '0.00%'}</div>
        </div>

        <div className="bg-[#131f33] rounded-2xl p-4 border border-gray-800 text-center shadow-lg">
          <h3 className="text-gray-500 text-xs font-semibold tracking-widest mb-2 uppercase">Capitalisation Totale</h3>
          <div className="text-xl font-bold">€2.34 T</div>
        </div>

        <div className="bg-[#131f33] rounded-2xl p-4 border border-gray-800 text-center shadow-lg">
          <h3 className="text-gray-500 text-xs font-semibold tracking-widest mb-2 uppercase">Confiance IA</h3>
          <div className="text-xl font-bold text-blue-500">{stats.confidence || "0%"}</div>
        </div>

        <div className="bg-[#131f33] rounded-2xl p-4 border border-gray-800 text-center shadow-lg flex flex-col justify-center items-center">
          <h3 className="text-gray-500 text-xs font-semibold tracking-widest mb-2 uppercase">Actualisation dans</h3>
          <div className="text-xl font-bold flex items-center gap-2">
            <Clock size={16} /> {String(minutes).padStart(2, "0")}m {String(seconds).padStart(2, "0")}s
          </div>
        </div>
      </div>

      <div className="text-center mb-6 mt-12">
        <h2 className="text-lg font-bold tracking-wide">Cartes Sentinelles</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assets.map((asset, index) => {
          const crypto = asset.pair.split(" ")[0];
          const isBuy = asset.signal !== "Sell" && asset.signal !== "Hold";
          const isHold = asset.signal === "Hold";
          const currentTf = selectedTf[crypto] || "Jour";
          const points = chartData[crypto] || [];
          
          let signalText = "AUCUN SIGNAL DÉTECTÉ";
          let signalClass = "bg-gray-800 text-gray-400";
          if (isBuy) {
            signalText = "SIGNAL DÉTECTÉ : LONG (x5)";
            signalClass = "bg-emerald-900/40 text-emerald-500 border border-emerald-800/50";
          } else if (!isHold) {
            signalText = "SIGNAL DÉTECTÉ : SHORT (x5)";
            signalClass = "bg-red-900/40 text-red-500 border border-red-800/50";
          }

          return (
            <div key={index} className="bg-[#131f33] rounded-3xl p-6 border border-gray-800 shadow-xl relative overflow-hidden">

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold">
                    {asset.pair[0]}
                  </div>
                  <h3 className="text-lg font-bold">{asset.pair}</h3>
                </div>
                <div className="text-xl font-bold">€{asset.price.replace(" €", "")}</div>
              </div>

              <div className="flex justify-between items-stretch mb-4" style={{ height: 160 }}>
                <div className="flex-1 flex flex-col mr-4">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={points}>
                        <defs>
                          <linearGradient id={`grad-${crypto}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={["auto", "auto"]} hide />
                        <Tooltip contentStyle={{ backgroundColor: "#131f33", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "#9ca3af" }} itemStyle={{ color: "#3b82f6" }} />
                        <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fill={`url(#grad-${crypto})`} name="Close" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-gray-500 text-xs flex gap-2 mt-2">
                    {Object.keys(TIMEFRAMES).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => handleTfChange(crypto, tf)}
                        className={`px-3 py-1 rounded-full transition-colors ${currentTf === tf ? "bg-[#1c2e4a] text-white" : "hover:text-white"}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-1/3 flex flex-col justify-between items-end border-l border-gray-800 pl-4">
                  <div className="w-full text-right">
                    <div className="text-xs text-gray-400 mb-1">RSI (14)</div>
                    <div className="flex justify-end items-center gap-2 mb-1">
                      <span className="text-xs">{asset.rsi}</span>
                      <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${parseFloat(asset.rsi) > 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${parseFloat(asset.rsi)}%` }}></div>
                      </div>
                    </div>
                    <div className={`text-[10px] font-bold px-3 py-1 rounded-full inline-block ${parseFloat(asset.rsi) < 30 ? 'bg-emerald-900/50 text-emerald-500' : (parseFloat(asset.rsi) > 70 ? 'bg-red-900/50 text-red-500' : 'bg-gray-800 text-gray-300')}`}>
                      {parseFloat(asset.rsi) < 30 ? "ACHAT" : (parseFloat(asset.rsi) > 70 ? "VENTE" : "NEUTRE")}
                    </div>
                  </div>

                  <div className="w-full text-right">
                    <div className="text-xs text-gray-400 mb-1">MACD</div>
                    <div className={`text-[10px] font-bold px-3 py-1 rounded-full inline-block ${parseFloat(asset.macd) > 0 ? 'bg-emerald-900/50 text-emerald-500' : 'bg-red-900/50 text-red-500'}`}>
                      {parseFloat(asset.macd) > 0 ? "ACHAT FORT" : "VENTE"}
                    </div>
                  </div>

                  <div className="w-full text-right">
                    <div className="text-xs text-gray-400 mb-1">Sentiments</div>
                    {finbertEnabled ? (
                      <div className={`text-[10px] font-bold px-3 py-1 rounded-full inline-block ${asset.sentiment === 'positive' ? 'bg-emerald-900/50 text-emerald-500' : (asset.sentiment === 'negative' ? 'bg-red-900/50 text-red-500' : 'bg-gray-800 text-gray-300')}`}>
                        {asset.sentiment.toUpperCase()}
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold px-3 py-1 rounded-full inline-block bg-gray-800 text-gray-500">
                        DÉSACTIVÉ
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Signal classique */}
              <div className={`w-full py-2 rounded-xl text-center text-xs font-bold tracking-widest ${signalClass}`}>
                {signalText}
              </div>

              {/* Signal IA AutoEncoder */}
              {autoEncoderEnabled && aiData[crypto] && (
                <div className={`w-full py-2 mt-2 rounded-xl text-center text-xs font-bold tracking-widest ${
                  aiData[crypto].signal === 'ANOMALIE'
                    ? 'bg-orange-900/40 text-orange-400 border border-orange-800/50'
                    : 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50'
                }`}>
                  🤖 IA : {aiData[crypto].signal} — {aiData[crypto].interpretation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;