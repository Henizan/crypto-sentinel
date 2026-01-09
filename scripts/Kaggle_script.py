# import des libraries
import pandas as pd
from pathlib import Path

DATA_DIR = Path("C:/ece_B3/pfe/data") # Répertoire des données

files = ["imports/BTCUSD_1d_Binance.csv", "imports/ETHUSD_1d_Binance.csv", "imports/XRPUSD_1d_Binance.csv"] # Liste des fichiers CSV à fusionner
merged_list = [] # Liste pour stocker les DataFrames fusionnés

for file in files: 
    df = pd.read_csv(DATA_DIR / file) # Lire chaque fichier CSV dans un DataFrame

    df["Crypto"] = file.split("USD")[0] # Extraire le symbole de la crypto-monnaie à partir du nom du fichier

    df = df[["Open", "High", "Low", "Close", "Volume", "Open time", "Close time", "Crypto"]] # Sélectionner les colonnes pertinentes

    df = df.rename(columns={ # Renommer les colonnes pour correspondre au format souhaité
        "Open": "Open",
        "High": "High",
        "Low": "Low",
        "Close": "Close",
        "Volume": "Volume",
        "Open time": "Open Time",
        "Close time": "Close Time",
        "Crypto": "Crypto"
    })

    df["Open Time"] = pd.to_datetime(df["Open Time"]).dt.strftime("%Y-%m-%d %H:%M:%S") # Formater le temps d'ouverture
    df["Close Time"] = pd.to_datetime(df["Close Time"]).dt.strftime("%Y-%m-%d %H:%M:%S") # Formater le temps de fermeture

    merged_list.append(df) # Ajouter le DataFrame formaté à la liste

merged = pd.concat(merged_list, ignore_index=True) # Concaténer tous les DataFrames en un seul

merged.to_csv(DATA_DIR / "kaggle_data.csv", index=False) # Exporter le DataFrame final vers un fichier CSV
