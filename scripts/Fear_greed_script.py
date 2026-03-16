# Importation des bibliothèques nécessaires
import requests, os, sys
import pandas as pd
from datetime import datetime

# Ajout du dossier parent pour importer database_manager
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database_manager import save_to_postgres

def scrape_fear_greed_full():
    # Fonction pour récupérer l'historique complet de l'indice 'Fear & Greed'
    print("Récupération de l'indice Fear & Greed...")
    
    # URL de l'API (limit=0 signifie qu'on récupère tout l'historique)
    url = "https://api.alternative.me/fng/?limit=0" 
    try:
        # On lance la requête vers l'API et on vérifie que tout va bien
        response = requests.get(url)
        response.raise_for_status() 

        # On extrait les données JSON de la réponse
        data = response.json().get("data", [])

        if not data:
            print("Aucune donnée Fear & Greed trouvée.")
            return

        # On transforme les données en tableau (DataFrame) structuré
        df = pd.DataFrame([{ 
            "date": datetime.fromtimestamp(int(d["timestamp"])), # Conversion du timestamp UNIX en date lisible
            "value": int(d["value"]), # Valeur de l'indice (0-100)
            "classification": d["value_classification"] # Texte (ex: Extreme Fear)
        } for d in data]) 

        # On trie par date pour avoir l'historique dans l'ordre chronologique
        df.sort_values("date", inplace=True)
        
        save_to_postgres(df, 'fear_greed')
    except Exception as e:
        print(f"Erreur lors de la récupération Fear & Greed: {e}")

if __name__ == "__main__":
    scrape_fear_greed_full()

