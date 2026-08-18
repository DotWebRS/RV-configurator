export type Vector3Coordinates = [number, number, number];

export type RoomCamera = {
    cameraPosition: Vector3Coordinates;
    target: Vector3Coordinates;
};

export type FloorPlanRooms = {
    kitchen: RoomCamera;
    livingroom: RoomCamera;
    bedroom: RoomCamera;
    bathroom: RoomCamera;
};

export type FloorPlan = {
    id: string;
    name: string;
    height: string;
    length: string;
    width: string;
    gvwr: string;
    grey: string;
    black: string;
    fresh: string;
    image: string;
    modelPath: string;
    rooms: FloorPlanRooms;
};

export type ModelConfiguration = {
    id: string;
    name: string;
    basePrice: number;
    floorPlans: FloorPlan[];
};

const defaultFloorPlanImage = "/images/floor-plan.jpg";

// OVDE UNOSIŠ FINALNE KOORDINATE.
// Svaki floor plan ima potpuno nezavisne cameraPosition i target vrednosti.
export const floorPlanRoomCoordinates: Record<string, FloorPlanRooms> = {
    "elegante-33efs": {
        kitchen: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        livingroom: { cameraPosition: [-0.77, 2.51, -2.58], target: [-0.32, 2.48, -2.59] },
        bedroom: { cameraPosition: [-0.85, 3.37, 4.26], target: [-0.09, 3.13, 4.26] },
        bathroom: { cameraPosition: [-0.12, 3.30, 2.63], target: [-0.02, 3.26, 2.51] },
    },
    "elite-39fb": {
        kitchen: { cameraPosition: [0.65, 2.66, -2.35], target: [0.71, 2.56, -2.00] },
        livingroom: { cameraPosition: [-0.39, 2.63, -3.74], target: [-0.35, 2.5, -4.17] },
        bedroom: { cameraPosition: [-0.91, 3.17, 2.68], target: [-0.13, 3.01, 2.71] },
        bathroom: { cameraPosition: [0.44, 2.89, 5.08], target: [0.03, 2.89, 5.07] },
    },
    "elite-42rl": {
        kitchen: { cameraPosition: [0.65, 2.66, -2.35], target: [0.71, 2.56, -2.00] },
        livingroom: { cameraPosition: [-0.39, 2.63, -3.74], target: [-0.35, 2.5, -4.17] },
        bedroom: { cameraPosition: [0.03, 2.98, 4.67], target: [0.03, 2.89, 5.07] },
        bathroom: { cameraPosition: [0.2, 3.01, 2.24], target: [0.37, 2.97, 2.11] },
    },
    "elite-46tb": {
        kitchen: { cameraPosition: [0.38, 2.68, -0.47], target: [0.63, 2.62, -0.2] },
        livingroom: { cameraPosition: [-0.45, 2.54, -1.93], target: [-0.08, 2.52, -1.98] },
        bedroom: { cameraPosition: [-0.91, 3.17, 2.68], target: [-0.13, 3.01, 2.71] },
        bathroom: { cameraPosition: [0.44, 2.89, 5.08], target: [0.03, 2.89, 5.07] },
    },
    "elite-46rkb": {
        kitchen: { cameraPosition: [0.29, 3.01, -5.03], target: [0.51, 2.93, -5.41] },
        livingroom: { cameraPosition: [-0.05, 2.49, -2.32], target: [0, 2.49, -1.87] },
        bedroom: { cameraPosition: [-0.91, 3.17, 2.68], target: [-0.13, 3.01, 2.71] },
        bathroom: { cameraPosition: [0.44, 2.89, 5.08], target: [0.03, 2.89, 5.07] },
    },
    "gold-35grs": {
        kitchen: { cameraPosition: [0.3, 2.56, -2.25], target: [0.58, 2.49, -2.02] },
        livingroom: { cameraPosition: [-0.8, 2.51, -3.71], target: [-0.35, 2.47, -3.72] },
        bedroom: { cameraPosition: [-0.88, 3.28, 3.06], target: [-0.1, 3.1, 3.06] },
        bathroom: { cameraPosition: [-0.23, 3.23, 1.83], target: [-0.01, 3.16, 1.36] },
    },
    "gold-38gfb": {
        kitchen: { cameraPosition: [0.14, 2.73, -3.71], target: [0.5, 2.67, -3.65] },
        livingroom: { cameraPosition: [-0.82, 2.56, -5.07], target: [-0.37, 2.55, -5.12] },
        bedroom: { cameraPosition: [-0.86, 3.34, 1.22], target: [-0.1, 3.1, 1.25] },
        bathroom: { cameraPosition: [-0.31, 3.14, 3.93], target: [0.21, 3.09, 3.98] },
    },
    "toy-hauler-46fb": {
        kitchen: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        livingroom: { cameraPosition: [-0.77, 2.51, -2.58], target: [-0.32, 2.48, -2.59] },
        bedroom: { cameraPosition: [-0.83, 3.43, 2.47], target: [-0.06, 3.22, 2.49] },
        bathroom: { cameraPosition: [0.55, 3.22, 4.74], target: [0.02, 3.14, 4.87] },
    },
    "toy-hauler-47fb": {
        kitchen: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        livingroom: { cameraPosition: [-0.77, 2.51, -2.58], target: [-0.32, 2.48, -2.59] },
        bedroom: { cameraPosition: [-0.51, 3.05, 4.18], target: [0.04, 2.99, 4.19] },
        bathroom: { cameraPosition: [-0.13, 3.05, 1.73], target: [0.05, 2.95, 2.11] },
    },
    "toy-hauler-48fb": {
        kitchen: { cameraPosition: [-0.77, 2.51, -2.58], target: [-0.32, 2.48, -2.59] },
        livingroom: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        bedroom: { cameraPosition: [-1.1, 3.43, 3.99], target: [-0.32, 3.26, 3.99] },
        bathroom: { cameraPosition: [-0.29, 3.05, 1.6], target: [-0.05, 2.97, 1.97] },
    },
    "regent-48flb": {
        kitchen: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        livingroom: { cameraPosition: [-1.09, 3.31, 4.82], target: [-0.41, 3.06, 5.16] },
        bedroom: { cameraPosition: [-0.77, 2.86, -3.84], target: [-0.33, 2.79, -3.84] },
        bathroom: { cameraPosition: [0.44, 2.88, -5.7], target: [-0.2, 2.67, -5.83] },
    },
    "regent-49rh": {
        kitchen: { cameraPosition: [0.25, 2.73, -0.25], target: [0.5, 2.63, -0.51] },
        livingroom: { cameraPosition: [-0.04, 2.32, 0.2], target: [-0.01, 2.32, 0.41] },
        bedroom: { cameraPosition: [-1.09, 3.31, 4.82], target: [-0.41, 3.06, 5.16] },
        bathroom: { cameraPosition: [-0.36, 2.63, 2.96], target: [-0.2, 2.62, 3.28] },
    },
};

