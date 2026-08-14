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
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "elite-39fb": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "elite-42rl": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "elite-46tb": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "elite-46rkb": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "gold-35grs": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "gold-38gfb": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "toy-hauler-46fb": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "toy-hauler-47fb": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "toy-hauler-48fb": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "regent-48flb": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
    },
    "regent-49rh": {
        kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
        livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
        bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
        bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
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
    id, name, modelPath, rooms, image, height, length, width, gvwr, grey, black, fresh,
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

