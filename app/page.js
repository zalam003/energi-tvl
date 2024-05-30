'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const fetchData = async () => {
  const response = await fetch('/api/tvl');
  const data = await response.json();
  return data;
};

const createChartData = (tokenData, tokenName) => {
  const labels = tokenData.map(entry => entry.date);
  const data = tokenData.map(entry => entry.usd_value);

  return {
    labels,
    datasets: [
      {
        label: `${tokenName} USD Value`,
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };
};

const Page = () => {
  const [tokenData, setTokenData] = useState([]);

  useEffect(() => {
    fetchData().then(data => setTokenData(data.tokens));
  }, []);

  return (
    <div>
      <h1>Token Values Over Time</h1>
      {tokenData.length > 0 && tokenData.map(token => (
        <div key={token.name}>
          <h2>{token.name}</h2>
          <Line data={createChartData(token.data, token.name)} />
        </div>
      ))}
    </div>
  );
};

export default Page;
