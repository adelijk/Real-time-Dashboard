import React, { useState } from 'react';
import axios from 'axios';

function TotalTransactions() {
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null); // Reset error state
    console.log('Fetching total transactions...');
    try {
      const response = await axios.get('http://localhost:3000/total-transactions');
      console.log('Response data:', response.data);
      setTotalTransactions(response.data.total);
    } catch (err) {
      setError('Error fetching data');
      console.error('Error fetching total transactions:', err);
    }
  };

  return (
    <div>
      <h2>Total Transactions</h2>
      <button onClick={fetchData}>Fetch Data</button>
      {error && <p>{error}</p>}
      <p>Total Transactions: {totalTransactions}</p>
    </div>
  );
}

export default TotalTransactions;