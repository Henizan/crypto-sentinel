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

# Import du logger
from logger_config import setup_logger

logger = setup_logger("scheduler")

def job_prices():
    # Tâche : Récupération des prix
    logger.info("Starting Price Collection Job...")
    try:
        fetch_and_store_prices()
        logger.info("Price Collection Job Completed.")
    except Exception as e:
        logger.error(f"Price Collection Job Failed: {e}", exc_info=True)

def job_news():
    # Tâche : Récupération des news
    logger.info("Starting News Collection Job...")
    try:
        fetch_cryptopanic_news()
        logger.info("News Collection Job Completed.")
    except Exception as e:
        logger.error(f"News Collection Job Failed: {e}", exc_info=True)

def job_fear_greed():
    # Tâche : Récupération Fear & Greed
    logger.info("Starting Fear & Greed Collection Job...")
    try:
        scrape_fear_greed_full()
        logger.info("Fear & Greed Collection Job Completed.")
    except Exception as e:
        logger.error(f"Fear & Greed Collection Job Failed: {e}", exc_info=True)

def run_all_now():
    # Fonction utilitaire pour tout lancer au démarrage (utile pour tester)
    logger.info("Running all jobs immediately on startup...")
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
    logger.info("Scheduler started...")
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
