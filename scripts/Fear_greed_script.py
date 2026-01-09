#import des libraries
import requests
import pandas as pd
from datetime import datetime

def scrape_fear_greed_full(): #Récupère l'indice Fear & Greed complet depuis l'API Alternative.me
    url = "https://api.alternative.me/fng/?limit=0" #URL de l'API pour récupérer l'indice Fear & Greed complet
    response = requests.get(url) #Effectue une requête GET à l'API
    response.raise_for_status() #Vérifie si la requête a réussi

    data = response.json()["data"] #Parse la réponse JSON pour obtenir les données

    df = pd.DataFrame([{ #Créer un DataFrame à partir des données
        "date": datetime.fromtimestamp(int(d["timestamp"])), #Convertir le timestamp en datetime
        "value": int(d["value"]), #Valeur de l'indice
        "classification": d["value_classification"] #Classification de l'indice
    } for d in data]) 

    df.sort_values("date", inplace=True) #Trier les données par date croissante
    df.reset_index(drop=True, inplace=True) #Réinitialiser l'index

    df.to_csv("data/fear_greed_data.csv", index=False) #Exporter le DataFrame final vers un fichier CSV
    return df

if __name__ == "__main__": #Exécuter la fonction si le script est exécuté directement
    try:
        scrape_fear_greed_full() #Appeler la fonction pour récupérer et sauvegarder les données
    except Exception as e:
        print(f"Erreur durant la récupération : {e}") #Afficher un message d'erreur en cas d'échec