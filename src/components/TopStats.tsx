type TopStatsProps = {
  btcPrice: string;
  marketCap: string;
  confidence: string;
  updateTime: string;
};

const TopStats = ({ btcPrice, marketCap, confidence, updateTime }: TopStatsProps) => (
  <div className="top-stats flex justify-between bg-white/20 p-4 rounded-xl text-black text-sm font-medium shadow-md">
    <div className="stat">BTC: {btcPrice}</div>
    <div className="stat">Market Cap: {marketCap}</div>
    <div className="stat">Confiance IA: {confidence}</div>
    <div className="stat">Update: {updateTime}</div>
  </div>
);

export default TopStats;
