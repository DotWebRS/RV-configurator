export type Vector3Coordinates = [number, number, number];

export type RoomCamera = {
    cameraPosition: Vector3Coordinates;
    target: Vector3Coordinates;
};

export type InteriorRoomId =
    | "living"
    | "kitchen"
    | "bedroom"
    | "bathroom"
    | "main-bath"
    | "half-bath"
    | "rear-kitchen"
    | "master-bedroom"
    | "master-bath"
    | "bedroom-2"
    | "bathroom-2"
    | "garage"
    | "garage-half-bath"
    | "bonus-room";

export type FloorPlanRooms = Partial<Record<InteriorRoomId, RoomCamera>>;

export type InteriorRoomOption = {
    label: string;
    image: string;
};

export const interiorRoomOptions: Record<InteriorRoomId, InteriorRoomOption> = {
    living: { label: "Living area", image: "/images/interior option view mode/living.jpg" },
    kitchen: { label: "Kitchen", image: "/images/interior option view mode/kitchen.jpg" },
    bedroom: { label: "Bedroom", image: "/images/interior option view mode/bedroom.jpg" },
    bathroom: { label: "Bathroom", image: "/images/interior option view mode/bathroom.jpg" },
    "main-bath": { label: "Main Bath", image: "/images/interior option view mode/main-bath.jpg" },
    "half-bath": { label: "Half Bath", image: "/images/interior option view mode/half-bath.jpg" },
    "rear-kitchen": { label: "Rear Kitchen", image: "/images/interior option view mode/kitchen.jpg" },
    "master-bedroom": { label: "Master Bedroom", image: "/images/interior option view mode/bedroom.jpg" },
    "master-bath": { label: "Master Bath", image: "/images/interior option view mode/main-bath.jpg" },
    "bedroom-2": { label: "Bedroom 2", image: "/images/interior option view mode/bedroom.jpg" },
    "bathroom-2": { label: "Bathroom 2", image: "/images/interior option view mode/bathroom.jpg" },
    garage: { label: "Garage", image: "/images/interior option view mode/garage.jpg" },
    "garage-half-bath": { label: "Garage Half Bath", image: "/images/interior option view mode/half-bath.jpg" },
    "bonus-room": { label: "Bonus Room", image: "/images/interior option view mode/bonus-room.webp" },
};

// Privremene vrednosti samo za novododate sobe. Zameni ih finalnim koordinatama po floorplan-u.
const placeholderRoomCamera = (): RoomCamera => ({
    cameraPosition: [0, 2.5, 0],
    target: [0, 2.5, 1],
});

