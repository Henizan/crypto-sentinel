# Importation des bibliothèques nécessaires
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import insert
import sys, os

# Ajout du répertoire courant pour trouver config.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import DB_CONNECTION_STR

# Initialisation du moteur de base de données SQLAlchemy
engine = create_engine(DB_CONNECTION_STR)

def insert_on_conflict_nothing(table, conn, keys, data_iter):
    # Fonction avancée pour gérer les insertions en ignorant les doublons
    data = [dict(zip(keys, row)) for row in data_iter]
    stmt = insert(table.table).values(data)

    # Définition des colonnes qui doivent être uniques pour chaque table (Clés primaires composées)
    if table.name == 'ohlcv':
        conflict_cols = ['crypto', 'open_time']
    elif table.name == 'news':
        conflict_cols = ['published_at', 'title']
    elif table.name == 'fear_greed':
        conflict_cols = ['date']
    else:
        conflict_cols = []

    # Si on a des contraintes d'unicité, on ignore les doublons (DO NOTHING)
    if conflict_cols:
        stmt = stmt.on_conflict_do_nothing(index_elements=conflict_cols)

    conn.execute(stmt)

def save_to_postgres(df: pd.DataFrame, table_name: str):
    # Fonction principale pour sauvegarder un DataFrame Pandas dans PostgreSQL
    try:
        # Nettoyage des noms de colonnes : minuscules et espaces remplacés par des underscores
        df.columns = [c.lower().replace(" ", "_") for c in df.columns]
        
        # Écriture en base avec gestion des conflits
        df.to_sql(
            table_name, 
            engine, 
            if_exists='append', 
            index=False, 
            method=insert_on_conflict_nothing
        )
        print(f"Traitement de {len(df)} lignes pour '{table_name}' (Doublons ignorés).")
        
    except Exception as e:
        print(f"Erreur lors de l'insertion dans '{table_name}': {e}")