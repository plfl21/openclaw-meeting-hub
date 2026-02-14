import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import PricingCard from '../components/PricingCard';
import { PLANS } from '../lib/stripe';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-darkest">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-accent-primary/10">
        <div className="flex items-center gap-2">
          <Zap className="w-7 h-7 text-accent-primary" />
          <span className="text-xl font-bold text-accent-primary">OpenClaw</span>
        </div>
        <Link to="/" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </nav>

      <section className="px-6 lg:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-accent-primary mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            From solo developers to enterprise teams. Start free, upgrade when you need more power.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map(plan => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-text-muted text-sm">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </section>
    </div>
  );
}
