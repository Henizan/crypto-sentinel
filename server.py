from flask import Flask, jsonify
from flask_cors import CORS
import torch
import joblib
import os
from models.inference import get_latest_data, CryptoAutoEncoder

app = Flask(__name__)
CORS(app)

def analyze_crypto(symbol):
    try:
        # Chemins dynamiques selon le symbole
        model_path = f"models/saved/autoencoder_{symbol}.pth"
        scaler_path = f"models/saved/scaler_{symbol}.pkl"
        
        if not os.path.exists(model_path):
            return None

        # Charger l'IA
        model = CryptoAutoEncoder(input_dim=4)
        model.load_state_dict(torch.load(model_path, map_location='cpu'))
        model.eval()
        scaler = joblib.load(scaler_path)
        
        # Récupérer la dernière ligne du CSV pour cette crypto
        df = get_latest_data(symbol)
        if df is None: return None
        
        # Préparation des données numériques
        features = df[['close', 'volume', 'high', 'low']]
        features = features.replace('"', '', regex=True).astype(float)
        
        scaled = scaler.transform(features)
        tensor = torch.tensor(scaled, dtype=torch.float32)
        
        with torch.no_grad():
            reconstructed = model(tensor)
            loss = torch.nn.functional.mse_loss(reconstructed, tensor).item()
        
        # Calcul du signal (Anomalie si la perte est haute)
        return {
            "price": f"{float(df['close'].iloc[-1]):.2f} €",
            "signal": "ANOMALIE" if loss > 0.05 else "STABLE",
            "sentiment": "Bearish" if loss > 0.05 else "Bullish",
            "rsi": "52", # Tu pourras calculer le vrai RSI plus tard
            "macd": "N/A"
        }
    except Exception as e:
        print(f"[-] Erreur analyse {symbol} : {e}")
        return None

@app.route('/api/stats')
def get_stats():
    results = {}
    for s in ['BTC', 'ETH', 'SOL', 'XRP']:
        data = analyze_crypto(s)
        if data:
            results[s] = data
        else:
            results[s] = {"price": "Indispo.", "signal": "Erreur"}
    return jsonify(results)

if __name__ == '__main__':
    app.run(port=5000, debug=True)