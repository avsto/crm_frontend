import React from 'react';

// The provided configuration data
const PLAN_CONFIG = {
  free: {
    name: "Free Trial",
    price: 0,
    currency: "USD",
    billingCycle: "monthly",
    limits: {
      users: 1,
      websites: 0,
      products: 100,
      orders: 100,
      leads: 100,
      campaigns: 0,
      whatsappMessages: 0,
      automation: false,
      advancedReports: false,
      customDomain: false,
    },
  },
  starter: {
    name: "Starter",
    price: 49,
    currency: "USD",
    billingCycle: "monthly",
    limits: {
      users: 3,
      websites: 1,
      products: 1000,
      orders: 1000,
      leads: 500,
      campaigns: 5,
      whatsappMessages: 1000,
      automation: false,
      advancedReports: false,
      customDomain: false,
    },
  },
  growth: {
    name: "Growth",
    price: 99,
    currency: "USD",
    billingCycle: "monthly",
    limits: {
      users: 10,
      websites: 5,
      products: 10000,
      orders: 10000,
      leads: 5000,
      campaigns: 50,
      whatsappMessages: 10000,
      automation: true,
      advancedReports: true,
      customDomain: true,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 299,
    currency: "USD",
    billingCycle: "monthly",
    limits: {
      users: -1,
      websites: -1,
      products: -1,
      orders: -1,
      leads: -1,
      campaigns: -1,
      whatsappMessages: -1,
      automation: true,
      advancedReports: true,
      customDomain: true,
    },
  },
};

// Feature mapping for friendly display names
const FEATURE_LABELS = {
  users: "Users",
  websites: "Websites",
  products: "Products",
  orders: "Orders",
  leads: "Leads",
  campaigns: "Campaigns",
  whatsappMessages: "WhatsApp Msgs",
  automation: "Workflow Automation",
  advancedReports: "Advanced Reports",
  customDomain: "Custom Domain"
};

// Helper SVGs
const CheckIcon = ({ className }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = ({ className }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const InfinityIcon = ({ className }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M8 8a4 4 0 1 0 0 8h8a4 4 0 1 0 0-8H8z" />
  </svg>
);

// Formatter to interpret the limits correctly
const formatFeatureValue = (key, value) => {
  const isBoolean = typeof value === 'boolean';
  
  if (isBoolean) return { isIncluded: value, text: FEATURE_LABELS[key] };
  if (value === -1) return { isIncluded: true, text: `Unlimited ${FEATURE_LABELS[key]}`, isInfinity: true };
  if (value === 0) return { isIncluded: false, text: FEATURE_LABELS[key] };
  
  // Format numbers with commas (e.g., 10,000)
  const formattedNumber = new Intl.NumberFormat('en-US').format(value);
  const text = value === 1 && !key.endsWith('s') 
      ? `${formattedNumber} ${FEATURE_LABELS[key]}` 
      : `${formattedNumber} ${FEATURE_LABELS[key]}`;
      
  return { isIncluded: true, text, isInfinity: false };
};

export default function Subscription() {
  const plans = Object.values(PLAN_CONFIG);
  const featureKeys = Object.keys(PLAN_CONFIG.free.limits);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-[#00C853] selection:text-white pb-24">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-[#e5f9ed]/50 to-transparent pointer-events-none"></div>

      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500">
            Choose the perfect plan for your business needs. No hidden fees, upgrade or downgrade at any time.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const isGrowth = plan.name.toLowerCase() === 'growth';
            const isEnterprise = plan.name.toLowerCase() === 'enterprise';
            
            return (
              <div 
                key={plan.name} 
                className={`rounded-3xl p-8 flex flex-col relative transition-all duration-300
                  ${isGrowth ? 'bg-white border-2 border-[#00C853] shadow-xl lg:-mt-4 lg:mb-4 z-10 hover:-translate-y-1' : 
                    isEnterprise ? 'bg-gradient-to-b from-[#0f172a] to-[#1e293b] border border-gray-800 shadow-xl text-white hover:shadow-2xl' : 
                    'bg-white border border-gray-200 shadow-sm hover:shadow-xl'
                  }
                `}
              >
                {/* Most Popular Ribbon */}
                {isGrowth && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-[#00C853] text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`mb-6 ${isGrowth ? 'mt-2' : ''}`}>
                  <h3 className={`text-xl font-bold mb-2 ${isEnterprise ? 'text-white' : 'text-[#0f172a]'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mb-2">
                    <span className={`text-4xl font-extrabold ${isEnterprise ? 'text-white' : 'text-[#0f172a]'}`}>
                      ${plan.price}
                    </span>
                    <span className={`ml-1 font-medium ${isEnterprise ? 'text-gray-400' : 'text-gray-500'}`}>
                      /{plan.billingCycle === 'monthly' ? 'mo' : plan.billingCycle}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className={`w-full font-semibold py-3 rounded-full transition-colors mb-8 shadow-sm
                  ${isGrowth ? 'bg-[#00C853] text-white hover:bg-[#00b049] shadow-[0_4px_14px_0_rgba(0,200,83,0.39)]' : 
                    isEnterprise ? 'bg-white text-[#0f172a] hover:bg-gray-100' : 
                    plan.price === 0 ? 'bg-white border-2 border-gray-200 text-[#0f172a] hover:border-[#00C853] hover:text-[#00C853]' :
                    'bg-[#0f172a] text-white hover:bg-gray-800'}
                `}>
                  {plan.price === 0 ? 'Start Free Trial' : `Choose ${plan.name}`}
                </button>

                {/* Features List */}
                <div className="space-y-4 flex-1">
                  <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isEnterprise ? 'text-gray-400' : 'text-gray-900'}`}>
                    Plan Limits & Features
                  </p>
                  
                  {featureKeys.map((key) => {
                    const feature = formatFeatureValue(key, plan.limits[key]);
                    
                    return (
                      <div key={key} className={`flex items-start ${!feature.isIncluded ? 'opacity-50' : ''}`}>
                        {feature.isIncluded ? (
                          feature.isInfinity ? (
                             <InfinityIcon className={`mr-3 mt-0.5 flex-shrink-0 ${isEnterprise ? 'text-[#00C853]' : 'text-[#00C853]'}`} />
                          ) : (
                             <CheckIcon className={`mr-3 mt-0.5 flex-shrink-0 ${isEnterprise ? 'text-[#00C853]' : 'text-[#00C853]'}`} />
                          )
                        ) : (
                          <CrossIcon className={`mr-3 mt-0.5 flex-shrink-0 ${isEnterprise ? 'text-gray-600' : 'text-gray-400'}`} />
                        )}
                        
                        <span className={`text-sm ${
                            !feature.isIncluded ? 'line-through' :
                            isEnterprise ? 'text-gray-300' : 'text-gray-600'
                          } ${feature.isIncluded && typeof plan.limits[key] === 'boolean' ? 'font-semibold' : ''}`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-[#e5f9ed] text-[#00903c] px-5 py-2.5 rounded-full text-sm font-medium border border-[#ccefdc]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>14-day money-back guarantee. No questions asked.</span>
          </div>
        </div>
      </div>
    </div>
  );
}