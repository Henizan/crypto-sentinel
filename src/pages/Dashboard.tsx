import React, { useEffect, useState } from "react";
import TopStats from "../components/TopStats";
import AssetCard from "../components/AssetCard";

const Dashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/stats")
        .then(res => res.json())
        .then(json => {
          console.log("Données reçues :", json);
          setData(json);
        })
        .catch(err => console.error("Erreur Fetch :", err));
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const assets = [
    { pair: "BTC / EUR", id: "BTC" },
    { pair: "ETH / EUR", id: "ETH" },
    { pair: "SOL / EUR", id: "SOL" },
    { pair: "XRP / EUR", id: "XRP" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Dashboard Live</h1>

      <TopStats
        btcPrice={data?.BTC?.price || "Chargement..."}
        marketCap="---"
        confidence={data?.BTC?.signal === "STABLE" ? "Haute" : "Basse"}
        updateTime={new Date().toLocaleTimeString()}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {assets.map((asset, index) => (
          <AssetCard
            key={index}
            pair={asset.pair}
            price={data?.[asset.id]?.price || "..."}
            rsi={data?.[asset.id]?.rsi || "..."}
            macd={data?.[asset.id]?.macd || "..."}
            sentiment={data?.[asset.id]?.sentiment || "..."}
            signal={data?.[asset.id]?.signal || "Analyse..."}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;