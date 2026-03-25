import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from scripts.config import DB_CONNECTION_STR
except ImportError:

    DB_CONNECTION_STR = os.getenv("DB_CONNECTION_STR", "postgresql://postgres:password@34.76.165.120:5432/cryptosentinel")

app = FastAPI(title="Crypto Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine(DB_CONNECTION_STR)

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(series, fast=12, slow=26, signal=9):
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd = ema_fast - ema_slow
    return macd

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    try:

        with engine.connect() as conn:
            btc_df = pd.read_sql("SELECT close, open_time FROM ohlcv WHERE crypto='BTC' ORDER BY open_time DESC LIMIT 1", conn)
            fg_df = pd.read_sql("SELECT value FROM fear_greed ORDER BY date DESC LIMIT 1", conn)
            
        btc_price = f"{btc_df['close'].iloc[0]:,.2f} €" if not btc_df.empty else "N/A"
        update_time = btc_df['open_time'].dt.strftime("%H:%M:%S").iloc[0] if not btc_df.empty else "N/A"
        confidence = f"{fg_df['value'].iloc[0]}%" if not fg_df.empty else "N/A"
        
        return {
            "btcPrice": btc_price,
            "marketCap": "N/A",
            "confidence": confidence,
            "updateTime": update_time
        }
    except Exception as e:
        print(f"Error stats: {e}")
        return {"btcPrice": "Error", "marketCap": "Error", "confidence": "Error", "updateTime": "Error"}

@app.get("/api/dashboard/assets")
async def get_dashboard_assets():
    assets = ["BTC", "ETH", "SOL", "XRP"]
    results = []
    
    try:
        with engine.connect() as conn:
            for crypto in assets:
                df = pd.read_sql(f"SELECT close, open_time FROM ohlcv WHERE crypto='{crypto}' ORDER BY open_time ASC", conn)
                
                if df.empty:
                    results.append({"pair": f"{crypto} / EUR", "price": "0", "rsi": "0", "macd": "0", "sentiment": "neutral", "signal": "Hold", "variation": "0.00"})
                    continue
                
                df['rsi'] = calculate_rsi(df['close'])
                df['macd'] = calculate_macd(df['close'])
                
                latest = df.iloc[-1]
                price = latest['close']
                rsi_val = latest['rsi'] if not pd.isna(latest['rsi']) else 50
                macd_val = latest['macd'] if not pd.isna(latest['macd']) else 0
                
                variation = 0.0
                if len(df) >= 2:
                    prev_price = df.iloc[-2]['close']
                    if prev_price != 0:
                        variation = ((price - prev_price) / prev_price) * 100

                signal = "Buy" if rsi_val < 30 else ("Sell" if rsi_val > 70 else "Hold")
                
                crypto_names = {"BTC": "Bitcoin", "ETH": "Ethereum", "SOL": "Solana", "XRP": "Ripple"}
                name = crypto_names.get(crypto, crypto)
                sent_df = pd.read_sql(f"SELECT sentiment, count(*) as cnt FROM news WHERE (title ILIKE '%%{name}%%' OR title ILIKE '%%{crypto}%%') AND sentiment IS NOT NULL GROUP BY sentiment ORDER BY cnt DESC LIMIT 1", conn)
                sentiment = sent_df['sentiment'].iloc[0] if not sent_df.empty else "neutral"
                
                results.append({
                    "pair": f"{crypto} / EUR",
                    "price": f"{price:,.2f}",
                    "rsi": f"{rsi_val:.1f}",
                    "macd": f"{macd_val:.2f}",
                    "sentiment": sentiment,
                    "signal": signal,
                    "variation": f"{variation:+.2f}"
                })
                
    except Exception as e:
        print(f"Error assets: {e}")

        pass
        
    return results

@app.get("/api/dashboard/news")
async def get_dashboard_news(crypto: str = None):
    try:
        with engine.connect() as conn:
            if crypto == "BTC":
                cond = "title ILIKE '%%Bitcoin%%' OR title ILIKE '%%BTC%%' OR description ILIKE '%%Bitcoin%%' OR description ILIKE '%%BTC%%'"
            elif crypto == "ETH":
                cond = "title ILIKE '%%Ethereum%%' OR title ILIKE '%%ETH%%' OR description ILIKE '%%Ethereum%%' OR description ILIKE '%%ETH%%'"
            elif crypto == "SOL":
                cond = "title ILIKE '%%Solana%%' OR title ILIKE '%%SOL%%' OR description ILIKE '%%Solana%%' OR description ILIKE '%%SOL%%'"
            elif crypto == "XRP":
                cond = "title ILIKE '%%Ripple%%' OR title ILIKE '%%XRP%%' OR description ILIKE '%%Ripple%%' OR description ILIKE '%%XRP%%'"
            else:
                cond = "1=1"
                
            query = f"SELECT title, published_at, sentiment FROM news WHERE {cond} ORDER BY published_at DESC LIMIT 10"
            news_df = pd.read_sql(query, conn)
            
        results = []
        for _, row in news_df.iterrows():
            sentiment = row['sentiment'] if not pd.isna(row['sentiment']) else "NEUTRE"
            results.append({
                "title": row['title'],
                "url": "#",
                "time": row['published_at'].strftime("%H:%M") if pd.notnull(row['published_at']) else "",
                "sentiment": sentiment
            })
        return results
    except Exception as e:
        print(f"Error news: {e}")
        return []

@app.get("/api/chart/ohlcv")
async def get_chart_ohlcv(crypto: str = "BTC", limit: int = 24, aggregate: str = "hourly"):
    try:
        with engine.connect() as conn:
            if aggregate == "daily":
                query = f"""
                    SELECT DATE(open_time) as day,
                           (ARRAY_AGG(open ORDER BY open_time ASC))[1] as open,
                           MAX(high) as high,
                           MIN(low) as low,
                           (ARRAY_AGG(close ORDER BY open_time DESC))[1] as close,
                           SUM(volume) as volume
                    FROM ohlcv
                    WHERE crypto='{crypto}'
                    GROUP BY DATE(open_time)
                    ORDER BY day DESC
                    LIMIT {limit}
                """
                df = pd.read_sql(query, conn)
                df = df.sort_values("day")
                return [{
                    "time": row["day"].strftime("%d/%m"),
                    "open": round(float(row["open"]), 2),
                    "high": round(float(row["high"]), 2),
                    "low": round(float(row["low"]), 2),
                    "close": round(float(row["close"]), 2),
                    "volume": round(float(row["volume"]), 2)
                } for _, row in df.iterrows()]
            else:
                df = pd.read_sql(f"SELECT open_time, open, high, low, close, volume FROM ohlcv WHERE crypto='{crypto}' ORDER BY open_time DESC LIMIT {limit}", conn)
                df = df.sort_values("open_time")
                return [{
                    "time": row["open_time"].strftime("%d/%m %Hh"),
                    "open": round(float(row["open"]), 2),
                    "high": round(float(row["high"]), 2),
                    "low": round(float(row["low"]), 2),
                    "close": round(float(row["close"]), 2),
                    "volume": round(float(row["volume"]), 2)
                } for _, row in df.iterrows()]
    except Exception as e:
        print(f"Error ohlcv chart: {e}")
        return []

@app.get("/api/chart/feargreed")
async def get_chart_feargreed(limit: int = 30):
    try:
        with engine.connect() as conn:
            df = pd.read_sql(f"SELECT date, value, classification FROM fear_greed ORDER BY date DESC LIMIT {limit}", conn)
        df = df.sort_values("date")
        return [{
            "date": row["date"].strftime("%d/%m"),
            "value": int(row["value"]),
            "label": row["classification"]
        } for _, row in df.iterrows()]
    except Exception as e:
        print(f"Error feargreed chart: {e}")
        return []

@app.get("/api/chart/feargreed/summary")
async def get_feargreed_summary():
    try:
        with engine.connect() as conn:
            df = pd.read_sql("SELECT date, value, classification FROM fear_greed ORDER BY date DESC LIMIT 31", conn)
        if df.empty:
            return {"today": None, "yesterday": None, "lastWeek": None, "lastMonth": None}
        
        df = df.sort_values("date", ascending=False).reset_index(drop=True)
        
        def entry(row):
            return {"value": int(row["value"]), "label": row["classification"]}
        
        today = entry(df.iloc[0]) if len(df) > 0 else None
        yesterday = entry(df.iloc[1]) if len(df) > 1 else None
        last_week = entry(df.iloc[7]) if len(df) > 7 else None
        last_month = entry(df.iloc[30]) if len(df) > 30 else None
        
        return {"today": today, "yesterday": yesterday, "lastWeek": last_week, "lastMonth": last_month}
    except Exception as e:
        print(f"Error feargreed summary: {e}")
        return {"today": None, "yesterday": None, "lastWeek": None, "lastMonth": None}
