import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SalesVolumeByCategory from './components/SalesVolumeByCategory';
import TotalSalesByPaymentMethod from './components/TotalSalesByPaymentMethod';
import SalesOverTime from './components/SalesOverTime';
import TopSellingProducts from './components/TopSellingProducts';
import SalesDistributionByLocation from './components/SalesDistributionByLocation';
import TotalTransactions from './components/TotalTransactions';
import CRUDPage from './components/CRUDPage';
import './App.css';  // Import the CSS file

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Retail Store Sales Visualization</h1>
      <div className="grid-container">
        <div className="grid-item"><SalesVolumeByCategory /></div>
        <div className="grid-item"><TotalSalesByPaymentMethod /></div>
        <div className="grid-item"><SalesOverTime /></div>
        <div className="grid-item"><TopSellingProducts /></div>
        <div className="grid-item"><TotalTransactions /></div>
        <div className="grid-item map-item"><SalesDistributionByLocation /></div>
      </div>
      <div className="crud-button-container">
        <Link to="/crud"><button className="crud-button">CRUD Operations</button></Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crud" element={<CRUDPage />} />
      </Routes>
    </Router>
  );
}

export default App;