type FloorPlanInput =
    Pick<FloorPlan, "id" | "name" | "modelPath" | "rooms">
    & Partial<Omit<FloorPlan, "id" | "name" | "modelPath" | "rooms">>;

const createFloorPlan = ({
    id,
    name,
    modelPath,
    rooms,
    image = defaultFloorPlanImage,
    height = "13'5\"",
    length = "33'",
    width = "8'6\"",
    gvwr = "16,000",
    grey = "40 gal",
    black = "40 gal",
    fresh = "75 gal",
}: FloorPlanInput): FloorPlan => ({
    id,
    name,
    modelPath: modelPath.startsWith("/") ? modelPath : `/${modelPath}`,
    rooms,
    image,
    height,
    length,
    width,
    gvwr,
    grey,
    black,
    fresh,
});

export const modelConfigurations: ModelConfiguration[] = [
    {
        id: "elegante",
        name: "Luxe Elegante",
        basePrice: 176745,
        floorPlans: [
            createFloorPlan({
                id: "elegante-33efs",
                name: "33EFS",
                modelPath: "threejs-assets/Elegante/models/elegante test.glb",
                rooms: floorPlanRoomCoordinates["elegante-33efs"],
            }),
        ],
    },
    {
        id: "elite",
        name: "Luxe Elite",
        basePrice: 176745, // TODO: zameniti tačnom Elite cenom.
        floorPlans: [
            createFloorPlan({ id: "elite-39fb", name: "39FB", modelPath: "threejs-assets/Elite/models/39FB/Luxe_elite_39FB.glb", image: "/images/floorplans/Elite 39FB.jpg", rooms: floorPlanRoomCoordinates["elite-39fb"] }),
            createFloorPlan({ id: "elite-42rl", name: "42RL", modelPath: "threejs-assets/Elite/models/42RL/Luxe_elite_LF_42RL.glb", image: "/images/floorplans/Elite 42RL.jpg", rooms: floorPlanRoomCoordinates["elite-42rl"] }),
            createFloorPlan({ id: "elite-46tb", name: "46TB", modelPath: "threejs-assets/Elite/models/46TB/Luxe_elite_LF_46TB.glb", rooms: floorPlanRoomCoordinates["elite-46tb"] }),
            createFloorPlan({ id: "elite-46rkb", name: "46RKB", modelPath: "threejs-assets/Elite/models/46RKB/Luxe_elite_46RKB.glb", image: "/images/floorplans/Elite 46RKB.webp", rooms: floorPlanRoomCoordinates["elite-46rkb"] }),
        ],
    },
    {
        id: "gold",
        name: "Luxe Gold",
        basePrice: 176745, // TODO: zameniti tačnom Gold cenom.
        floorPlans: [
            createFloorPlan({ id: "gold-35grs", name: "35GRS", modelPath: "threejs-assets/Gold/models/35GRS/Luxe_Gold_35GRS.glb", rooms: floorPlanRoomCoordinates["gold-35grs"] }),
            createFloorPlan({ id: "gold-38gfb", name: "38GFB", modelPath: "threejs-assets/Gold/models/38GFB/Luxe_Gold_38GFB.glb", image: "/images/floorplans/Gold 38GFB.jpg", rooms: floorPlanRoomCoordinates["gold-38gfb"] }),
        ],
    },
    {
        id: "toy-hauler",
        name: "Luxe Toy Hauler",
        basePrice: 176745, // TODO: zameniti tačnom Toy Hauler cenom.
        floorPlans: [
            createFloorPlan({ id: "toy-hauler-46fb", name: "46FB", modelPath: "threejs-assets/Toy Hauler/models/46FB/luxeTH46fb.glb", rooms: floorPlanRoomCoordinates["toy-hauler-46fb"] }),
            createFloorPlan({ id: "toy-hauler-47fb", name: "47FB", modelPath: "threejs-assets/Toy Hauler/models/47FB/luxeTH47fb.glb", rooms: floorPlanRoomCoordinates["toy-hauler-47fb"] }),
            createFloorPlan({ id: "toy-hauler-48fb", name: "48FB", modelPath: "threejs-assets/Toy Hauler/models/48FB/luxeTH48fb.glb", image: "/images/floorplans/Toy hauler 48FB.jpg", rooms: floorPlanRoomCoordinates["toy-hauler-48fb"] }),
        ],
    },
    {
        id: "regent",
        name: "Luxe Regent",
        basePrice: 176745, // TODO: zameniti tačnom Regent cenom.
        floorPlans: [
            createFloorPlan({ id: "regent-48flb", name: "48FLB", modelPath: "threejs-assets/Regent/models/48FLB/Regent Hauler Flyer_48FLB_(10707)_V7-optimized-2k.glb", image: "/images/floorplans/Regent 48FLB.jpg", rooms: floorPlanRoomCoordinates["regent-48flb"] }),
            createFloorPlan({ id: "regent-49rh", name: "49RH", modelPath: "threejs-assets/Regent/models/49RH/Regent Hauler Flyer_49RH_F10-optimized-2k-rotated.glb", rooms: floorPlanRoomCoordinates["regent-49rh"] }),
        ],
    },
];

export const models = modelConfigurations.map(({ name }) => name);

export const getModelConfiguration = (modelId: string) =>
    modelConfigurations.find((model) => model.id === modelId) ?? modelConfigurations[0];

export const getFloorPlan = (modelId: string, floorPlanId: string) =>
    getModelConfiguration(modelId).floorPlans.find((plan) => plan.id === floorPlanId);

export const cameraViews = ["Front View", "Back View", "Left View", "Right View"];

