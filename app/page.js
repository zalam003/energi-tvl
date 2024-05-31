'use client';

import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, CandlestickController, CandlestickElement);

const fetchData = async () => {
  const response = await fetch('/api/tvl');
  const data = await response.json();
  return data;
};

const colorPalette = [
  'rgba(75, 192, 192, 1)',
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
];

const createCandlestickData = (tokenData) => {
  return tokenData.map(entry => ({
    x: entry.date,
    o: entry.open,
    h: entry.high,
    l: entry.low,
    c: entry.close,
  }));
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
              <Candlestick
                data={{
                  datasets: [{
                    label: 'Candlestick',
                    data: createCandlestickData(token.data),
                    borderColor: colorPalette[index % colorPalette.length],
                    backgroundColor: colorPalette[index % colorPalette.length],
                  }]
                }}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: `${token.name} Candlestick Chart`,
                    },
                  },
                  scales: {
                    x: {
                      type: 'time',
                      time: {
                        unit: 'day',
                      },
                      title: {
                        display: true,
                        text: 'Date',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Price (USD)',
                      },
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
