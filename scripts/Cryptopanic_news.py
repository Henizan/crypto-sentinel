import requests
import json
import time

def fetch_cryptopanic_news():

    #CONFIGURATION
    API_TOKEN = "f88a898a480a5bc5ff77e67e8fd84e1c3dcf1311"
    BASE_URL = "https://cryptopanic.com/api/developer/v2/posts/"
    params = {
        "auth_token": API_TOKEN,
        "currencies": "BTC,ETH,SOL,XRP",  
        "kind": "news",                   
        "filter": "important",            
        "regions": "en,fr",              
        "public": "true"                  
    }
    csv_file_path = "data/excryptopanic_news.csv"
    csv_headers = ["date", "title", "url"]
    
    try:
        #Execution de la requête API
        response = requests.get(BASE_URL, params=params, timeout=10)
        
        #Vérification du statut HTTP
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            
            print(f"Succès : {len(results)} articles récupérés.\n")
            
            #Traitement et affichage des données
            for item in results:
                #Extraction des champs essentiels
                title = item.get('title', 'Titre inconnu')
                published_at = item.get('published_at')
                description = item.get('description', 'Pas de description')

                #Affichage formaté la console
                print(f"date : [{published_at}]")
                print(f"titre :{title}")
                print(f"description : {description}")
                print("-" * 60)
                


        #GESTION DES ERREURS
        elif response.status_code == 401:
            print("Erreur 401 : Token API invalide ou manquant.")
        elif response.status_code == 429:
            print("Erreur 429 : Nombre de requêtes dépassée. Attendre avant de relancer.")
        else:
            print(f"Erreur {response.status_code} : {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Erreur de connexion réseau : {e}")
    except Exception as e:
        print(f"Erreur inattendue : {e}")
