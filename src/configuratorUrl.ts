import { modelConfigurations, type FloorPlan, type ModelConfiguration } from "./components/data";

export type ConfiguratorSelection = {
    model: ModelConfiguration;
    floorPlan: FloorPlan;
};

const normalizeSegment = (value: string) =>
    decodeURIComponent(value).trim().toLowerCase();

export const getConfiguratorPath = (model: ModelConfiguration, floorPlan: FloorPlan) =>
    `/${encodeURIComponent(model.id)}/${encodeURIComponent(floorPlan.name.toLowerCase())}`;

export const getSelectionFromPath = (pathname: string): ConfiguratorSelection | null => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    const modelSlug = normalizeSegment(segments.at(-2) ?? "");
    const floorPlanSlug = normalizeSegment(segments.at(-1) ?? "");
    const model = modelConfigurations.find((item) => item.id === modelSlug);
    const floorPlan = model?.floorPlans.find((plan) =>
        plan.name.toLowerCase() === floorPlanSlug || plan.id === floorPlanSlug,
    );

    return model && floorPlan ? { model, floorPlan } : null;
};

export const pushConfiguratorUrl = (model: ModelConfiguration, floorPlan: FloorPlan) => {
    const path = getConfiguratorPath(model, floorPlan);
    if (window.location.pathname !== path) window.history.pushState(null, "", path);
};
