'use client';

import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
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
  const [totalValueLocked, setTotalValueLocked] = useState(0);

  useEffect(() => {
    fetchData().then(data => {
      setTokenData(data.tokens);
      setTotalValueLocked(data.totalValueLocked);
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Total Value Locked (TVL): ${totalValueLocked.toLocaleString()}</h1>
      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-blue-900/20 p-1">
          <Tab className={({ selected }) =>
            selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
          }>
            Overview
          </Tab>
          {tokenData.map((token) => (
            <Tab key={token.name} className={({ selected }) =>
              selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
            }>
              {token.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel>
            <h2 className="text-xl font-bold mb-4">Total TVL for All Tokens</h2>
            {tokenData.length > 0 && (
              <Line
                data={{
                  labels: tokenData[0].data.map(entry => entry.date),
                  datasets: tokenData.map(token => ({
                    label: `${token.name} USD Value`,
                    data: token.data.map(entry => entry.usd_value),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                  })),
                }}
              />
            )}
          </Tab.Panel>
          {tokenData.map((token) => (
            <Tab.Panel key={token.name}>
              <h2 className="text-xl font-bold mb-4">{token.name} USD Value Over Time</h2>
              <Line data={createChartData(token.data, token.name)} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Page;
