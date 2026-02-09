import requests
import pandas as pd
import sys, os
from datetime import datetime

# Ajout du dossier parent au système de fichiers pour importer nos propres modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database_manager import save_to_postgres
from config import COINGECKO_API_KEY

# --- Configuration de l'API CoinGecko ---
# On prépare l'en-tête avec la clé API pour s'authentifier
headers = {"accept": "application/json", "x-cg-demo-api-key": COINGECKO_API_KEY}

def get_market_chart_segment(coin_id, vs_currency):
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart?vs_currency={vs_currency}&days=90"
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    data = r.json()

    prices = pd.DataFrame(data["prices"], columns=["timestamp", "price"])  
    volumes = pd.DataFrame(data["total_volumes"], columns=["timestamp", "volume"])
    prices["timestamp"] = pd.to_datetime(prices["timestamp"], unit="ms", utc=True)
    volumes["timestamp"] = pd.to_datetime(volumes["timestamp"], unit="ms", utc=True)

    df = prices.resample("1h", on="timestamp").agg(
        {"price": ["first", "max", "min", "last"]}
    )
    df.columns = ["Open", "High", "Low", "Close"]
    df["Volume"] = volumes.resample("1h", on="timestamp")["volume"].sum()
    
    df["Open Time"] = df.index
    df["Close Time"] = df["Open Time"].shift(-1) # On estime le temps de fermeture avec l'heure suivante

    # Conversion des dates au bon format pour que PostgreSQL les comprenne
    df["Open Time"] = pd.to_datetime(df["Open Time"])
    df["Close Time"] = pd.to_datetime(df["Close Time"])
    
    df.reset_index(drop=True, inplace=True)
    return df

def get_full_history(coin_id, symbol):
    try:
        df = get_market_chart_segment(coin_id, "usd")
        df["Crypto"] = symbol
        return df
    except Exception as e:
        print(f"Error fetching {coin_id}: {e}")
        return pd.DataFrame()

def fetch_and_store_prices():
    print("Récupération des données Coingecko...")
    cryptos = {
        "bitcoin": "BTC",
        "ethereum": "ETH",
        "ripple": "XRP",
        "solana": "SOL"
    }

    frames = [get_full_history(cid, sym) for cid, sym in cryptos.items()]
    if not frames:
        print("No data fetched.")
        return

    final = pd.concat(frames, ignore_index=True)
    if final.empty:
        print("Empty dataframe.")
        return

    # Renommage des colonnes pour qu'elles correspondent exactement à notre table SQL 'ohlcv'
    final = final.rename(columns={
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Volume": "volume",
        "Open Time": "open_time",
        "Close Time": "close_time",
        "Crypto": "crypto"
    })
    
    # On filtre pour ne garder que les colonnes attendues par la base de données
    cols_to_keep = ["crypto", "open_time", "close_time", "open", "high", "low", "close", "volume"]
    final = final[cols_to_keep]

    # Sauvegarde finale dans la table 'ohlcv' via notre gestionnaire de base de données
    save_to_postgres(final, "ohlcv")

if __name__ == "__main__":
    fetch_and_store_prices()
