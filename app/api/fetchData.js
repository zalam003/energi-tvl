import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import tokens from './api/tokens.json';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

const fetchTokenData = async () => {
  const results = [];
  for (const token of tokens) {
    const response = await fetch(`${COINGECKO_API}?ids=${token.coingecko_id}&vs_currencies=usd`);
    const data = await response.json();
    const usdValue = data[token.coingecko_id]?.usd || 0;
    results.push({ ...token, usdValue });
  }
  return results;
};

export async function GET(request) {
  try {
    const tokensData = await fetchTokenData();
    const client = await pool.connect();
    try {
      const date = new Date().toISOString().split('T')[0];
      const promises = tokensData.map(token => {
        const totalSupply = token.usdValue * (10 ** 18); // Adjust based on token decimals
        return client.query(
          `INSERT INTO token_data (date, token_name, total_supply, usd_value)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (date, token_name)
           DO UPDATE SET total_supply = EXCLUDED.total_supply, usd_value = EXCLUDED.usd_value`,
          [date, token.name, totalSupply, token.usdValue]
        );
      });
      await Promise.all(promises);
      return NextResponse.json({ message: 'Data fetched and stored successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching or storing data:', error);
    return NextResponse.json({ message: 'Error fetching or storing data', error }, { status: 500 });
  }
}
