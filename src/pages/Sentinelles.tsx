import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface NewsItem {
  title: string;
  url: string;
  time: string;
  sentiment: string;
}

interface OhlcvPoint {
  time: string;
  close: number;
  high: number;
  low: number;
  volume: number;
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

const Sentinelles = () => {
  const [activeTab, setActiveTab] = useState("BTC");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [ohlcvData, setOhlcvData] = useState<OhlcvPoint[]>([]);
  const [fearGreedData, setFearGreedData] = useState<FearGreedSummary | null>(null);
  const [assetData, setAssetData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/chart/feargreed/summary")
      .then(res => res.json())
      .then(data => setFearGreedData(data))
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    fetch(`/api/dashboard/news?crypto=${activeTab}`)
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(e => console.error(e));

    fetch(`/api/chart/ohlcv?crypto=${activeTab}&limit=48`)
      .then(res => res.json())
      .then(data => setOhlcvData(data))
      .catch(e => console.error(e));

    fetch("/api/dashboard/assets")
      .then(res => res.json())
      .then(data => {
        const match = data.find((a: any) => a.pair.startsWith(activeTab));
        setAssetData(match || null);
      })
      .catch(e => console.error(e));
  }, [activeTab]);

  return (
    <div className="p-4 sm:p-8 text-white min-h-screen" style={{ backgroundColor: "#0b1220" }}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-wide">Sentinelles Actives</h1>
      </div>

      <div className="bg-[#131f33] rounded-3xl border border-gray-800 shadow-2xl p-6">

        <div className="flex gap-2 max-w-lg mb-8 border-b border-gray-800">
          {["BTC", "ETH", "XRP", "SOL"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center text-sm font-bold transition-colors ${activeTab === tab ? "bg-[#1c2e4a] text-white border-t border-l border-r border-gray-700 rounded-t-xl" : "text-gray-500 hover:text-white"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-[#0b1220] rounded-xl border border-gray-800 flex flex-col p-4" style={{ height: 320 }}>
               <div className="text-sm font-bold text-gray-400 mb-2">{activeTab}/EUR — Prix de clôture (48 dernières bougies)</div>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={ohlcvData}>
                   <defs>
                     <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                   <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 10 }} interval="preserveStartEnd" />
                   <YAxis domain={["auto", "auto"]} tick={{ fill: "#6b7280", fontSize: 10 }} width={70} />
                   <Tooltip contentStyle={{ backgroundColor: "#131f33", border: "1px solid #374151", borderRadius: 8 }} labelStyle={{ color: "#9ca3af" }} itemStyle={{ color: "#3b82f6" }} />
                   <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fill="url(#colorClose)" name="Close" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="bg-[#0b1220] rounded-xl border border-gray-800 flex flex-col p-4" style={{ height: 160 }}>
               <div className="text-xs font-bold text-gray-400 mb-2">Fear & Greed Index</div>
               
               {fearGreedData ? (
                 <div className="flex items-center gap-4 flex-1">
                   <div className="flex flex-col items-center flex-shrink-0">
                     <div className="relative" style={{ width: 140, height: 80 }}>
                       <svg viewBox="0 0 180 100" className="w-full h-full">
                         <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#dc2626" strokeWidth="12" strokeLinecap="round" strokeDasharray="62.8 251.3" />
                         <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="round" strokeDasharray="62.8 251.3" strokeDashoffset="-62.8" />
                         <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="round" strokeDasharray="62.8 251.3" strokeDashoffset="-125.6" />
                         <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" strokeDasharray="62.8 251.3" strokeDashoffset="-188.4" />
                         {(() => {
                           const val = fearGreedData.today?.value || 0;
                           const angle = (val / 100) * 180;
                           const rad = (angle - 180) * (Math.PI / 180);
                           const nx = 90 + 65 * Math.cos(rad);
                           const ny = 90 + 65 * Math.sin(rad);
                           return <circle cx={nx} cy={ny} r="6" fill="white" stroke="#0b1220" strokeWidth="2" />;
                         })()}
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                         <div className="text-3xl font-bold text-white">{fearGreedData.today?.value ?? "—"}</div>
                         <div className="text-xs text-gray-400">{fearGreedData.today?.label ?? ""}</div>
                       </div>
                     </div>
                   </div>

                   <div className="border-l border-gray-800 pl-4 flex-1">
                     <div className="text-xs font-bold text-gray-400 mb-1">Historique</div>
                     <div className="space-y-1 text-xs">
                       {[
                         { label: "Hier", data: fearGreedData.yesterday },
                         { label: "Semaine", data: fearGreedData.lastWeek },
                         { label: "Mois", data: fearGreedData.lastMonth },
                       ].map((row, i) => {
                         const val = row.data?.value;
                         const lbl = row.data?.label || "";
                         let badgeColor = "bg-yellow-900/40 text-yellow-400";
                         if (val !== undefined) {
                           if (val <= 24) badgeColor = "bg-red-900/50 text-red-400";
                           else if (val <= 44) badgeColor = "bg-orange-900/40 text-orange-400";
                           else if (val <= 55) badgeColor = "bg-yellow-900/40 text-yellow-400";
                           else if (val <= 75) badgeColor = "bg-lime-900/40 text-lime-400";
                           else badgeColor = "bg-emerald-900/40 text-emerald-400";
                         }
                         return (
                           <div key={i} className="flex justify-between items-center">
                             <span className="text-gray-400">{row.label}</span>
                             {val !== undefined ? (
                               <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${badgeColor}`}>
                                 {lbl} {val}
                               </span>
                             ) : (
                               <span className="text-gray-600">—</span>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Chargement...</div>
               )}
            </div>
          </div>


          <div className="bg-[#0b1220] rounded-xl border border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 text-center font-bold text-sm">
              Cerveau IA
            </div>
            <div className="p-5 space-y-6">


              <div>
                <h3 className="text-xs text-gray-400 mb-2">Analyse technique</h3>
                {assetData ? (
                  <ul className="text-xs space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-400">RSI (14)</span>
                      <span className={parseFloat(assetData.rsi) < 30 ? 'text-emerald-500 font-bold' : (parseFloat(assetData.rsi) > 70 ? 'text-red-500 font-bold' : 'text-gray-300')}>
                        {assetData.rsi} {parseFloat(assetData.rsi) < 30 ? '(Survente)' : (parseFloat(assetData.rsi) > 70 ? '(Surachat)' : '(Neutre)')}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">MACD</span>
                      <span className={parseFloat(assetData.macd) > 0 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                        {assetData.macd} {parseFloat(assetData.macd) > 0 ? '(Haussier)' : '(Baissier)'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Sentiment</span>
                      <span className={assetData.sentiment === 'positive' ? 'text-emerald-500 font-bold' : (assetData.sentiment === 'negative' ? 'text-red-500 font-bold' : 'text-yellow-500')}>
                        {assetData.sentiment === 'positive' ? 'Positif' : (assetData.sentiment === 'negative' ? 'Négatif' : 'Neutre')}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Signal</span>
                      <span className={assetData.signal === 'Buy' ? 'text-emerald-500 font-bold' : (assetData.signal === 'Sell' ? 'text-red-500 font-bold' : 'text-yellow-500 font-bold')}>
                        {assetData.signal === 'Buy' ? 'Achat' : (assetData.signal === 'Sell' ? 'Vente' : 'Attente')}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Variation</span>
                      <span className={parseFloat(assetData.variation) >= 0 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                        {assetData.variation}%
                      </span>
                    </li>
                  </ul>
                ) : (
                  <p className="text-gray-500 text-xs">Chargement...</p>
                )}
              </div>


              <div>
                <h3 className="text-xs text-gray-400 mb-2">Impact des News</h3>
                <div className="h-40 overflow-y-auto pr-2 space-y-2 text-[10px]">
                  {news.length === 0 ? (
                     <div className="text-gray-500 text-center py-4">Aucune actualité trouvée.</div>
                  ) : (
                    news.map((item, idx) => {
                      const isBullish = item.sentiment === 'positive';
                      const isBearish = item.sentiment === 'negative';
                      const badgeClass = isBullish ? "text-emerald-500" : (isBearish ? "text-red-500" : "text-yellow-500");
                      const badgeText = isBullish ? "[POS]" : (isBearish ? "[NEG]" : "[NEUTRE]");
                      return (
                        <div key={idx} className="flex gap-2">
                          <span className="text-gray-500 flex-shrink-0">[{item.time}]</span>
                          <a href={item.url} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white line-clamp-2">
                            {item.title} <span className={`font-bold ml-1 ${badgeClass}`}>{badgeText}</span>
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>


        <div className="mt-8 bg-[#0b1220] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 text-center font-bold text-sm">
            Positions et historique
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#131f33] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 font-normal">Date-Heure</th>
                  <th className="px-6 py-3 font-normal">Type(signal) - Paire</th>
                  <th className="px-6 py-3 font-normal text-right">Prix d'Entrée</th>
                  <th className="px-6 py-3 font-normal text-right">Prix Actuel/Sortie</th>
                  <th className="px-6 py-3 font-normal text-right">PnL (Profit & Loss)</th>
                  <th className="px-6 py-3 font-normal">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-300">30 Nov - 14:02</td>
                  <td className="px-6 py-4 font-bold text-emerald-500">LONG(x5) <span className="text-gray-400 font-normal">- BTC/EUR</span></td>
                  <td className="px-6 py-4 text-right">€71,500</td>
                  <td className="px-6 py-4 text-right">€72,192</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-500">+ €3,460 (+4.8%)</td>
                  <td className="px-6 py-4 text-gray-400">EN COURS...</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-300">29 Nov - 09:30</td>
                  <td className="px-6 py-4 font-bold text-emerald-500">LONG(x10) <span className="text-gray-400 font-normal">- ETH/EUR</span></td>
                  <td className="px-6 py-4 text-right">€2,380</td>
                  <td className="px-6 py-4 text-right">€2,434</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-500">+ €540.00 (+22.6%)</td>
                  <td className="px-6 py-4 text-gray-500">CLÔTURÉ</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-300">28 Nov - 11:15</td>
                  <td className="px-6 py-4 font-bold text-emerald-500">LONG(x5) <span className="text-gray-400 font-normal">- XRP/EUR</span></td>
                  <td className="px-6 py-4 text-right">€2.150</td>
                  <td className="px-6 py-4 text-right">€2.050</td>
                  <td className="px-6 py-4 text-right font-bold text-red-500">- €120.00 (-4.6%)</td>
                  <td className="px-6 py-4 text-gray-500">CLÔTURÉ</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-300">27 Nov - 16:45</td>
                  <td className="px-6 py-4 font-bold text-red-500">SHORT(x3) <span className="text-gray-400 font-normal">- SOL/EUR</span></td>
                  <td className="px-6 py-4 text-right">€130.50</td>
                  <td className="px-6 py-4 text-right">€131.41</td>
                  <td className="px-6 py-4 text-right font-bold text-red-500">- €452.00 (-7%)</td>
                  <td className="px-6 py-4 text-gray-500">CLÔTURÉ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentinelles;
