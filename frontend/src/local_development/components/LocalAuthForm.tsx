/**
 * Local Development Authentication Form
 * @fileoverview React component for local development email/password authentication
 */

import React, { useState } from 'react';
import { localLogin } from '../services/localAuthService';

interface LocalAuthFormProps {
    onSuccess: (user: any, isNewUser: boolean) => void;
    onError: (error: string) => void;
    defaultEmail?: string;
}

export const LocalAuthForm: React.FC<LocalAuthFormProps> = ({ 
    onSuccess, 
    onError, 
    defaultEmail = '' 
}) => {
    const [email, setEmail] = useState(defaultEmail);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !password) {
            onError('Please enter both email and password');
            return;
        }

        if (password.length < 6) {
            onError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const result = await localLogin({ email, password });

            if (result.success && result.user) {
                onSuccess(result.user, result.isNewUser || false);
            } else {
                onError(result.message || 'Login failed');
            }
        } catch (error) {
            onError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md border">
            {/* Local Development Mode Indicator */}
            <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        <h3 className="text-sm font-semibold text-blue-800">
                            🚀 Local Development Mode
                        </h3>
                    </div>
                    <p className="text-xs text-blue-600">
                        Enter any email and password to login or create an account automatically.
                        SMTP is disabled in this mode.
                    </p>
                </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label 
                        htmlFor="email" 
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="dev@localhost.com"
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label 
                        htmlFor="password" 
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter password (min 6 chars)"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            disabled={isLoading}
                        >
                            {showPassword ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </div>
                    ) : (
                        'Sign In / Create Account'
                    )}
                </button>
            </form>

            {/* Helper Information */}
            <div className="mt-6 p-3 bg-gray-50 rounded-md">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Local Development Tips:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li>• First time with an email? Account will be created automatically</li>
                    <li>• Existing user? Use your password to login</li>
                    <li>• Forgot password? Use CLI: <code className="bg-gray-200 px-1 rounded">npm run auth:set-password</code></li>
                    <li>• List users: <code className="bg-gray-200 px-1 rounded">npm run auth:list-users</code></li>
                </ul>
            </div>
        </div>
    );
};