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

// Privremene koordinate. Zamenićemo ih finalnim vrednostima za svaki GLB model.
const temporaryRooms: FloorPlanRooms = {
    kitchen: { cameraPosition: [-1.6, 2.3, 1.2], target: [1.8, 2.0, 1.1] },
    livingroom: { cameraPosition: [2.0, 2.2, 1.0], target: [-1.4, 1.9, 1.0] },
    bedroom: { cameraPosition: [3.7, 2.1, 0.8], target: [1.0, 1.8, 0.8] },
    bathroom: { cameraPosition: [0.2, 2.15, -0.4], target: [0.2, 1.9, 1.8] },
};

const createRooms = (): FloorPlanRooms => ({
    kitchen: { ...temporaryRooms.kitchen },
    livingroom: { ...temporaryRooms.livingroom },
    bedroom: { ...temporaryRooms.bedroom },
    bathroom: { ...temporaryRooms.bathroom },
});

export const modelConfigurations: ModelConfiguration[] = [
    {
        id: "elegante",
        name: "Luxe Elegante",
        basePrice: 176745,
        floorPlans: [{
            id: "elegante-33efs",
            name: "33EFS",
            height: "13'5\"",
            length: "33'",
            width: "8'6\"",
            gvwr: "16,000",
            grey: "40 gal",
            black: "40 gal",
            fresh: "75 gal",
            image: "/images/floor-plan.jpg",
            modelPath: "threejs-assets/Elegante/models/elegante test.glb",
            rooms: createRooms(),
        }],
    },
    {
        id: "elite",
        name: "Luxe Elite",
        basePrice: 0,
        floorPlans: [], // TODO: dodati Elite kartice i GLB putanje.
    },
    {
        id: "gold",
        name: "Luxe Gold",
        basePrice: 0,
        floorPlans: [], // TODO: dodati Gold kartice i GLB putanje.
    },
    {
        id: "toy-hauler",
        name: "Luxe Toy Hauler",
        basePrice: 0,
        floorPlans: [], // TODO: dodati Toy Hauler kartice i GLB putanje.
    },
    {
        id: "regent",
        name: "Luxe Regent",
        basePrice: 176745, // TODO: zameniti tačnom Regent cenom.
        floorPlans: [
            {
                id: "regent-48flb",
                name: "48FLB",
                height: "13'5\"",
                length: "33'",
                width: "8'6\"",
                gvwr: "16,000",
                grey: "40 gal",
                black: "40 gal",
                fresh: "75 gal",
                image: "/images/floor-plan.jpg",
                modelPath: "threejs-assets/regent/models/48FLB/Regent Hauler Flyer_48FLB_(10707)_V7-optimized-2k.glb",
                rooms: createRooms(),
            },
            {
                id: "regent-49rh",
                name: "49RH",
                height: "13'5\"",
                length: "33'",
                width: "8'6\"",
                gvwr: "16,000",
                grey: "40 gal",
                black: "40 gal",
                fresh: "75 gal",
                image: "/images/floor-plan.jpg",
                modelPath: "threejs-assets/regent/models/49RH/Regent Hauler Flyer_49RH_F10-optimized-2k-rotated.glb",
                rooms: createRooms(),
            },
        ],
    },
];

export const models = modelConfigurations.map(({ name }) => name);

export const getModelConfiguration = (modelId: string) =>
    modelConfigurations.find((model) => model.id === modelId) ?? modelConfigurations[0];

export const getFloorPlan = (modelId: string, floorPlanId: string) =>
    getModelConfiguration(modelId).floorPlans.find((plan) => plan.id === floorPlanId);

export const cameraViews = ["Front View", "Back View", "Left View", "Right View"];
