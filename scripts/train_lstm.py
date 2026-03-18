import pandas as pd
from sqlalchemy import create_engine, text
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from config import DB_CONNECTION_STR 

engine = create_engine(DB_CONNECTION_STR)

# LA SUPER REQUÊTE QUI FUSIONNE TOUT
query = text("""
    SELECT 
        o.open_time, o.open, o.high, o.low, o.close, o.volume,
        f.value as fg_index,
        (
            SELECT AVG(CASE 
                WHEN n.sentiment = 'positive' THEN 1 
                WHEN n.sentiment = 'negative' THEN -1 
                ELSE 0 END)
            FROM news n 
            WHERE date_trunc('hour', n.published_at) = o.open_time
        ) as sentiment_score
    FROM ohlcv o
    LEFT JOIN fear_greed f ON date(f.date) = date(o.open_time)
    WHERE o.crypto = 'BTC'
    ORDER BY o.open_time ASC;
""")

print("📊 Récupération du dataset complet (Prix + Sentiment + F&G)...")
df = pd.read_sql(query, engine)

# Nettoyage rapide (remplacer les jours sans news par 0)
df['sentiment_score'] = df['sentiment_score'].fillna(0)
df['fg_index'] = df['fg_index'].ffill() # Si un jour de F&G manque

# 1. Nouvelles Features !
features = ['open', 'high', 'low', 'close', 'volume', 'fg_index', 'sentiment_score']
data = df[features].values

# 2. Le Scaling reste le même (mais sur 7 colonnes au lieu de 5)
scaler_features = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler_features.fit_transform(data)

# 3. La création de séquences (l'index du 'close' reste 3 dans ta liste)
def create_sequences(data_array, target_col_index, sequence_length=60):
    X, y = [], []
    for i in range(sequence_length, len(data_array)):
        X.append(data_array[i-sequence_length:i]) 
        y.append(data_array[i, target_col_index]) 
    return np.array(X), np.array(y)

X, y = create_sequences(scaled_data, target_col_index=3)

# La suite du code (Split 80/20) reste identique !
# 4. Découpage Entraînement (80%) et Test (20%) SANS MÉLANGER LES DATES !
split = int(len(X) * 0.8)
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

print(f"✅ Découpage terminé avec succès !")
print(f"Taille de X_train (Le Passé) : {X_train.shape} -> (Blocs, Jours, Colonnes)")
print(f"Taille de y_train (Le Futur) : {y_train.shape} -> (Cible à deviner)")
df.to_csv("final_data.csv", index=False)