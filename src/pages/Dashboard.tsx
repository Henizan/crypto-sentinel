// Dashboard.tsx
import TopStats from "../components/TopStats";
import AssetCard from "../components/AssetCard";

const assetsData = [
  { pair: "BTC / EUR", price: "", rsi: "", macd: "", sentiment: "", signal: "" },
  { pair: "ETH / EUR", price: "", rsi: "", macd: "", sentiment: "", signal: "" },
  { pair: "SOL / EUR", price: "", rsi: "", macd: "", sentiment: "", signal: "" },
  { pair: "XRP / EUR", price: "", rsi: "", macd: "", sentiment: "", signal: "" },
];

const Dashboard = () => (
  <div className="p-6">
    {/* Titre avec marge en bas */}
    <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

    {/* TopStats dynamique */}
    <TopStats
      btcPrice=""
      marketCap=""
      confidence=""
      updateTime=""
    />

    {/* Grille d’AssetCard */}
    <div className="assets-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {assetsData.map((asset, index) => (
        <AssetCard
          key={index}
          pair={asset.pair}
          price={asset.price}
          rsi={asset.rsi}
          macd={asset.macd}
          sentiment={asset.sentiment}
          signal={asset.signal}
        />
      ))}
    </div>
  </div>
);

export default Dashboard;