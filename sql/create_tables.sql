-- Création table du ohlcv
CREATE TABLE IF NOT EXISTS ohlcv (
    id SERIAL PRIMARY KEY,
    crypto VARCHAR(10) NOT NULL,
    open_time TIMESTAMP NOT NULL,
    close_time TIMESTAMP,
    open NUMERIC(18,8),
    high NUMERIC(18,8),
    low NUMERIC(18,8),
    close NUMERIC(18,8),
    volume NUMERIC(30,10),
    UNIQUE(crypto, open_time) 
);
-- Création table du Fear & Greed Index
CREATE TABLE IF NOT EXISTS fear_greed (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP UNIQUE,               
    value INT CHECK (value BETWEEN 0 AND 100), 
    classification VARCHAR(50)            
);

CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    source VARCHAR(100),
    title TEXT NOT NULL,
    published_at TIMESTAMP,
);
