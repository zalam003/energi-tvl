import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import pool from '../../../config/db';

async function fetchTokenHistoricalData() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT token_name, date, usd_value AS close,
              LAG(usd_value) OVER (PARTITION BY token_name ORDER BY date) AS open,
              MAX(usd_value) OVER (PARTITION BY token_name ORDER BY date) AS high,
              MIN(usd_value) OVER (PARTITION BY token_name ORDER BY date) AS low
      FROM token_data
      ORDER BY date ASC`
    );
    const historicalData = result.rows.reduce((acc, row) => {
      if (!acc[row.token_name]) {
        acc[row.token_name] = [];
      }
      acc[row.token_name].push({
        date: row.date,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close
      });
      return acc;
    }, {});
    return historicalData;
  } finally {
    client.release();
  }
}

export async function GET() {
  const jsonDirectory = path.join(process.cwd(), 'app/api/tvl/tokens.json');
  const fileContents = await fs.readFile(jsonDirectory, 'utf8');
  const tokens = JSON.parse(fileContents);

  const historicalData = await fetchTokenHistoricalData();

  return NextResponse.json({
    tokens: tokens.map(token => ({
      ...token,
      data: historicalData[token.name] || []
    })),
    totalValueLocked: (await pool.query('SELECT SUM(usd_value) as total_value_locked FROM tvl_data')).rows[0].total_value_locked,
  });
}
