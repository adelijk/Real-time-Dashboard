import React, { useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';

function TotalSalesByPaymentMethod() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Total Sales by Payment Method',
        backgroundColor: ['#f87979', '#7fb8d9', '#34d399'],
        data: []
      }
    ]
  });
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null); // Reset error state
    try {
      const response = await axios.get('http://localhost:3000/total-sales-by-payment-method');
      const data = response.data;

      setChartData({
        labels: data.map(item => item._id),
        datasets: [
          {
            label: 'Total Sales by Payment Method',
            backgroundColor: ['#f87979', '#7fb8d9', '#34d399'],
            data: data.map(item => item.totalPrice)
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
      <h2>Total Sales by Payment Method</h2>
      <button onClick={fetchData}>Fetch Data</button>
      {error && <p>{error}</p>}
      <Pie data={chartData} />
    </div>
  );
}

export default TotalSalesByPaymentMethod;