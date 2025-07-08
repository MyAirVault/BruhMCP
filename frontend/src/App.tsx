import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import VerifyPage from './pages/VerifyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">MiniMCP</h1>
              <p className="text-gray-600">Authentication system ready</p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
