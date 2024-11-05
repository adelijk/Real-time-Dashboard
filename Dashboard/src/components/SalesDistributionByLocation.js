import React, { useState } from 'react';
import axios from 'axios';
import MapChart from './MapChart';

const SalesDistributionByLocation = () => {
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null); // Reset error state
    try {
      const response = await axios.get('http://localhost:3000/sales-distribution-by-location');
      setChartData(response.data);
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Sales Distribution by Location</h2>
      <button onClick={fetchData}>Fetch Data</button>
      {error && <p>{error}</p>}
      <div style={{ height: '600px', width: '100%' }}>
        <MapChart data={chartData} />
      </div>
    </div>
  );
};

export default SalesDistributionByLocation;