export type FloorPlan = {
    id: string;
    name: string;
    basePrice: number;
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
        living: { cameraPosition: [-0.77, 2.51, -2.58], target: [-0.32, 2.48, -2.59] },
        kitchen: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        bedroom: { cameraPosition: [-0.85, 3.37, 4.26], target: [-0.09, 3.13, 4.26] },
        bathroom: { cameraPosition: [-0.12, 3.30, 2.63], target: [-0.02, 3.26, 2.51] },
    },
    "elite-39fb": {
        living: { cameraPosition: [-0.39, 2.63, -3.74], target: [-0.35, 2.5, -4.17] },
        kitchen: { cameraPosition: [0.65, 2.66, -2.35], target: [0.71, 2.56, -2.00] },
        bedroom: { cameraPosition: [-0.91, 3.17, 2.68], target: [-0.13, 3.01, 2.71] },
        "main-bath": { cameraPosition: [0.44, 2.89, 5.08], target: [0.03, 2.89, 5.07] },
        "half-bath": { cameraPosition: [0.01, 2.47, 0.94], target: [0.35, 2.36, 0.85] },
    },
    "elite-42rl": {
        living: { cameraPosition: [-0.39, 2.63, -3.74], target: [-0.35, 2.5, -4.17] },
        kitchen: { cameraPosition: [0.65, 2.66, -2.35], target: [0.71, 2.56, -2.00] },
        bedroom: { cameraPosition: [0.03, 2.98, 4.67], target: [0.03, 2.89, 5.07] },
        bathroom: { cameraPosition: [0.2, 3.01, 2.24], target: [0.37, 2.97, 2.11] },
    },
    "elite-46tb": {
        living: { cameraPosition: [-0.45, 2.54, -1.93], target: [-0.08, 2.52, -1.98] },
        kitchen: { cameraPosition: [0.38, 2.68, -0.47], target: [0.63, 2.62, -0.2] },
        "master-bedroom": { cameraPosition: [-0.91, 3.17, 2.68], target: [-0.13, 3.01, 2.71] },
        "master-bath": { cameraPosition: [0.44, 2.89, 5.08], target: [0.03, 2.89, 5.07] },
        "bedroom-2": { cameraPosition: [-0.23, 2.46, -6.84], target: [0.47, 2.21, -6.5] },
        "bathroom-2": { cameraPosition: [-0.07, 2.95, -3.85], target: [0.13, 2.77, -4.11] },
    },
    "elite-46rkb": {
        "rear-kitchen": { cameraPosition: [0.29, 3.01, -5.03], target: [0.51, 2.93, -5.41] },
        living: { cameraPosition: [-0.05, 2.49, -2.32], target: [0, 2.49, -1.87] },
        bedroom: { cameraPosition: [-0.91, 3.17, 2.68], target: [-0.13, 3.01, 2.71] },
        "main-bath": { cameraPosition: [0.44, 2.89, 5.08], target: [0.03, 2.89, 5.07] },
        "half-bath": { cameraPosition: [-0.3, 2.51, 0.67], target: [0.12, 2.38, 0.57] },
    },
    "gold-35grs": {
        living: { cameraPosition: [-0.8, 2.51, -3.71], target: [-0.35, 2.47, -3.72] },
        kitchen: { cameraPosition: [0.3, 2.56, -2.25], target: [0.58, 2.49, -2.02] },
        bedroom: { cameraPosition: [-0.88, 3.28, 3.06], target: [-0.1, 3.1, 3.06] },
        bathroom: { cameraPosition: [-0.23, 3.23, 1.83], target: [-0.01, 3.16, 1.36] },
    },
    "gold-38gfb": {
        living: { cameraPosition: [-0.82, 2.56, -5.07], target: [-0.37, 2.55, -5.12] },
        kitchen: { cameraPosition: [0.14, 2.73, -3.71], target: [0.5, 2.67, -3.65] },
        bedroom: { cameraPosition: [-0.86, 3.34, 1.22], target: [-0.1, 3.1, 1.25] },
        "main-bath": { cameraPosition: [-0.31, 3.14, 3.93], target: [0.21, 3.09, 3.98] },
        "half-bath": { cameraPosition: [-0.02, 2.47, -0.23], target: [0.31, 2.4, -0.38] },
    },
    "toy-hauler-46fb": {
        garage: { cameraPosition: [0.45, 2.2, -7.01], target: [0.04, 2.12, -7.19] },
        living: { cameraPosition: [-0.77, 2.51, -2.58], target: [-0.32, 2.48, -2.59] },
        kitchen: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        bedroom: { cameraPosition: [-0.83, 3.43, 2.47], target: [-0.06, 3.22, 2.49] },
        "main-bath": { cameraPosition: [0.55, 3.22, 4.74], target: [0.02, 3.14, 4.87] },
        "garage-half-bath": { cameraPosition: [0.53, 2.32, -5.75], target: [0.71, 2.26, -5.34] },
    },
    "toy-hauler-47fb": {
        garage: { cameraPosition: [0.57, 2.21, -6.18], target: [0.21, 2.15, -6.45] },
        living: { cameraPosition: [-0.77, 2.51, -2.58], target: [-0.32, 2.48, -2.59] },
        kitchen: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        bedroom: { cameraPosition: [-0.51, 3.05, 4.18], target: [0.04, 2.99, 4.19] },
        "main-bath": { cameraPosition: [-0.13, 3.05, 1.73], target: [0.05, 2.95, 2.11] },
        "garage-half-bath": { cameraPosition: [0.17, 2.26, -4.61], target: [0.57, 2.16, -4.79] },
    },
    "toy-hauler-48fb": {
        garage: { cameraPosition: [0.48, 2.5, -5.38], target: [0.15, 2.51, -5.68] },
        living: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        kitchen: { cameraPosition: [-0.77, 2.51, -2.58], target: [-0.32, 2.48, -2.59] },
        bedroom: { cameraPosition: [-1.1, 3.43, 3.99], target: [-0.32, 3.26, 3.99] },
        "main-bath": { cameraPosition: [-0.29, 3.05, 1.6], target: [-0.05, 2.97, 1.97] },
        "garage-half-bath": { cameraPosition: [0.06, 2.33, -4.16], target: [0.5, 2.26, -4.09] },
    },
    "regent-48flb": {
        living: { cameraPosition: [-1.09, 3.31, 4.82], target: [-0.41, 3.06, 5.16] },
        kitchen: { cameraPosition: [0.63, 2.70, -0.85], target: [0.5, 2.63, -0.51] },
        bedroom: { cameraPosition: [-0.77, 2.86, -3.84], target: [-0.33, 2.79, -3.84] },
        "main-bath": { cameraPosition: [0.44, 2.88, -5.7], target: [-0.2, 2.67, -5.83] },
        "half-bath": { cameraPosition: [-0.97, 2.76, -2.11], target: [-0.92, 2.54, -1.83] },
        "bonus-room": { cameraPosition: [-0.48, 3.08, 7.05], target: [0, 2.98, 6.94] },
    },
    "regent-49rh": {
        garage: { cameraPosition: [-1.02, 2.16, -5.18], target: [-0.47, 2.16, -5.72] },
        living: { cameraPosition: [-0.04, 2.32, 0.2], target: [-0.01, 2.32, 0.41] },
        kitchen: { cameraPosition: [0.25, 2.73, -0.25], target: [0.5, 2.63, -0.51] },
        bedroom: { cameraPosition: [-1.09, 3.31, 4.82], target: [-0.41, 3.06, 5.16] },
        "main-bath": { cameraPosition: [-0.36, 2.63, 2.96], target: [-0.2, 2.62, 3.28] },
        "garage-half-bath": { cameraPosition: [0.5, 2.33, -2.72], target: [0.63, 2.26, -2.68] },
    },
};

