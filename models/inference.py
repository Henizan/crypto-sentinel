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

def get_latest_data(symbol, n_rows=1):
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
            print(f"[-] {symbol} non trouvé dans le fichier.")
            return None
            
        return df_filtered.tail(n_rows)
    except Exception as e:
        print(f"[-] Erreur lecture {symbol} : {e}")
        return None