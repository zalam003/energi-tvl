CREATE TABLE IF NOT EXISTS token_data (
    id SERIAL PRIMARY KEY,
    token_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    total_supply DECIMAL NOT NULL,
    usd_price DECIMAL NOT NULL,
    usd_value DECIMAL NOT NULL
);

CREATE TABLE IF NOT EXISTS tvl_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_value_locked DECIMAL NOT NULL
);