type FloorPlanSpecifications = Pick<
    FloorPlan,
    "basePrice" | "length" | "width" | "height" | "gvwr" | "fresh" | "grey" | "black"
>;

const floorPlanSpecifications: Record<string, FloorPlanSpecifications> = {
    "elegante-33efs": { basePrice: 174100, length: "33'11\"", width: "8'5\"", height: "13'1\"", gvwr: "18,500", fresh: "75 gal", grey: "80 gal", black: "40 gal" },
    "gold-35grs": { basePrice: 188358, length: "36'9\"", width: "8'5\"", height: "13'3\"", gvwr: "21,000", fresh: "100 gal", grey: "80 gal", black: "40 gal" },
    "gold-38gfb": { basePrice: 194479, length: "39'9\"", width: "8'5\"", height: "13'3\"", gvwr: "21,000", fresh: "100 gal", grey: "80 gal", black: "80 gal" },
    "elite-39fb": { basePrice: 226979, length: "40'10\"", width: "8'5\"", height: "13'3\"", gvwr: "24,000", fresh: "100 gal", grey: "80 gal", black: "80 gal" },
    "elite-42rl": { basePrice: 234780, length: "43'10\"", width: "8'5\"", height: "13'3\"", gvwr: "24,000", fresh: "100 gal", grey: "80 gal", black: "40 gal" },
    "elite-46rkb": { basePrice: 279980, length: "48'", width: "8'5\"", height: "13'3\"", gvwr: "27,000", fresh: "100 gal", grey: "80 gal", black: "80 gal" },
    "elite-46tb": { basePrice: 282980, length: "48'", width: "8'5\"", height: "13'3\"", gvwr: "27,000", fresh: "100 gal", grey: "80 gal", black: "80 gal" },
    "toy-hauler-46fb": { basePrice: 237390, length: "48'2\"", width: "8'5\"", height: "13'6\"", gvwr: "27,000", fresh: "100 gal", grey: "80 gal", black: "40 gal" },
    "toy-hauler-47fb": { basePrice: 235889, length: "48'2\"", width: "8'5\"", height: "13'6\"", gvwr: "27,000", fresh: "100 gal", grey: "80 gal", black: "40 gal" },
    "toy-hauler-48fb": { basePrice: 235238, length: "48'2\"", width: "8'5\"", height: "13'6\"", gvwr: "27,000", fresh: "100 gal", grey: "80 gal", black: "40 gal" },
    "regent-48flb": { basePrice: 309980, length: "48'", width: "8'5\"", height: "13'3\"", gvwr: "29,999", fresh: "100 gal", grey: "80 gal", black: "80 gal" },
    "regent-49rh": { basePrice: 277895, length: "48'", width: "8'5\"", height: "13'3\"", gvwr: "28,000", fresh: "100 gal", grey: "80 gal", black: "80 gal" },
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
}: FloorPlanInput): FloorPlan => ({
    id,
    name,
    modelPath: modelPath.startsWith("/") ? modelPath : `/${modelPath}`,
    rooms,
    image,
    ...floorPlanSpecifications[id],
});

