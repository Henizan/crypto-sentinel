import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface AssetData {
  pair: string;
  price: string;
  rsi: string;
  macd: string;
  sentiment: string;
  signal: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState({ btcPrice: "", marketCap: "", confidence: "", updateTime: "" });
  const [assets, setAssets] = useState<AssetData[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));

    fetch("/api/dashboard/assets")
      .then((res) => res.json())
      .then((data) => setAssets(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-4 sm:p-8 text-white min-h-screen" style={{ backgroundColor: "#0b1220" }}>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-wide">Vue d'Ensemble du Marché</h1>
        <p className="text-gray-400 text-sm mt-1">Surveillance temps réel active sur 4 actifs</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#131f33] rounded-2xl p-4 border border-gray-800 text-center shadow-lg">
          <h3 className="text-gray-500 text-xs font-semibold tracking-widest mb-2 uppercase">Prix du BTC</h3>
          <div className="text-xl font-bold">{stats.btcPrice || "€0,00"}</div>
          <div className="text-emerald-500 text-xs mt-1">↗ +0.00%</div>
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
            <Clock size={16} /> 04m 12s
          </div>
        </div>
      </div>


      <div className="text-center mb-6 mt-12">
        <h2 className="text-lg font-bold tracking-wide">Cartes Sentinelles</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assets.map((asset, index) => {
          const isBuy = asset.signal !== "Sell" && asset.signal !== "Hold";
          const isHold = asset.signal === "Hold";
          
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

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold">
                    {asset.pair[0]}
                  </div>
                  <h3 className="text-lg font-bold">{asset.pair}</h3>
                </div>
                <div className="text-xl font-bold">€{asset.price.replace(" €", "")}</div>
              </div>


              <div className="flex justify-between items-stretch mb-6 h-32">

                <div className="flex-1 flex flex-col justify-end border-b border-gray-700 pb-2 mr-8">
                   <div className="text-gray-500 text-xs flex justify-between px-2">
                     <span className="bg-[#1c2e4a] px-3 py-1 rounded-full text-white">1h</span>
                     <span>12h</span>
                     <span className="text-blue-500">24h</span>
                     <span>1s</span>
                   </div>
                </div>


                <div className="w-1/3 flex flex-col justify-between items-end border-l border-gray-800 pl-6">

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
                    <div className="text-[10px] font-bold px-3 py-1 rounded-full inline-block bg-gray-800 text-gray-300">
                      {asset.sentiment.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>


              <div className={`w-full py-2 rounded-xl text-center text-xs font-bold tracking-widest ${signalClass}`}>
                {signalText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;