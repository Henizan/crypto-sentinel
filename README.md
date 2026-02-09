# Crypto Sentinel Automation

This project automates the collection of Cryptocurrency Prices, News, and Fear & Greed Index data into a PostgreSQL (TimescaleDB) database.

## 1. Setup

### Prerequisites
- Python 3.8+
- Docker & Docker Compose

### Installation

1.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Configuration**:
    Create a `.env` file in the `scripts/` directory (or root) with your API keys and DB credentials.
    ```ini
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=password
    POSTGRES_DB=cryptosentinel
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    
    COINGECKO_API_KEY=your_coingecko_key
    CRYPTOPANIC_API_KEY=your_cryptopanic_key
    ```
    *Note: The scripts contain default keys as fallbacks, but it is recommended to use your own.*

3.  **Start Database**:
    ```bash
    docker-compose up -d
    ```

## 2. Running Data Collection

### Manual Run
You can run individual scripts to test:
```bash
python scripts/Coingecko_script.py
python scripts/Cryptopanic_news.py
python scripts/Fear_greed_script.py
```

### Automated Scheduler
To start the automatic collection (Prices every 1h, News every 8h):
```bash
python scripts/scheduler.py
```
Keep this script running (e.g., in a terminal, or use `nohup`/systemd on a server).

## 3. Data Storage
- **Prices**: Table `ohlcv`
- **News**: Table `news`
- **Sentiment**: Table `fear_greed`

## 4. Next Steps
- Prepare dataset for LLM training (Export script to be created).
