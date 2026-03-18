import os
from dotenv import load_dotenv

load_dotenv()

# Si on est sous Windows (local), on utilise 'localhost'
# Si on est dans Docker, on utilise le nom du service 'db'
DB_HOST = os.getenv("DB_HOST", "localhost") 
if DB_HOST == "db" and os.name == "nt": # 'nt' veut dire Windows
    DB_HOST = "localhost"

DB_PORT = os.getenv("DB_PORT", "5432") # Port interne par défaut
# ATTENTION : Si ton Docker mappe 5433 -> 5432, utilise 5433 en local !
LOCAL_PORT = "5433" 

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "cryptosentinel")

# La chaîne magique
DB_CONNECTION_STR = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{LOCAL_PORT}/{DB_NAME}"

print(f"🔗 Tentative de connexion sur : {DB_CONNECTION_STR}")