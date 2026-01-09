 -- vue du btc en fonction du fear and greed
create VIEW vue_btc_feargreed AS
SELECT -- Sélection des colonnes pertinentes
    o.open_time::date AS date, -- Conversion en date
    o.open, o.high, o.low, o.close, o.volume, -- Données OHLCV
    f.value AS fear_greed_value, -- Valeur de l'indice fear and greed
    f.classification -- Classification de l'indice
FROM ohlcv o -- Table OHLCV
JOIN fear_greed f --- Table fear and greed
  ON o.open_time::date = f.date::date -- Jointure sur la date
WHERE o.crypto = 'BTC' -- Filtre pour le Bitcoin
ORDER BY o.open_time; -- Tri par date

-- vue du volume moyen par crypto-monnaie
CREATE VIEW vue_volume_par_crypto AS
SELECT -- Sélection des colonnes
    crypto, -- Nom de la crypto-monnaie
    ROUND(AVG(volume), 2) AS volume_moyen, -- Volume moyen arrondi
    ROUND(MAX(volume), 2) AS volume_max, -- Volume maximum arrondi
    COUNT(*) AS nb_jours -- Nombre de jours de données
FROM ohlcv -- Table OHLCV
GROUP BY crypto -- Regroupement par crypto-monnaie
ORDER BY volume_moyen DESC; -- Tri par volume moyen décroissant

