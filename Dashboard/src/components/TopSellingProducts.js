import React, { useState } from 'react';
import axios from 'axios';
import { HorizontalBar } from 'react-chartjs-2';

function TopSellingProducts() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Top Selling Products',
        backgroundColor: '#34d399',
        data: []
      }
    ]
  });
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null); // Reset error state
    try {
      const response = await axios.get('http://localhost:3000/top-selling-products');
      const data = response.data;

      setChartData({
        labels: data.map(item => item._id),
        datasets: [
          {
            label: 'Top Selling Products',
            backgroundColor: '#34d399',
            data: data.map(item => item.quantity)
          }
        ]
      });
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Top Selling Products</h2>
      <button onClick={fetchData}>Fetch Data</button>
      {error && <p>{error}</p>}
      <HorizontalBar data={chartData} />
    </div>
  );
}

export default TopSellingProducts;