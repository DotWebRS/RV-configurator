import { eleganteUpgradeSections } from "./upgradeDataElegante";
import { eliteUpgradeSections } from "./upgradeDataElite";
import { goldUpgradeSections } from "./upgradeDataGold";
import { regentUpgradeSections } from "./upgradeDataRegent";
import { toyHaulerUpgradeSections } from "./upgradeDataToyHauler";

export type UpgradeOption = {
    id: string;
    name: string;
    price: number;
    image: string;
    restriction: string;
    compatibility: string[];
};

export type UpgradeSection = {
    id: string;
    label: string;
    options: UpgradeOption[];
};

export const upgradeDataByModel: Record<string, UpgradeSection[]> = {
    elegante: eleganteUpgradeSections,
    elite: eliteUpgradeSections,
    gold: goldUpgradeSections,
    regent: regentUpgradeSections,
    "toy-hauler": toyHaulerUpgradeSections,
};

export const getUpgradeGroups = (modelId: string, floorPlanName: string) =>
    Object.fromEntries(
        (upgradeDataByModel[modelId] ?? [])
            .map((section) => [
                section.label,
                section.options.filter((option) => option.compatibility.includes(floorPlanName)),
            ])
            .filter(([, options]) => (options as UpgradeOption[]).length > 0),
    ) as Record<string, UpgradeOption[]>;
