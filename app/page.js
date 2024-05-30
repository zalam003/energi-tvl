import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const TVLChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/tvl');
      const data = await response.json();
      setChartData(data);
    };
    fetchData();
  }, []);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  const dates = chartData.tokens.map(token => token.date);
  const usdValues = chartData.tokens.map(token => token.usd_value);

  const data = {
    labels: dates,
    datasets: chartData.tokens.map((token, index) => ({
      label: token.name,
      data: usdValues[index],
      backgroundColor: `rgba(${index * 50}, ${100 + index * 20}, ${150 + index * 30}, 0.6)`,
    })),
  };

  return (
    <div>
      <h1>TVL Chart</h1>
      <Bar data={data} />
    </div>
  );
};

export default TVLChart;

