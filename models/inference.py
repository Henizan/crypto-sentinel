import psycopg2
import pandas as pd
import torch
import os

# trvail hugo
DB_CONFIG = {
    "dbname": "cryptosentinel",
    "user": "postgres",
    "password": "password",
    "host": "cryptosentinel", # service Docker
    "port": "5432:5432"
}

def get_latest_data(symbol: str, n_rows: int = 100):
    """
    Récupère les $n$ dernières lignes pour un actif spécifique
    depuis la base de données TimescaleDB de Hugo.
    """
    try:
        # Connexion DB 
        conn = psycopg2.connect(**DB_CONFIG)
        
        # Requete SQL
        # "time DESC" pour dernieres et réordonne
        query = f"""
        SELECT time, price, volume, rsi, macd 
        FROM crypto_data 
        WHERE symbol = '{symbol}' 
        ORDER BY time DESC 
        LIMIT {n_rows};
        """
        
        # DF pandas
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        # ordre chronologique 
        df = df.iloc[::-1]
        
        return df

    except Exception as e:
        print(f"Erreur de connexion à la DB : {e}")
        return None

def prepare_tensors(df):
    """
    Transforme les données Pandas en Tenseurs utilisables par 
    le TCN et l'AutoEncoder[cite: 68].
    """
    
    features = df[['price', 'volume', 'rsi', 'macd']].values
    
    # Conversion en tenseur PyTorch et shape attendue pour un TCN : (batch, channels, sequence_length)
    tensor_data = torch.tensor(features, dtype=torch.float32).unsqueeze(0).permute(0, 2, 1)
    
    return tensor_data

if __name__ == "__main__":
    data = get_latest_data("BTC/USDT", n_rows=50)
    if data is not None:
        inputs = prepare_tensors(data)
        print(f"Tenseur prêt pour l'IA : {inputs.shape}")