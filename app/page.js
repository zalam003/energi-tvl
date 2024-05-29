// app/page.js
'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [data, setData] = useState({ tokens: [], totalValueLocked: 0 });

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/tvl');
      const result = await response.json();
      setData(result);
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Energi Chain TVL</h1>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Total Supply</th>
            <th>USD Value</th>
          </tr>
        </thead>
        <tbody>
          {data.tokens.map((token) => (
            <tr key={token.contract}>
              <td>{token.name}</td>
              <td>{token.supply}</td>
              <td>${token.usd_value.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Total Value Locked: ${data.totalValueLocked.toFixed(2)}</h2>
    </div>
  );
}
