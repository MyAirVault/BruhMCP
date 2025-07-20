import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import VerifyPage from './pages/VerifyPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import { BillingPage } from './pages/Billing';
import { CheckoutPage } from './pages/Checkout';
// import Profile from './pages/Profile'; // Commented out as profile section is not implemented yet

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/billing/checkout" element={<CheckoutPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        {/* <Route path="/profile" element={<Profile />} /> */} {/* Commented out as profile section is not implemented yet */}
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
