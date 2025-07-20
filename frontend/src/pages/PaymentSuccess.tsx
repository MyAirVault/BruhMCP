import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate('/?upgrade=success');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Thank you for upgrading to the Pro plan.
          </p>
          
          <p className="text-gray-500 mb-8">
            Your plan is being activated and will be ready in a few moments.
          </p>

          {/* Processing indicator */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center space-x-2 text-indigo-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Activating your Pro plan...</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/?upgrade=success')}
            className="w-full bg-indigo-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 group"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Auto-redirect notice */}
          <p className="text-sm text-gray-500 mt-4">
            You will be redirected automatically in 5 seconds
          </p>
        </div>

        {/* Features reminder */}
        <div className="mt-6 bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            What's included in your Pro plan:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Unlimited MCP instances</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Priority support</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Advanced features</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>No usage limits</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;