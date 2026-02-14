import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PricingPlan } from '../lib/stripe';

interface PricingCardProps {
  plan: PricingPlan;
}

export default function PricingCard({ plan }: PricingCardProps) {
  const navigate = useNavigate();

  return (
    <div className={`relative bg-card/95 border rounded-xl backdrop-blur-lg p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,191,0,0.15)] ${
      plan.popular
        ? 'border-accent-primary/40 shadow-[0_0_20px_rgba(255,191,0,0.1)]'
        : 'border-accent-primary/10'
    }`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-primary text-darkest text-xs font-bold rounded-full">
          MOST POPULAR
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-accent-primary mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-text-primary">${plan.price}</span>
          <span className="text-text-secondary">{plan.period}</span>
        </div>
        <p className="text-text-secondary text-sm mt-3">{plan.description}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-text-primary">
            <Check className="w-4 h-4 text-accent-secondary mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate('/register')}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
          plan.popular
            ? 'btn-primary'
            : 'btn-secondary'
        }`}
      >
        {plan.cta}
      </button>
    </div>
  );
}
