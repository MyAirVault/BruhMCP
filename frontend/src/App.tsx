import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import VerifyPage from './pages/VerifyPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import { CheckoutPage } from './components/billing/CheckoutPage';
// import Profile from './pages/Profile'; // Commented out as profile section is not implemented yet

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/billing/checkout" element={<CheckoutPage />} />
        <Route path="/billing/success" element={<CheckoutPage />} />
        <Route path="/billing/cancelled" element={<CheckoutPage />} />
        {/* <Route path="/profile" element={<Profile />} /> */} {/* Commented out as profile section is not implemented yet */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
