import torch
import torch.nn as nn
import joblib 
import pandas as pd
import os
from sklearn.preprocessing import MinMaxScaler
from models.inference import get_latest_data, prepare_tensors, CryptoAutoEncoder

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def train_all_cryptos(epochs=100):
    # 1. Charger le CSV pour lister les cryptos disponibles
    if not os.path.exists("data_xrp.csv"):
        print("Erreur : data_xrp.csv introuvable.")
        return
    
    df_all = pd.read_csv("data_xrp.csv")
    unique_cryptos = df_all['crypto'].unique()
    print(f"Cryptos détectées : {unique_cryptos}")

    
    if not os.path.exists("models/saved"):
        os.makedirs("models/saved")

    for symbol in unique_cryptos:
        print(f"\n--- Entraînement de {symbol} ---")
        
        # Récupération des données via ton inference.py (qui filtre le CSV)
        df = get_latest_data(symbol, n_rows=2000)
        
        if df is None or len(df) < 100:
            print(f"Pas assez de données pour {symbol}, on passe.")
            continue

        # Normalisation
        scaler = MinMaxScaler()
        cols = ['close', 'volume', 'high', 'low']
        df[cols] = scaler.fit_transform(df[cols])
        
        # Sauvegarde du scaler spécifique
        joblib.dump(scaler, f'models/saved/scaler_{symbol}.pkl')

        # Tenseurs
        inputs = prepare_tensors(df).to(device)
        
        # Modèle AutoEncoder
        model_ae = CryptoAutoEncoder(input_dim=4).to(device)
        optimizer = torch.optim.Adam(model_ae.parameters(), lr=0.001)
        criterion = nn.MSELoss()

        # Boucle d'entraînement flash
        for epoch in range(epochs):
            model_ae.train()
            optimizer.zero_grad()
            
            ae_input = inputs.permute(0, 2, 1).squeeze(0)
            reconstructed = model_ae(ae_input)
            loss = criterion(reconstructed, ae_input)
            
            loss.backward()
            optimizer.step()

        # Sauvegarde du modèle spécifique
        torch.save(model_ae.state_dict(), f"models/saved/autoencoder_{symbol}.pth")
        print(f"Modèle {symbol} terminé. Loss: {loss.item():.6f}")

if __name__ == "__main__":
    train_all_cryptos()