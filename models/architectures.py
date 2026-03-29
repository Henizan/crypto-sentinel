import torch
import torch.nn as nn
from torch.nn.utils import weight_norm

class CryptoAutoEncoder(nn.Module):
    def __init__(self, input_dim, latent_dim=4):
        super(CryptoAutoEncoder, self).__init__() # Corrigé : __init__() au lieu de init()
        # Encoder 
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, latent_dim)
        )
        # Decoder 
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim)
        )

    def forward(self, x):
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        return reconstructed

# CLASSE SORTIE DE L'AUTOENCODER (Alignée à gauche)
class CausalConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, dilation):
        super().__init__()
        padding = (kernel_size - 1) * dilation
        self.conv = weight_norm(nn.Conv1d(in_channels, out_channels, kernel_size, 
                                          padding=padding, dilation=dilation))
        self.relu = nn.ReLU()

    def forward(self, x):
        # On coupe le padding à droite pour la causalité
        return self.relu(self.conv(x)[:, :, :-self.conv.padding[0]])

class CryptoTCN(nn.Module):
    def __init__(self, num_inputs, num_channels, kernel_size=2):
        super(CryptoTCN, self).__init__()
        layers = []
        num_levels = len(num_channels)
        for i in range(num_levels):
            dilation_size = 2 ** i
            in_ch = num_inputs if i == 0 else num_channels[i-1]
            out_ch = num_channels[i]
            layers += [CausalConvBlock(in_ch, out_ch, kernel_size, dilation_size)]

        self.network = nn.Sequential(*layers)
        self.linear = nn.Linear(num_channels[-1], 1) # Prédit le prix suivant

    def forward(self, x):
        y1 = self.network(x)
        return self.linear(y1[:, :, -1])

if __name__ == "__main__":
    # Test AutoEncoder
    ae = CryptoAutoEncoder(input_dim=4)
    test_input_ae = torch.randn(1, 4)
    print("AutoEncoder OK. Sortie :", ae(test_input_ae).shape)

    # Test TCN
    tcn = CryptoTCN(num_inputs=4, num_channels=[16, 16, 16])
    test_input_tcn = torch.randn(1, 4, 50)
    print("TCN OK. Sortie :", tcn(test_input_tcn).shape)