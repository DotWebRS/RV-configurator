export type LeadBuildConfiguration = {
    model: string;
    floorPlan: string | null;
    basePrice: number;
    selectedUpgradesTotal: number;
    totalPrice: number;
    selectedOptions: Record<string, Array<{
        id: string;
        name: string;
        price: number;
    }>>;
};

export type ZohoLeadSubmission = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    state: string;
    serviceConsent: boolean;
    marketingConsent: boolean;
    buildConfiguration: LeadBuildConfiguration;
};

export type LeadSubmissionResponse = {
    ok: boolean;
    dryRun?: boolean;
    message: string;
    leadId?: string;
};
