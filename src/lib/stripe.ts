export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limits: {
    meetingsPerMonth: number | null;
    agents: number;
    analytics: 'basic' | 'full';
    neuronFeed: boolean;
    apiAccess: boolean;
    customAgents: boolean;
    whiteLabel: boolean;
  };
  cta: string;
  popular: boolean;
}

export const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    period: '/month',
    description: 'Perfect for individual developers exploring multi-agent systems.',
    features: [
      '5 meetings per month',
      '3 AI agents',
      'Basic analytics dashboard',
      'Meeting audit trail',
      'Email support',
    ],
    limits: {
      meetingsPerMonth: 5,
      agents: 3,
      analytics: 'basic',
      neuronFeed: false,
      apiAccess: false,
      customAgents: false,
      whiteLabel: false,
    },
    cta: 'Start Free',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: '/month',
    description: 'For teams building production multi-agent workflows.',
    features: [
      'Unlimited meetings',
      '10 AI agents',
      'Full analytics & charts',
      'Neuron communication feed',
      'Task board & kanban',
      'Decision tracking',
      'Priority support',
    ],
    limits: {
      meetingsPerMonth: null,
      agents: 10,
      analytics: 'full',
      neuronFeed: true,
      apiAccess: false,
      customAgents: false,
      whiteLabel: false,
    },
    cta: 'Go Pro',
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: 99,
    period: '/month',
    description: 'Enterprise-grade agent governance for scaling teams.',
    features: [
      'Everything in Pro',
      'Unlimited agents',
      'REST API access',
      'Custom agent integration',
      'White-label branding',
      'SSO & team management',
      'Dedicated support',
      'SLA guarantee',
    ],
    limits: {
      meetingsPerMonth: null,
      agents: Infinity,
      analytics: 'full',
      neuronFeed: true,
      apiAccess: true,
      customAgents: true,
      whiteLabel: true,
    },
    cta: 'Go Team',
    popular: false,
  },
];

export function getPlanById(id: string): PricingPlan | undefined {
  return PLANS.find(p => p.id === id);
}
