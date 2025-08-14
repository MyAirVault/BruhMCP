/**
 * Credit Management component
 * Self-contained component that fetches and manages account credits
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Coins, 
    Gift, 
    RefreshCw, 
    TrendingDown, 
    Calendar,
    Clock,
    CheckCircle,
    Info,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../lib/utils';
import { subscriptionApi } from '../../lib/api';
import { formatErrorMessage } from '../../lib/utils';
import type { AccountCredit } from '../../types/subscription';

interface CreditManagementProps {
    className?: string;
}

const creditReasonConfig = {
    downgrade: {
        icon: TrendingDown,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'Plan Downgrade',
        description: 'Credit from downgrading to a lower plan'
    },
    refund: {
        icon: RefreshCw,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Refund',
        description: 'Refund processed for your account'
    },
    promotion: {
        icon: Gift,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        label: 'Promotional Credit',
        description: 'Promotional or bonus credit'
    },
    adjustment: {
        icon: RefreshCw,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        label: 'Account Adjustment',
        description: 'Manual adjustment to your account'
    }
};

/**
 * Self-contained credit management component
 * @param className - Additional CSS classes
 * @returns CreditManagement JSX element
 */
export function CreditManagement({ className }: CreditManagementProps) {
    try {
        // State management
        const [credits, setCredits] = React.useState<AccountCredit[]>([]);
        const [totalBalance, setTotalBalance] = React.useState(0);
        const [pagination, setPagination] = React.useState({
            currentPage: 1,
            totalPages: 1,
            totalRecords: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            limit: 10
        });
        const [loading, setLoading] = React.useState(true);
        const [applyingCredits, setApplyingCredits] = React.useState(false);
        const [error, setError] = React.useState<string>('');
        const [showHistory, setShowHistory] = React.useState(false);
        const [includeUsed, setIncludeUsed] = React.useState(false);

        // Load credits data
        const loadCredits = React.useCallback(async (_page: number = 1, resetError: boolean = true) => {
            try {
                if (resetError) setError('');
                setLoading(true);

                const result = await subscriptionApi.getCredits();

                setCredits(result.credits);
                setTotalBalance(result.totalBalance);
                // Note: Pagination not supported by current API
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalRecords: result.credits.length,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    limit: 10
                });

            } catch (error) {
                console.error('Failed to load credits:', error);
                setError(formatErrorMessage(error));
            } finally {
                setLoading(false);
            }
        }, [includeUsed]);

        // Load credits on component mount and when filters change
        React.useEffect(() => {
            loadCredits(1);
        }, [loadCredits]);

        // Handle credit application
        const handleApplyCredits = async () => {
            try {
                setApplyingCredits(true);
                setError('');

                const result = await subscriptionApi.applyCredits();
                
                // Reload credits to reflect changes
                await loadCredits(pagination.currentPage, false);

                // Show success message (you might want to use a toast notification)
                console.log('Credits applied successfully:', result);

            } catch (error) {
                console.error('Failed to apply credits:', error);
                setError(formatErrorMessage(error));
            } finally {
                setApplyingCredits(false);
            }
        };

        // Format amount with proper conversion from paise to rupees
        const formatAmount = (amount: number, curr: string = 'INR'): string => {
            try {
                // Convert paise to rupees
                const rupees = amount / 100;
                return new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: curr.toUpperCase(),
                    minimumFractionDigits: 2
                }).format(rupees);
            } catch (error) {
                console.error('Amount formatting error:', error);
                return `${curr.toUpperCase()} ${(amount / 100).toFixed(2)}`;
            }
        };

        const formatDate = (dateString: string): string => {
            try {
                return new Date(dateString).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch (error) {
                console.error('Date formatting error:', error);
                return dateString;
            }
        };

        const formatDateTime = (dateString: string): string => {
            try {
                return new Date(dateString).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                console.error('DateTime formatting error:', error);
                return dateString;
            }
        };

        const availableCredits = credits.filter(credit => !credit.isUsed);
        const usedCredits = credits.filter(credit => credit.isUsed);
        const expiringCredits = availableCredits.filter(credit => {
            if (!credit.expiresAt) return false;
            const expiryDate = new Date(credit.expiresAt);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            return expiryDate <= thirtyDaysFromNow;
        });

        // Handle pagination
        const handlePageChange = (page: number) => {
            if (page >= 1 && page <= pagination.totalPages) {
                loadCredits(page);
            }
        };

        if (loading && credits.length === 0) {
            return (
                <Card className={className}>
                    <CardContent className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-4" />
                        <p className="text-gray-600">Loading account credits...</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className={cn("space-y-6", className)}>
                {/* Error display */}
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-900">Error Loading Credits</h4>
                                    <p className="text-sm text-red-800 mt-1">{error}</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => loadCredits(pagination.currentPage)}
                                        className="mt-2"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main balance card */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Coins className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Account Credits
                                </h2>
                                <p className="text-sm text-gray-600 font-normal">
                                    Credits from plan changes and refunds
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Balance display */}
                        <div className="text-center space-y-2">
                            <div className="text-4xl font-bold text-gray-900">
                                {formatAmount(totalBalance)}
                            </div>
                            <p className="text-sm text-gray-600">
                                Available credit balance
                            </p>
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {availableCredits.length}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Available Credits
                                </p>
                            </div>
                            <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {usedCredits.length}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Used Credits
                                </p>
                            </div>
                            <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {expiringCredits.length}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Expiring Soon
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        {totalBalance > 0 && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="primary"
                                    onClick={handleApplyCredits}
                                    disabled={applyingCredits || loading}
                                    className="flex items-center justify-center space-x-2"
                                >
                                    <Coins className="h-4 w-4" />
                                    <span>
                                        {applyingCredits ? 'Applying...' : 'Apply to Next Bill'}
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="flex items-center justify-center space-x-2"
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span>View History</span>
                                </Button>
                            </div>
                        )}

                        {totalBalance === 0 && (
                            <div className="text-center p-4 bg-white bg-opacity-60 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    No credits available. Credits are earned when you downgrade plans or receive refunds.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Expiring credits warning */}
                {expiringCredits.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                                <Clock className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="font-medium text-orange-900">
                                        Credits Expiring Soon
                                    </h4>
                                    <p className="text-sm text-orange-800">
                                        You have {formatAmount(
                                            expiringCredits.reduce((sum, credit) => sum + credit.amount, 0)
                                        )} in credits expiring within 30 days. Use them before they expire!
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={handleApplyCredits}
                                        disabled={applyingCredits}
                                        className="bg-orange-600 hover:bg-orange-700"
                                    >
                                        Apply Credits Now
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Credit history */}
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5" />
                                        <span>Credit History</span>
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={includeUsed}
                                                onChange={(e) => setIncludeUsed(e.target.checked)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-gray-600">Include used credits</span>
                                        </label>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {credits.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Coins className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No Credit History
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            You haven't received any account credits yet.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="divide-y divide-gray-100">
                                            {credits.map((credit, index) => {
                                                const config = creditReasonConfig[credit.reason as keyof typeof creditReasonConfig] || creditReasonConfig.adjustment;
                                                const Icon = config.icon;

                                                return (
                                                    <motion.div
                                                        key={credit.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className={cn(
                                                            'p-6 hover:bg-gray-50 transition-colors',
                                                            credit.isUsed && 'opacity-60'
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className={cn('p-2 rounded-lg', config.bgColor)}>
                                                                    <Icon className={cn('h-4 w-4', config.color)} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <h4 className="font-medium text-gray-900">
                                                                            {config.label}
                                                                        </h4>
                                                                        {credit.isUsed && (
                                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                                Used
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-600">
                                                                        {credit.description}
                                                                    </p>
                                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                        <span>
                                                                            Added: {formatDate(credit.createdAt)}
                                                                        </span>
                                                                        {credit.expiresAt && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>
                                                                                    Expires: {formatDate(credit.expiresAt)}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                        {credit.usedAt && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>
                                                                                    Used: {formatDateTime(credit.usedAt)}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className={cn(
                                                                    'font-semibold text-lg',
                                                                    credit.isUsed ? 'text-gray-500' : 'text-gray-900'
                                                                )}>
                                                                    {formatAmount(credit.amount, credit.currency)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination */}
                                        {pagination.totalPages > 1 && (
                                            <div className="px-6 py-4 border-t border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-600">
                                                        Showing {credits.length} of {pagination.totalRecords} credits
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                            disabled={!pagination.hasPreviousPage || loading}
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                            Previous
                                                        </Button>
                                                        <span className="text-sm text-gray-600">
                                                            Page {pagination.currentPage} of {pagination.totalPages}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                            disabled={!pagination.hasNextPage || loading}
                                                        >
                                                            Next
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Information card */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <h4 className="font-medium text-blue-900">
                                    How Credits Work
                                </h4>
                                <div className="text-sm text-blue-800 space-y-1">
                                    <p>• Credits are automatically applied to your next billing cycle</p>
                                    <p>• Downgrade credits are prorated based on unused time</p>
                                    <p>• Some credits may have expiration dates</p>
                                    <p>• Credits can be combined and used across multiple billing periods</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    } catch (error) {
        console.error('CreditManagement render error:', error);
        return (
            <Card className={className}>
                <CardContent className="text-center py-8">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Unable to load credit information. Please refresh the page.
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="primary"
                    >
                        Refresh Page
                    </Button>
                </CardContent>
            </Card>
        );
    }
}