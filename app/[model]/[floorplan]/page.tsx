import ModelPage from "../../../src/components/ModelPage";
import { modelConfigurations } from "../../../src/components/data";

export function generateStaticParams() {
    return modelConfigurations.flatMap((model) =>
        model.floorPlans.map((floorPlan) => ({
            model: model.id,
            floorplan: floorPlan.name.toLowerCase(),
        })),
    );
}

export default function ConfigurationPage() {
    return <ModelPage />;
}
