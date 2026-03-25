import pandas as pd
from sqlalchemy import create_engine, text
from transformers import pipeline
from config import DB_CONNECTION_STR 

def analyze_sentiments():
    # 1. Chargement de l'IA (FinBERT)
    print(" Chargement de l'IA FinBERT...")
    analyzer = pipeline("text-classification", model="ProsusAI/finbert")
    
    # 2. Connexion à la base
    print(" Connexion à la base de données...")
    engine = create_engine(DB_CONNECTION_STR)
    
    # 3. On cherche les articles qui n'ont pas encore été analysés
    # On regarde si la colonne sentiment est 'a_analyser' OU si elle est vide (NULL)
    query_select = text("""
        SELECT id, title, description 
        FROM news 
        WHERE sentiment = 'A_ANALYSER' OR sentiment IS NULL
    """)
    
    with engine.connect() as conn:
        result = conn.execute(query_select)
        rows = result.fetchall()
        
        if not rows:
            print("Tous les articles ont déjà été analysés !")
        else:
            print(f" Analyse de {len(rows)} articles en cours...\n")
            
            for row in rows:
                article_id, title, description = row
                
                # Fusion Titre + Description
                text_to_test = f"{title}. {description if description else ''}"[:512]
                
                # Analyse FinBERT
                prediction = analyzer(text_to_test)[0]
                label = prediction['label'] # 'positive', 'negative', 'neutral'
                
                # Update de la base
                query_update = text("UPDATE news SET sentiment = :label WHERE id = :id")
                conn.execute(query_update, {"label": label, "id": article_id})
        
            # On valide les changements
            conn.commit()
            print("\n Analyse terminée et sauvegardée dans la base !")

if __name__ == "__main__":
    analyze_sentiments()