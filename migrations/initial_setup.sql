CREATE TABLE IF NOT EXISTS token_data (
    id SERIAL PRIMARY KEY,
    token_name VARCHAR(255),
    date DATE,
    total_supply NUMERIC,
    usd_price NUMERIC,
    usd_value NUMERIC,
    UNIQUE(token_name, date)
);

CREATE TABLE IF NOT EXISTS tvl_data (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE,
    total_value_locked NUMERIC
);

CREATE TABLE IF NOT EXISTS ohlc_data (
    id SERIAL PRIMARY KEY,
    token_name VARCHAR(255),
    date DATE,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    UNIQUE(token_name, date)
);
