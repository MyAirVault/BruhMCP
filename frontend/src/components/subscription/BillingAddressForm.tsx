/**
 * Billing Address Form Component
 * Collects billing address information for payment processing
 */

import { MapPin, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import CountryDropdown from '../ui/CountryDropdown';

export interface BillingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

interface BillingAddressFormProps {
    billingAddress: BillingAddress;
    onBillingAddressChange: (address: BillingAddress) => void;
    errors?: Partial<Record<keyof BillingAddress, string>>;
    disabled?: boolean;
}

/**
 * Form for collecting billing address information
 * Required for payment processing and tax compliance
 */
export function BillingAddressForm({
    billingAddress,
    onBillingAddressChange,
    errors = {},
    disabled = false,
}: BillingAddressFormProps) {
    try {
        const handleInputChange = (field: keyof BillingAddress, value: string) => {
            try {
                onBillingAddressChange({
                    ...billingAddress,
                    [field]: value,
                });
            } catch (error) {
                console.error('Billing address update error:', error);
            }
        };


        const getFieldError = (field: keyof BillingAddress): string | undefined => {
            return errors[field];
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Billing Address</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Required for payment processing and tax calculation
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                            </label>
                            <Input
                                type="text"
                                value={billingAddress.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                placeholder="John"
                                disabled={disabled}
                                error={getFieldError('firstName')}
                                className={getFieldError('firstName') ? 'border-red-300' : ''}
                            />
                            {getFieldError('firstName') && (
                                <p className="text-sm text-red-600 mt-1">{getFieldError('firstName')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                            </label>
                            <Input
                                type="text"
                                value={billingAddress.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                placeholder="Doe"
                                disabled={disabled}
                                error={getFieldError('lastName')}
                                className={getFieldError('lastName') ? 'border-red-300' : ''}
                            />
                            {getFieldError('lastName') && (
                                <p className="text-sm text-red-600 mt-1">{getFieldError('lastName')}</p>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <Input
                                type="email"
                                value={billingAddress.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="john@example.com"
                                disabled={disabled}
                                error={getFieldError('email')}
                                className={getFieldError('email') ? 'border-red-300' : ''}
                            />
                            {getFieldError('email') && (
                                <p className="text-sm text-red-600 mt-1">{getFieldError('email')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <Input
                                type="tel"
                                value={billingAddress.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                disabled={disabled}
                                error={getFieldError('phone')}
                                className={getFieldError('phone') ? 'border-red-300' : ''}
                            />
                            {getFieldError('phone') && (
                                <p className="text-sm text-red-600 mt-1">{getFieldError('phone')}</p>
                            )}
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 1 *
                            </label>
                            <Input
                                type="text"
                                value={billingAddress.addressLine1}
                                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                                placeholder="123 Main Street"
                                disabled={disabled}
                                error={getFieldError('addressLine1')}
                                className={getFieldError('addressLine1') ? 'border-red-300' : ''}
                            />
                            {getFieldError('addressLine1') && (
                                <p className="text-sm text-red-600 mt-1">{getFieldError('addressLine1')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 2
                            </label>
                            <Input
                                type="text"
                                value={billingAddress.addressLine2 || ''}
                                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                                placeholder="Apartment, suite, unit, building, floor, etc."
                                disabled={disabled}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City *
                                </label>
                                <Input
                                    type="text"
                                    value={billingAddress.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    placeholder="New York"
                                    disabled={disabled}
                                    error={getFieldError('city')}
                                    className={getFieldError('city') ? 'border-red-300' : ''}
                                />
                                {getFieldError('city') && (
                                    <p className="text-sm text-red-600 mt-1">{getFieldError('city')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State/Province *
                                </label>
                                <Input
                                    type="text"
                                    value={billingAddress.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    placeholder="NY"
                                    disabled={disabled}
                                    error={getFieldError('state')}
                                    className={getFieldError('state') ? 'border-red-300' : ''}
                                />
                                {getFieldError('state') && (
                                    <p className="text-sm text-red-600 mt-1">{getFieldError('state')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Postal Code *
                                </label>
                                <Input
                                    type="text"
                                    value={billingAddress.postalCode}
                                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                    placeholder="10001"
                                    disabled={disabled}
                                    error={getFieldError('postalCode')}
                                    className={getFieldError('postalCode') ? 'border-red-300' : ''}
                                />
                                {getFieldError('postalCode') && (
                                    <p className="text-sm text-red-600 mt-1">{getFieldError('postalCode')}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country *
                            </label>
                            <CountryDropdown
                                value={billingAddress.country}
                                onChange={(value: string) => handleInputChange('country', value)}
                                error={!!getFieldError('country')}
                                className={getFieldError('country') ? 'border-red-300' : ''}
                            />
                            {getFieldError('country') && (
                                <p className="text-sm text-red-600 mt-1">{getFieldError('country')}</p>
                            )}
                        </div>
                    </div>

                    {/* Data Usage Notice */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <Building className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Billing Address Usage</p>
                                <ul className="text-xs space-y-1">
                                    <li>• Used for payment processing and fraud prevention</li>
                                    <li>• Required for tax calculation and compliance</li>
                                    <li>• Information is securely encrypted and not shared</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error('BillingAddressForm render error:', error);
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <p className="text-red-600 mb-4">
                        Unable to load billing address form. Please refresh the page and try again.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Refresh Page
                    </button>
                </CardContent>
            </Card>
        );
    }
}