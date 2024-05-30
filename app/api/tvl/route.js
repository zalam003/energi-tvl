import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import pool from '../../../config/db';

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

async function fetchTokenPrice(id) {
  const response = await fetch(`${COINGECKO_API}?ids=${id}&vs_currencies=usd`);
  const data = await response.json();
  return data[id]?.usd || 0;
}

async function fetchTotalSupply(contract, decimals) {
  const response = await fetch(`https://explorer.energi.network/api?module=stats&action=tokensupply&contractaddress=${contract}`);
  const data = await response.json();
  return parseFloat(data.result) / Math.pow(10, decimals) || 0;
}

async function saveTokenData(tokenData, totalValueLocked) {
  const client = await pool.connect();
  try {
    const currentDate = new Date().toISOString().split('T')[0];

    await client.query('BEGIN');
    for (const token of tokenData) {
      await client.query(
        `INSERT INTO token_data (token_name, date, total_supply, usd_price, usd_value)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (token_name, date) DO UPDATE SET
        total_supply = EXCLUDED.total_supply,
        usd_price = EXCLUDED.usd_price,
        usd_value = EXCLUDED.usd_value`,
        [token.name, currentDate, token.supply, token.price, token.usd_value]
      );
    }

    await client.query(
      `INSERT INTO tvl_data (date, total_value_locked)
      VALUES ($1, $2)
      ON CONFLICT (date) DO UPDATE SET
      total_value_locked = EXCLUDED.total_value_locked`,
      [currentDate, totalValueLocked]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function GET() {
  const jsonDirectory = path.join(process.cwd(), 'app/api/tvl/tokens.json');
  const fileContents = await fs.readFile(jsonDirectory, 'utf8');
  const tokens = JSON.parse(fileContents);

  const tokenDataPromises = tokens.map(async (token) => {
    const [price, supply] = await Promise.all([
      fetchTokenPrice(token.coingecko_id),
      fetchTotalSupply(token.contract, token.decimals)
    ]);
    return {
      ...token,
      price,
      supply,
      usd_value: price * supply
    };
  });

  const tokenData = await Promise.all(tokenDataPromises);
  const totalValueLocked = tokenData.reduce((sum, token) => sum + token.usd_value, 0);

  await saveTokenData(tokenData, totalValueLocked);

  return NextResponse.json({
    tokens: tokenData,
    totalValueLocked
  });
}
