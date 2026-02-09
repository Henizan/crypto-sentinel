# Importation des bibliothèques
import schedule
import time
import sys
import os
from datetime import datetime

# Ajout du chemin pour importer nos propres scripts
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from Coingecko_script import fetch_and_store_prices
from Cryptopanic_news import fetch_cryptopanic_news
from Fear_greed_script import scrape_fear_greed_full

def job_prices():
    # Tâche : Récupération des prix
    print(f"[{datetime.now()}] Starting Price Collection Job...")
    try:
        fetch_and_store_prices()
        print(f"[{datetime.now()}] Price Collection Job Completed.")
    except Exception as e:
        print(f"[{datetime.now()}] Price Collection Job Failed: {e}")

def job_news():
    # Tâche : Récupération des news
    print(f"[{datetime.now()}] Starting News Collection Job...")
    try:
        fetch_cryptopanic_news()
        print(f"[{datetime.now()}] News Collection Job Completed.")
    except Exception as e:
        print(f"[{datetime.now()}] News Collection Job Failed: {e}")

def job_fear_greed():
    # Tâche : Récupération Fear & Greed
    print(f"[{datetime.now()}] Starting Fear & Greed Collection Job...")
    try:
        scrape_fear_greed_full()
        print(f"[{datetime.now()}] Fear & Greed Collection Job Completed.")
    except Exception as e:
        print(f"[{datetime.now()}] Fear & Greed Collection Job Failed: {e}")

def run_all_now():
    # Fonction utilitaire pour tout lancer au démarrage (utile pour tester)
    print("Running all jobs immediately on startup...")
    job_prices()
    job_news()
    job_fear_greed()

# --- Définition du Planning ---
# Prix : Toutes les heures
schedule.every(1).hours.do(job_prices)

# Actualités : Toutes les 8 heures (3 fois par jour)
schedule.every(8).hours.do(job_news)

# Indice Fear & Greed : Une fois par jour (24h)
schedule.every(24).hours.do(job_fear_greed)

if __name__ == "__main__":
    print("Scheduler started...")
    print("Schedule:")
    print("- Prices: Every 1 hour")
    print("- News: Every 8 hours")
    print("- Fear & Greed: Every 24 hours")
    
    # Voulez-vous lancer toutes les tâches tout de suite au démarrage ?
    # Décommentez la ligne suivante :
    # run_all_now()
    
    # Boucle infinie pour vérifier et exécuter les tâches planifiées
    while True:
        schedule.run_pending()
        time.sleep(1)
