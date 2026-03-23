# Crypto Sentinel Dashboard

Crypto Sentinel est une application web affichant un tableau de bord des cryptomonnaies (Bitcoin, Ethereum, Solana, XRP) avec des indicateurs techniques interactifs et des analyses de sentiment basées sur l'intelligence artificielle.

L'application est composée de deux parties :
- **Un backend API (Python / FastAPI)** qui récupère les données dans une base PostgreSQL.
- **Un frontend (React / Vite)** qui affiche les données dynamiquement.

---

## 1. Installation

### Prérequis
- [Node.js](https://nodejs.org/) (pour lancer le frontend)
- [Python 3.x](https://www.python.org/downloads/) (pour l'API et les scripts)
- (Optionnel) [DockerDesktop](https://www.docker.com/) si vous souhaitez utiliser une base de données locale vide au lieu de celle de production.

### Cloner et configurer le projet
1. **Cloner le repository** et se placer dedans :
   ```bash
   git clone <votre-lien-git>
   cd pfe
   ```
2. **Créer le fichier d'environnement** :
   Localisez le fichier `.env.example`, copiez-le et renommez la copie en `.env`. Gardez les paramètres par défaut pour vous connecter à la base distante Google Cloud via le tunnel SSH (ou modifiez les valeurs selon votre configuration locale).

### Installer les dépendances
Ouvrez votre terminal dans le dossier du projet et exécutez ces deux commandes :

Pour le frontend (React) :
```bash
npm install
```

Pour le backend (Python) :
```bash
pip install -r requirements.txt
```

---

## 2. Lancement de l'application

L'application nécessite que le **Tunnel SSH**, le **Backend** et le **Frontend** tournent en même temps.
Ouvrez **3 terminaux séparés** :

### Terminal 1 : Tunnel vers la Base de Données (Production)
Afin de récupérer les données depuis la VM Google Cloud de manière sécurisée, établissez un tunnel SSH :
```bash
gcloud compute ssh pfe-crypto-server --zone=europe-west1-b -- -L 5433:localhost:5432
```
*(Laissez ce terminal ouvert en arrière-plan. Si vous n'avez pas gcloud, utilisez la commande `ssh` classique si votre clé est sur GCP).*

> **Note alternative locale :** Si vous ne voulez **pas** utiliser le serveur GCP, vous pouvez lancer une base PostgreSQL locale vide avec la commande `docker-compose up -d`. Pensez alors à modifier votre fichier `.env` (`POSTGRES_PORT=5432` et `DB_PORT=5432`).

### Terminal 2 : API (Backend)
Dans un nouveau terminal positionné à la racine du projet `pfe`, lancez le serveur FastAPI :
```bash
python -m uvicorn api.main:app --reload
```
L'API devrait maintenant être accessible sur [http://localhost:8000/api/dashboard/stats](http://localhost:8000/api/dashboard/stats).

### Terminal 3 : Dashboard (Frontend)
Dans un troisième terminal, toujours à la racine du projet, lancez le serveur de développement React :
```bash
npm run dev
```

---

## 3. Utilisation

Une fois les terminaux lancés, ouvrez votre navigateur à l'adresse :
**[http://localhost:5173](http://localhost:5173)**
