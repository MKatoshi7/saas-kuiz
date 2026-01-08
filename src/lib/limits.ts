
export const PLAN_LIMITS = {
    free: {
        funnels: 3,
        leads: 50,
        customDomain: false,
        removeBranding: false,
    },
    starter: {
        funnels: 10,
        leads: 1000,
        customDomain: true,
        removeBranding: true,
    },
    pro: {
        funnels: 50,
        leads: 10000,
        customDomain: true,
        removeBranding: true,
    },
    enterprise: {
        funnels: Infinity,
        leads: Infinity,
        customDomain: true,
        removeBranding: true,
    }
};

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string | null) {
    return PLAN_LIMITS[(plan as PlanType) || 'free'];
}
