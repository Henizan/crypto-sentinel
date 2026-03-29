import pandas as pd
import torch
import torch.nn as nn
import os

class CryptoAutoEncoder(nn.Module):
    def __init__(self, input_dim):
        super(CryptoAutoEncoder, self).__init__()
        self.encoder = nn.Sequential(nn.Linear(input_dim, 8), nn.ReLU(), nn.Linear(8, 4))
        self.decoder = nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, input_dim))
    def forward(self, x):
        return self.decoder(self.encoder(x))


def get_latest_data_from_db(symbol, n_rows=1):
    """
    Récupère les données OHLCV depuis PostgreSQL (table ohlcv).
    Utilisé pour l'inférence en temps réel dans l'API Hugo.
    """
    try:
        import sys
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from scripts.config import DB_CONNECTION_STR
        from sqlalchemy import create_engine

        engine = create_engine(DB_CONNECTION_STR)
        query = f"""
            SELECT close, volume, high, low 
            FROM ohlcv 
            WHERE crypto='{symbol}' 
            ORDER BY open_time DESC 
            LIMIT {n_rows}
        """
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print(f"[-] {symbol} non trouvé dans la base PostgreSQL.")
            return None
        return df

    except Exception as e:
        print(f"[-] Erreur lecture DB pour {symbol} : {e}")
        return None


def get_latest_data_from_csv(symbol, n_rows=1):
    """
    Récupère les données depuis le CSV local (data_all.csv).
    Utilisé comme fallback ou pour le training.
    """
    file_path = "data_all.csv" 
    try:
        if not os.path.exists(file_path):
            return None

        df = pd.read_csv(file_path, encoding='latin-1')
        
        # Nettoyage des colonnes et de la colonne 'crypto'
        df.columns = df.columns.str.strip().str.replace('"', '')
        df['crypto'] = df['crypto'].astype(str).str.strip().str.replace('"', '')

        # Filtrage dynamique selon le symbole demandé
        df_filtered = df[df['crypto'].str.upper() == symbol.upper()]
        
        if df_filtered.empty:
            print(f"[-] {symbol} non trouvé dans le fichier CSV.")
            return None
            
        return df_filtered.tail(n_rows)
    except Exception as e:
        print(f"[-] Erreur lecture CSV {symbol} : {e}")
        return None


def get_latest_data(symbol, n_rows=1, use_db=True):
    """
    Fonction principale : essaie d'abord PostgreSQL, puis fallback CSV.
    - use_db=True  → pour l'inférence en temps réel (API Hugo)
    - use_db=False → pour le training (depuis CSV)
    """
    if use_db:
        result = get_latest_data_from_db(symbol, n_rows)
        if result is not None:
            return result
        print(f"[!] Fallback sur CSV pour {symbol}...")
    
    return get_latest_data_from_csv(symbol, n_rows)


def prepare_tensors(df):
    """
    Prépare les tenseurs PyTorch à partir d'un DataFrame.
    Utilisé par train.py pour l'entraînement.
    """
    cols = ['close', 'volume', 'high', 'low']
    data = df[cols].values
    tensor = torch.tensor(data, dtype=torch.float32)
    # Reshape pour le TCN : (batch, features, sequence_length)
    return tensor.unsqueeze(0).permute(0, 2, 1)