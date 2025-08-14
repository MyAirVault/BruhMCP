/**
 * Subscription Plans component with pricing cards
 * Displays Free, Pro plans + Contact Us option
 * Adapted for current project structure
 */

import { motion } from 'framer-motion';
import { Check, Star, Zap, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { cn } from '../../lib/utils';
import type { SubscriptionPlan, UserSubscription } from '../../types/subscription';

interface SubscriptionPlansProps {
    plans: SubscriptionPlan[];
    currentSubscription?: UserSubscription | null;
    onSelectPlan: (planCode: string, billingCycle?: 'monthly' | 'yearly') => void;
    loading?: boolean;
    disabled?: boolean;
}

const planIcons = {
    free: <Zap className="h-5 w-5" />,
    pro: <Star className="h-5 w-5" />,
    contact: <Mail className="h-5 w-5" />,
};

/**
 * Subscription plans pricing component
 * Shows 2 real plans (Free, Pro) + 1 Contact Us option
 */
export function SubscriptionPlans({
    plans,
    currentSubscription,
    onSelectPlan,
    loading = false,
    disabled = false,
}: SubscriptionPlansProps) {
    try {
        // Sort plans by display_order, then add Contact Us
        const sortedPlans = [...plans].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        
        // Add Contact Us as third option
        const contactPlan: SubscriptionPlan = {
            id: 999, // Contact plan ID
            plan_code: 'contact',
            name: 'Contact Us',
            description: 'Custom solutions for enterprise needs',
            tagline: 'Tailored to your requirements',
            price_monthly: 0,
            price_yearly: 0,
            price_currency: 'INR',
            features: [
                'Everything in Pro',
                'Custom integrations',
                'Dedicated support',
                'SLA agreements',
                'Volume discounts',
                'On-premise deployment'
            ],
            limits: {},
            display_order: 3,
            is_featured: false
        };

        const allPlans = [...sortedPlans, contactPlan];
        
        const isCurrentPlan = (plan: SubscriptionPlan): boolean => {
            if (!currentSubscription || currentSubscription.status !== 'active') {
                return false;
            }
            
            return currentSubscription.plan_code === plan.plan_code;
        };

        const getButtonText = (plan: SubscriptionPlan): string => {
            if (plan.plan_code === 'contact') {
                return 'Contact Sales';
            }
            
            if (isCurrentPlan(plan)) {
                return 'Current Plan';
            }
            
            if (plan.plan_code === 'free') {
                return 'Get Started';
            }
            
            return 'Upgrade to Pro';
        };

        const getButtonVariant = (plan: SubscriptionPlan): 'primary' | 'secondary' | 'outline' => {
            if (isCurrentPlan(plan)) {
                return 'outline';
            }
            if (plan.is_featured || plan.plan_code === 'pro') {
                return 'primary';
            }
            return 'outline';
        };

        const handlePlanSelect = (plan: SubscriptionPlan) => {
            if (plan.plan_code === 'contact') {
                // Redirect to contact URL (you can set this)
                window.open('/contact', '_blank');
                return;
            }
            
            onSelectPlan(plan.plan_code, 'monthly');
        };

        const formatPrice = (plan: SubscriptionPlan) => {
            if (plan.plan_code === 'contact') {
                return 'Custom';
            }
            
            if (plan.price_monthly === 0) {
                return 'Free';
            }
            
            const monthlyPrice = plan.price_monthly / 100; // Convert from paise
            const yearlyPrice = plan.price_yearly ? plan.price_yearly / 100 : monthlyPrice * 10;
            
            return {
                monthly: `₹${monthlyPrice.toLocaleString('en-IN')}`,
                yearly: `₹${yearlyPrice.toLocaleString('en-IN')}`
            };
        };

        return (
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Choose Your Plan
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Select the perfect plan for your MCP needs. Upgrade or downgrade at any time.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {allPlans.map((plan, index) => {
                        const prices = formatPrice(plan);
                        const icon = planIcons[plan.plan_code as keyof typeof planIcons] || <Zap className="h-5 w-5" />;
                        
                        return (
                            <motion.div
                                key={plan.plan_code}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative",
                                    plan.is_featured || plan.plan_code === 'pro' ? "md:scale-105" : ""
                                )}
                            >
                                {/* Popular badge */}
                                {(plan.is_featured || plan.plan_code === 'pro') && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <Card className={cn(
                                    "relative h-full transition-all duration-200 hover:shadow-lg",
                                    (plan.is_featured || plan.plan_code === 'pro') 
                                        ? "border-blue-500 shadow-lg" 
                                        : "border-gray-200",
                                    isCurrentPlan(plan) ? "ring-2 ring-green-500" : ""
                                )}>
                                    <CardHeader className="text-center pb-4">
                                        {/* Plan Icon */}
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg mx-auto flex items-center justify-center mb-4",
                                            plan.plan_code === 'free' ? "bg-gray-100 text-gray-600" :
                                            plan.plan_code === 'pro' ? "bg-blue-100 text-blue-600" :
                                            "bg-purple-100 text-purple-600"
                                        )}>
                                            {icon}
                                        </div>

                                        {/* Plan Name */}
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {plan.name}
                                        </h3>

                                        {/* Plan Tagline */}
                                        {plan.tagline && (
                                            <p className="text-sm text-gray-600 mb-4">
                                                {plan.tagline}
                                            </p>
                                        )}

                                        {/* Pricing */}
                                        <div className="space-y-2">
                                            {typeof prices === 'string' ? (
                                                <div className="text-3xl font-bold text-gray-900">
                                                    {prices}
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <div className="text-3xl font-bold text-gray-900">
                                                        {prices.monthly}
                                                        <span className="text-lg font-normal text-gray-600">
                                                            /month
                                                        </span>
                                                    </div>
                                                    {prices.yearly && (
                                                        <div className="text-sm text-gray-600">
                                                            {prices.yearly}/year (Save 2 months!)
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        {/* Plan Description */}
                                        <p className="text-gray-600 text-center">
                                            {plan.description}
                                        </p>

                                        {/* Features List */}
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start gap-3">
                                                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Action Button */}
                                        <div className="pt-4">
                                            <Button
                                                variant={getButtonVariant(plan)}
                                                size="lg"
                                                className="w-full"
                                                onClick={() => handlePlanSelect(plan)}
                                                disabled={disabled || loading || isCurrentPlan(plan)}
                                                loading={loading}
                                            >
                                                {getButtonText(plan)}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Additional Info */}
                <div className="text-center space-y-4 pt-8">
                    <p className="text-sm text-gray-600">
                        All plans include secure hosting, regular backups, and community support.
                    </p>
                    <p className="text-sm text-gray-600">
                        Need help choosing? <button className="text-blue-600 hover:text-blue-700 underline">
                            Contact our team
                        </button>
                    </p>
                </div>
            </div>
        );

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to render subscription plans:', errorMessage);
        
        return (
            <div className="text-center py-12">
                <p className="text-red-600">
                    Failed to load subscription plans. Please try again.
                </p>
            </div>
        );
    }
}