export const modelConfigurations: ModelConfiguration[] = [
    {
        id: "elegante",
        name: "Luxe Elegante",
        basePrice: 174100,
        floorPlans: [
            createFloorPlan({
                id: "elegante-33efs",
                name: "33EFS",
                modelPath: "threejs-assets/Elegante/models/elegante test.glb",
                image: "/images/floorplans/Elegante 33EFS.png",
                rooms: floorPlanRoomCoordinates["elegante-33efs"],
            }),
        ],
    },
    {
        id: "elite",
        name: "Luxe Elite",
        basePrice: 226979,
        floorPlans: [
            createFloorPlan({ id: "elite-39fb", name: "39FB", modelPath: "threejs-assets/Elite/models/39FB/Luxe_elite_39FB.glb", image: "/images/floorplans/Elite 39FB.jpg", rooms: floorPlanRoomCoordinates["elite-39fb"] }),
            createFloorPlan({ id: "elite-42rl", name: "42RL", modelPath: "threejs-assets/Elite/models/42RL/Luxe_elite_LF_42RL.glb", image: "/images/floorplans/Elite 42RL.jpg", rooms: floorPlanRoomCoordinates["elite-42rl"] }),
            createFloorPlan({ id: "elite-46tb", name: "46TB", modelPath: "threejs-assets/Elite/models/46TB/Luxe_elite_LF_46TB.glb", image: "/images/floorplans/Elite 46TB.png", rooms: floorPlanRoomCoordinates["elite-46tb"] }),
            createFloorPlan({ id: "elite-46rkb", name: "46RKB", modelPath: "threejs-assets/Elite/models/46RKB/Luxe_elite_46RKB.glb", image: "/images/floorplans/Elite 46RKB.webp", rooms: floorPlanRoomCoordinates["elite-46rkb"] }),
        ],
    },
    {
        id: "gold",
        name: "Luxe Gold",
        basePrice: 188358,
        floorPlans: [
            createFloorPlan({ id: "gold-35grs", name: "35GRS", modelPath: "threejs-assets/Gold/models/35GRS/Luxe_Gold_35GRS.glb", image: "/images/floorplans/Gold 35GRS.png", rooms: floorPlanRoomCoordinates["gold-35grs"] }),
            createFloorPlan({ id: "gold-38gfb", name: "38GFB", modelPath: "threejs-assets/Gold/models/38GFB/Luxe_Gold_38GFB.glb", image: "/images/floorplans/Gold 38GFB.jpg", rooms: floorPlanRoomCoordinates["gold-38gfb"] }),
        ],
    },
    {
        id: "toy-hauler",
        name: "Luxe Toy Hauler",
        basePrice: 237390,
        floorPlans: [
            createFloorPlan({ id: "toy-hauler-46fb", name: "46FB", modelPath: "threejs-assets/Toy Hauler/models/46FB/luxeTH46fb.glb", image: "/images/floorplans/Toy hauler 46FB.png", rooms: floorPlanRoomCoordinates["toy-hauler-46fb"] }),
            createFloorPlan({ id: "toy-hauler-47fb", name: "47FB", modelPath: "threejs-assets/Toy Hauler/models/47FB/luxeTH47fb.glb", image: "/images/floorplans/Toy hauler 47FB.png", rooms: floorPlanRoomCoordinates["toy-hauler-47fb"] }),
            createFloorPlan({ id: "toy-hauler-48fb", name: "48FB", modelPath: "threejs-assets/Toy Hauler/models/48FB/luxeTH48fb.glb", image: "/images/floorplans/Toy hauler 48FB.jpg", rooms: floorPlanRoomCoordinates["toy-hauler-48fb"] }),
        ],
    },
    {
        id: "regent",
        name: "Luxe Regent",
        basePrice: 309980,
        floorPlans: [
            createFloorPlan({ id: "regent-48flb", name: "48FLB", modelPath: "threejs-assets/Regent/models/48FLB/Regent Hauler Flyer_48FLB_(10707)_V7-optimized-2k.glb", image: "/images/floorplans/Regent 48FLB.jpg", rooms: floorPlanRoomCoordinates["regent-48flb"] }),
            createFloorPlan({ id: "regent-49rh", name: "49RH", modelPath: "threejs-assets/Regent/models/49RH/Regent Hauler Flyer_49RH_F10-optimized-2k-rotated.glb", image: "/images/floorplans/Regent 49RH.png", rooms: floorPlanRoomCoordinates["regent-49rh"] }),
        ],
    },
];

export const models = modelConfigurations.map(({ name }) => name);

export const getModelConfiguration = (modelId: string) =>
    modelConfigurations.find((model) => model.id === modelId) ?? modelConfigurations[0];

export const getFloorPlan = (modelId: string, floorPlanId: string) =>
    getModelConfiguration(modelId).floorPlans.find((plan) => plan.id === floorPlanId);

export const cameraViews = ["Front View", "Back View", "Left View", "Right View"];

