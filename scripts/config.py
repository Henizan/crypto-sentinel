import os
from dotenv import load_dotenv

# Chargement des variables d'environnement depuis le fichier .env
# Cela est crucial pour sécuriser nos mots de passe et clés API.
load_dotenv()

# --- Configuration de la Base de Données ---
# On récupère les accès depuis les variables d'environnement.
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")

# Création de la chaîne de connexion pour SQLAlchemy
DB_CONNECTION_STR = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# --- Clés API ---
# Clés nécessaires pour interroger CoinGecko et CryptoPanic.
COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY") 
CRYPTOPANIC_API_KEY = os.getenv("CRYPTOPANIC_API_KEY")

# --- Chemins du Projet ---
# Définition dynamique des chemins pour que le code fonctionne sur n'importe quelle machine.
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPTS_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
