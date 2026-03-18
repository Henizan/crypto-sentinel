import torch
import torch.nn as nn
from models.inference import get_latest_data, prepare_tensors
from models.architectures import CryptoTCN, CryptoAutoEncoder


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_tcn = CryptoTCN(num_inputs=4, num_channels=[16, 16, 16]).to(device)
criterion = nn.MSELoss() # Calcul de l'erreur
optimizer = torch.optim.Adam(model_tcn.parameters(), lr=0.001)

def train_one_epoch(symbol):
    # recup des donnees via le pipeline de Hugo
    data = get_latest_data(symbol, n_rows=1000)
    if data is None: return
    
    
    inputs = prepare_tensors(data).to(device)
    
    
    target = inputs[:, 0, -1] 
    
    # Boucle d'optimisation
    optimizer.zero_grad()
    output = model_tcn(inputs)
    loss = criterion(output, target)
    loss.backward()
    optimizer.step()
    
    print(f"Loss pour {symbol}: {loss.item()}")

if __name__ == "__main__":
    train_one_epoch("BTC/USDT")
    