// page.js
'use client'; // Ensure the entire file is treated as a Client Component

import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Line } from 'react-chartjs-2'; // Importing Line directly from react-chartjs-2

const colorPalette = [
  'rgba(75, 192, 192, 1)',
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
];

const fetchData = async () => {
  const response = await fetch('/api/tvl');
  const data = await response.json();
  return data;
};

const HomePage = () => {
  const [tokens, setTokens] = useState([]);
  const [totalValueLocked, setTotalValueLocked] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchData();
      setTokens(data.tokens);
      setTotalValueLocked(data.totalValueLocked);
    };

    getData();
  }, []);

  return (
    <div>
      <h1>Total Value Locked (TVL): ${totalValueLocked.toLocaleString()}</h1>
      <Tab.Group>
        <Tab.List>
          {tokens.map((token, index) => (
            <Tab key={index}>{token.name}</Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {tokens.map((token, index) => (
            <Tab.Panel key={index}>
              <h2>{token.name} Price Chart</h2>
              <Line
                data={{
                  labels: token.data.map((d) => d.date),
                  datasets: [
                    {
                      label: 'USD Value',
                      data: token.data.map((d) => d.usd_value),
                      borderColor: colorPalette[index % colorPalette.length],
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: `${token.name} Price Chart`,
                    },
                  },
                }}
              />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default HomePage;
