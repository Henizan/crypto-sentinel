# Importation des bibliothèques
import pandas as pd
from pathlib import Path

import sys, os
# Importation des configurations et du gestionnaire de BDD
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import DATA_DIR
DATA_DIR = Path(DATA_DIR) # Répertoire des données
from database_manager import save_to_postgres

# Liste des fichiers CSV sources (données historiques de Kaggle)
files = ["imports/BTCUSD_1d_Binance.csv", "imports/ETHUSD_1d_Binance.csv", "imports/XRPUSD_1d_Binance.csv"] 
merged_list = [] 

# On parcourt chaque fichier pour le traiter
for file in files: 
    # Chargement du fichier dans un DataFrame
    df = pd.read_csv(DATA_DIR / file) 

    # On déduit le symbole de la crypto (BTC, ETH...) à partir du nom du fichier
    df["Crypto"] = file.split("/")[-1].split("USD")[0] 

    # Sélection des colonnes utiles
    df = df[["Open", "High", "Low", "Close", "Volume", "Open time", "Close time", "Crypto"]] 

    # Renommage pour uniformiser avec notre base de données
    df = df.rename(columns={ 
        "Open": "Open",
        "High": "High",
        "Low": "Low",
        "Close": "Close",
        "Volume": "Volume",
        "Open time": "Open Time",
        "Close time": "Close Time",
        "Crypto": "Crypto"
    })

    # Conversion des colonnes de temps au format date
    df["Open Time"] = pd.to_datetime(df["Open Time"], utc=True) 
    df["Close Time"] = pd.to_datetime(df["Close Time"], utc=True) 

    merged_list.append(df) 

# On rassemble toutes les cryptos dans un seul grand tableau
merged = pd.concat(merged_list, ignore_index=True)

merged.to_csv(DATA_DIR / "kaggle_data.csv", index=False) # Export optionnel pour vérification

# Envoi final vers la base de données
save_to_postgres(merged, "ohlcv")
