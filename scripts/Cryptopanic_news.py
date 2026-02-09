import requests
import pandas as pd
import sys, os
from database_manager import save_to_postgres

# Importation de la clé API depuis notre fichier de config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import CRYPTOPANIC_API_KEY

# --- Configuration de l'API CryptoPanic ---
# On définit quels news on veut : monnaies spécifiques, news uniquement (pas de médias), en anglais/français.
BASE_URL = "https://cryptopanic.com/api/developer/v2/posts/"
params = {
        "auth_token": CRYPTOPANIC_API_KEY,
        "currencies": "BTC,ETH,SOL,XRP",  
        "kind": "news",                             
        "regions": "en,fr",              
        "public": "true"                  
    }


def fetch_cryptopanic_news():
    print("Récupération des news Cryptopanic...")
    try:
        # On interroge l'API CryptoPanic
        response = requests.get(BASE_URL, params=params, timeout=10)
        
        # Si la requête a fonctionné (Code 200)
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            
            new_list = []
            
            # On parcourt les résultats pour extraire ce qui nous intéresse
            for item in results:
                new_item = {"title": item.get('title', 'Titre inconnu'),
                            "published_at": item.get('published_at'),
                            "description": item.get('description', 'Pas de description'),
                            "source": item.get('domain', 'cryptopanic.com'),
                            "sentiment": "A_ANALYSER"}
                new_list.append(new_item)

            if new_list:
                df = pd.DataFrame(new_list)
                df['published_at'] = pd.to_datetime(df['published_at'])
                save_to_postgres(df, 'news')
                
            else:
                print("Aucun article important trouvé.")
        else:
            print(f"Erreur lors de la requête API : Statut {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"Erreur de connexion réseau : {e}")
    except Exception as e:
        print(f"Erreur inattendue : {e}")

if __name__ == "__main__":
    fetch_cryptopanic_news()