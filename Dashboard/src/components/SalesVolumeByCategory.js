import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

function SalesVolumeByCategory() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sales Volume by Category',
        backgroundColor: '#f87979',
        data: []
      }
    ]
  });
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null); // Reset error state
    try {
      const response = await axios.get('http://localhost:3000/sales-by-category');
      const data = response.data;

      setChartData({
        labels: data.map(item => item._id),
        datasets: [
          {
            label: 'Sales Volume by Category',
            backgroundColor: '#f87979',
            data: data.map(item => item.totalQuantity)
          }
        ]
      });
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    }
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true  
      }
    }
  };

  return (
    <div>
      <h2>Sales Volume by Category</h2>
      <button onClick={fetchData}>Fetch Data</button>
      {error && <p>{error}</p>}
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default SalesVolumeByCategory;
