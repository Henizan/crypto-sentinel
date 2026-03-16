import FakeChart from "./FakeChart"

type Props = {
  pair: string
  price: string
  rsi: string
  macd: string
  sentiment: string
  signal: string
}

const AssetCard = (p: Props) => (
  <div className="asset-card">
    <h3>{p.pair}</h3>
    <p>{p.price}</p>
    <FakeChart />
    <small>RSI {p.rsi} | MACD {p.macd}</small>
    <div className={`signal ${p.signal === "ACHAT" ? "buy" : "sell"}`}>
      {p.signal}
    </div>
  </div>
)

export default AssetCard
