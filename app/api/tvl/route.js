import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

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

  return NextResponse.json({
    tokens: tokenData,
    totalValueLocked
  });
}
