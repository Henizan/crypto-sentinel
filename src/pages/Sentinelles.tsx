import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  url: string;
  time: string;
  sentiment: string;
}

const Sentinelles = () => {
  const [activeTab, setActiveTab] = useState("BTC");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState({ confidence: "0%" });

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    fetch(`/api/dashboard/news?crypto=${activeTab}`)
      .then(res => res.json())
      .then(data => setNews(data))
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
            <div className="bg-[#0b1220] rounded-xl border border-gray-800 h-64 flex flex-col p-6 relative overflow-hidden">
               <div className="text-sm font-bold text-gray-400 mb-2">{activeTab}/EUR - Données du marché</div>
               <div className="flex-1 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
                 <p className="text-gray-500 text-sm">Graphique en cours de développement</p>
               </div>
            </div>

            <div className="bg-[#0b1220] rounded-xl border border-gray-800 h-32 flex flex-col p-4">
               <div className="text-xs font-bold text-gray-400 mb-2">Historique d'Alertes {activeTab}</div>
               <div className="flex-1 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
                 <p className="text-gray-500 text-xs text-center">En attente des signaux IA</p>
               </div>
            </div>
          </div>


          <div className="bg-[#0b1220] rounded-xl border border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 text-center font-bold text-sm">
              Cerveau IA
            </div>
            <div className="p-5 space-y-6">

              <div>
                <h3 className="text-xs text-gray-400 mb-3">Score de confiance</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full text-emerald-500">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1f2937" strokeWidth="4" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${stats.confidence.replace('%', '')}, 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                      {stats.confidence}
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="text-gray-300">Probabilité du signal : {stats.confidence}</div>
                    <div className="text-gray-300">Tendance du signal : <span className="text-emerald-500 font-bold">Haussier</span></div>
                  </div>
                </div>
              </div>


              <div>
                <h3 className="text-xs text-gray-400 mb-2">Analyse technique</h3>
                <ul className="text-xs space-y-1">
                  <li className="text-emerald-500">RSI en zone d'achat</li>
                  <li className="text-emerald-500">Croisement MACD confirmé</li>
                  <li className="text-yellow-500">Volume moyen stable</li>
                </ul>
              </div>


              <div>
                <h3 className="text-xs text-gray-400 mb-2">Impact des News</h3>
                <div className="h-40 overflow-y-auto pr-2 space-y-2 text-[10px]">
                  {news.length === 0 ? (
                     <div className="text-gray-500 text-center py-4">Aucune actualité trouvée.</div>
                  ) : (
                    news.map((item, idx) => {
                      const isBullish = item.sentiment === 'Bullish' || item.sentiment === 'POSITIF';
                      const isBearish = item.sentiment === 'Bearish' || item.sentiment === 'NEGATIF';
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
