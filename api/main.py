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
                    results.append({"pair": f"{crypto} / EUR", "price": "0", "rsi": "0", "macd": "0", "sentiment": "Neutral", "signal": "Hold"})
                    continue
                
                df['rsi'] = calculate_rsi(df['close'])
                df['macd'] = calculate_macd(df['close'])
                
                latest = df.iloc[-1]
                price = latest['close']
                rsi_val = latest['rsi'] if not pd.isna(latest['rsi']) else 50
                macd_val = latest['macd'] if not pd.isna(latest['macd']) else 0
                

                signal = "Buy" if rsi_val < 30 else ("Sell" if rsi_val > 70 else "Hold")
                sentiment = "Bearish" if rsi_val < 45 else ("Bullish" if rsi_val > 55 else "Neutral")
                
                results.append({
                    "pair": f"{crypto} / EUR",
                    "price": f"{price:,.2f}",
                    "rsi": f"{rsi_val:.1f}",
                    "macd": f"{macd_val:.2f}",
                    "sentiment": sentiment,
                    "signal": signal
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
