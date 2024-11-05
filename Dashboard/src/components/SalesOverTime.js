import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

function SalesOverTime() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sales Over Time',
        backgroundColor: '#7fb8d9',
        data: []
      }
    ]
  });
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null); // Reset error state
    console.log('Fetching sales over time...');
    try {
      const response = await axios.get('http://localhost:3000/sales-over-time');
      console.log('Response data:', response.data);
      const data = response.data;

      setChartData({
        labels: data.map(item => item._id),
        datasets: [
          {
            label: 'Sales Over Time',
            backgroundColor: '#7fb8d9',
            data: data.map(item => item.totalPrice)
          }
        ]
      });
    } catch (err) {
      setError('Error fetching data');
      console.error('Error fetching sales over time:', err);
    }
  };

  return (
    <div>
      <h2>Sales Over Time</h2>
      <button onClick={fetchData}>Fetch Data</button>
      {error && <p>{error}</p>}
      <Line data={chartData} />
    </div>
  );
}

export default SalesOverTime;