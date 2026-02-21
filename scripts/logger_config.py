import logging
import os
import sys

# Création du dossier de logs s'il n'existe pas
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

LOG_FILE = os.path.join(LOG_DIR, 'collection.log')

def setup_logger(name=__name__):
    """
    Configure et retourne un logger.
    """
    logger = logging.getLogger(name)
    
    # Si le logger a déjà des handlers, on ne les rajoute pas pour éviter les doublons
    if logger.hasHandlers():
        return logger
        
    logger.setLevel(logging.INFO)

    # Formatter pour les logs
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # Handler pour écrire dans le fichier de log
    file_handler = logging.FileHandler(LOG_FILE, encoding='utf-8')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Handler pour écrire dans la console
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger
