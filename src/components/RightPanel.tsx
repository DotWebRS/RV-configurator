"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConfiguratorUi, useExperienceRef } from "../three/ExperienceContext";
import "./UpgradeSteps.css";

type Upgrade = { id: string; name: string; price: number; image: string };
type ContactForm = { firstName: string; lastName: string; phone: string; state: string; email: string; serviceConsent: boolean; marketingConsent: boolean };

const floorPlans = [
    { id: 1, name: "48FLB", height: "13'5\"", length: "33'", width: "8'6\"", gvwr: "16,000", grey: "40 gal", black: "40 gal", fresh: "75 gal", modelPath: "threejs-assets/regent/models/48FLB/Regent Hauler Flyer_48FLB_(10707)_V7-optimized-2k.glb" },
    { id: 2, name: "49RH", height: "13'5\"", length: "33'", width: "8'6\"", gvwr: "16,000", grey: "40 gal", black: "40 gal", fresh: "75 gal", modelPath: "threejs-assets/regent/models/49RH/Regent Hauler Flyer_49RH_F10-optimized-2k-rotated.glb" },
];

const upgradeGroups: Record<string, Upgrade[]> = {
    Interior: [
        ["raised-style-cabinet", "Raised Style Cabinet", 1200, "raised-style-cabinet.webp"],
        ["shaker-style-cabinet", "Shaker Style Cabinet", 1200, "shaker-style-cabinet.webp"],
        ["water-filter", "3 Stage Water Filter", 300, "3-stage-water-filter.webp"],
        ["marine-flooring", "Marine Grade Flooring IPO Carpet", 900, "marine-grade-flooring-ipo-carpet.jpg"],
        ["soft-touch-walls", "Soft Touch Walls", 4000, "soft-touch-walls.webp"],
        ["lambright", "Lambright Custom Furniture", 3800, "lambright-custom-furniture.webp"],
        ["televator", "Televator", 950, "televator.webp"],
        ["washer-dryer", "Washer and Dryer Stackable", 2500, "washer-and-dryer-stackable.webp"],
        ["wine-cooler", "Wine Cooler", 950, "wine-cooler.webp"],
        ["silverware", "Silverware Drawer Insert", 150, "silverware-drawer-insert.webp"],
    ].map(([id, name, price, file]) => ({ id, name, price, image: `/images/interior/${file}` })) as Upgrade[],
    Exterior: [
        ["chairs", "2 Folding Chairs", 200, "2-folding-chairs.webp"], ["receiver", "2\" Rear Hitch Receiver", 450, "2-rear-hitch-receiver-300-lbs-max.jpg"],
        ["engineering", "Custom Engineering Fee", 1200, "custom-engineering-fee-mandatory-on-all-special-builds.jpg"], ["awning", "Dinette Patio Awning w/ LED Lighting", 1800, "dinette-patio-awning-w-led-lighting.png"],
        ["gen-y", "Gen-Y Hitch Pin", 650, "gen-y-hitch-pin.webp"], ["generator", "Generator Prep", 950, "generator-prep.jpg"],
        ["keyless", "Keyless Entry Door", 475, "keyless-entry-door-includes-key-fob.webp"], ["mor-ryde", "MORryde Tray Slide", 750, "mor-ryde-tray-slide.webp"],
        ["entertainment", "Outside Entertainment Center", 2200, "outside-entertainment-center-includes-buffet-table.webp"], ["sewer", "Sewer Hose Holder", 125, "sewer-hose-holder-per.webp"],
        ["toppers", "Slide-out Toppers", 1400, "slide-out-toppers-6.jpg"], ["paint", "Slide Room Paint", 950, "slide-room-paint-6.webp"],
        ["stairs", "Step Above Pullout Entry Stair", 650, "step-above-pullout-entry-stair.webp"], ["silks", "Window Silks", 500, "window-silks.webp"],
    ].map(([id, name, price, file]) => ({ id, name, price, image: `/images/exterior/${file}` })) as Upgrade[],
    Bathrooms: [
        ["macerator", "Macerator Toilet", 950, "macerator-toilet-per.webp"], ["bath-fan", "Fantastic Fan w/ Rain Sensor", 425, "fantastic-fan-w-rain-sensor-kitchen.webp"],
    ].map(([id, name, price, file]) => ({ id, name, price, image: `/images/bathrooms/${file}` })) as Upgrade[],
    "Kitchen & Livingroom": [
        ["oven", "24\" Residential Oven IPO Induction", 1600, "24-residential-oven-ipo-induction.webp"], ["dishwasher", "Dishwasher", 1200, "dishwasher.webp"],
        ["kitchen-fan", "Fantastic Fan w/ Rain Sensor", 425, "fantastic-fan-w-rain-sensor-kitchen.webp"], ["countertop", "Flip-up Countertop", 350, "flip-up-countertop.webp"],
        ["buffet", "Solid Surface Countertop on Buffet", 750, "solid-surface-countertop-on-buffet.jpg"], ["sponge", "Tilt-out Sponge Tray", 150, "tiltout-sponge-tray.jpg"],
    ].map(([id, name, price, file]) => ({ id, name, price, image: `/images/kitchen-livingroom/${file}` })) as Upgrade[],
    Decor: [{ id: "chelsea-gray", name: "Chelsea Gray Decor", price: 0, image: "/images/decor/chelsea-gray.webp" }],
    Electronics: [
        ["cameras", "4 Camera System", 1400, "4-camera-system.webp"], ["weather", "Arctic Weather Package", 2800, "arctic-weather-package-twin-30-000-btu-furnaces-2nd-12-volt-heat-pad-on-fresh-tank-insulated-pex-lines.jpg"],
        ["touch-pads", "ASA Electric Touch Pads", 550, "asa-electric-touch-pads.webp"], ["water-heater", "On-demand Water Heater", 900, "on-demand-water-heater.webp"],
        ["solar", "Personalized Solar Package", 3900, "personalized-solar-package-ranges.jpg"], ["surge", "Portable Surge Protector", 350, "portable-surge-protector.webp"],
        ["shades", "Power Night Roller Shades", 1800, "power-night-roller-shades-remote-operated.jpg"], ["queen-bed", "Queen Bed IPO King", 500, "queen-bed-ipo-king-w-large-nightstands.webp"],
        ["see-level", "SeeLevel Monitoring", 475, "see-level-monitoring.webp"], ["weboost", "weBoost Drive X 5G", 850, "we-boost-antenna-drive-x-5g.jpg"],
        ["winegard", "Winegard 360 w/ 5G Gateway", 1100, "winegard-360-w-5g-gateway.jpg"],
    ].map(([id, name, price, file]) => ({ id, name, price, image: `/images/electronics/${file}` })) as Upgrade[],
};

const money = (value: number) => `$${value.toLocaleString("en-US")}`;
const upgradeCategories = [...Object.keys(upgradeGroups), "Paint"];

export default function RightPanel() {
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(1);
    const [group, setGroup] = useState("Interior");
    const [selected, setSelected] = useState<Record<string, Upgrade>>({});
    const [preview, setPreview] = useState<Upgrade | null>(null);
    const [contact, setContact] = useState<ContactForm>({ firstName: "", lastName: "", phone: "", state: "", email: "", serviceConsent: false, marketingConsent: false });
    const tabsRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });
    const experienceRef = useExperienceRef();
    const { isModelLoading, setModelLoading, setActiveCameraView, patternColors } = useConfiguratorUi();
    const upgradesTotal = useMemo(() => Object.values(selected).reduce((sum, item) => sum + item.price, 0), [selected]);
    const basePrice = 176745;
    const buildConfiguration = useMemo(() => ({
        model: "Luxe Toy Hauler",
        floorPlan: floorPlans.find((plan) => plan.id === selectedPlan)?.name ?? null,
        basePrice,
        additionalOptions: Object.values(selected).map(({ id, name, price }) => ({ id, name, price })),
        selectedUpgradesTotal: upgradesTotal,
        estimatedTotal: basePrice + upgradesTotal,
        colors: Object.fromEntries(patternColors.map((pattern, index) => [`color${index + 1}`, pattern.color])),
    }), [patternColors, selected, selectedPlan, upgradesTotal]);

    const updateContact = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => setContact((current) => ({ ...current, [key]: value }));

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setPreview(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const choosePlan = async (plan: (typeof floorPlans)[number]) => {
        if (isModelLoading || selectedPlan === plan.id) return;
        const experience = experienceRef.current;
        if (!experience) return;
        setSelectedPlan(plan.id);
        setActiveCameraView("Right View");
        experience.updateCameraView("right");
        setModelLoading(true);
        try { await experience.changeRV(plan.modelPath); } finally { setModelLoading(false); }
    };

    const toggleUpgrade = (item: Upgrade) => setSelected((current) => {
        const next = { ...current };
        if (next[item.id]) delete next[item.id]; else next[item.id] = item;
        return next;
    });

    return <>
        <aside className={`right-panel step-${step}`}>
            <script id="build-configuration" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildConfiguration).replace(/</g, "\\u003c") }} />
            <h2 className="right-title">Customize Your Luxe Toy Hauler</h2>
            {step < 3 && <p className="right-step"><strong>Step {step}:</strong> {step === 1 ? "select the Floor Plan" : "Select interior and exterior upgrades"}</p>}
            {step < 3 && <div className="right-buttons">
                <button className="step-button" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>Previous</button>
                <button className="step-button" onClick={() => setStep((s) => Math.min(3, s + 1))}>Next</button>
            </div>}
            {step < 3 && <div className="right-divider" />}

            {step === 1 && <div className="floorplan-container">
                {floorPlans.map((plan) => <button key={plan.id} className={`floor-card ${selectedPlan === plan.id ? "active" : ""}`} onClick={() => choosePlan(plan)}>
                    <div className="floor-image"><img src="/images/floor-plan.jpg" alt={`${plan.name} floor plan`} />
                        {selectedPlan === plan.id && <img src="/icons/check-circle.png" className="check-icon" alt="Selected" />}
                        <span className="zoom-button"><img src="/icons/zoom-in.png" alt="Zoom" /></span>
                    </div>
                    <div className="floor-content"><h4>{plan.name}</h4><p>Height: {plan.height} / Length: {plan.length}</p><p>Width: {plan.width} / GVWR: {plan.gvwr}</p><p>Grey Water: {plan.grey}</p><p>Black Water: {plan.black}</p><p>Fresh Water: {plan.fresh}</p></div>
                </button>)}
            </div>}

            {step === 2 && <div className="upgrades-section">
                <div
                    ref={tabsRef}
                    className="upgrade-tabs"
                    role="tablist"
                    aria-label="Upgrade categories"
                    onPointerDown={(event) => {
                        const element = tabsRef.current;
                        if (!element) return;
                        dragRef.current = { active: true, moved: false, startX: event.clientX, scrollLeft: element.scrollLeft };
                    }}
                    onPointerMove={(event) => {
                        const element = tabsRef.current;
                        const drag = dragRef.current;
                        if (!element || !drag.active) return;
                        const distance = event.clientX - drag.startX;
                        if (Math.abs(distance) > 4) drag.moved = true;
                        element.scrollLeft = drag.scrollLeft - distance;
                    }}
                    onPointerUp={() => {
                        dragRef.current.active = false;
                    }}
                    onPointerLeave={() => { dragRef.current.active = false; }}
                    onPointerCancel={() => { dragRef.current.active = false; }}
                >
                    {upgradeCategories.map((name) => <button key={name} role="tab" aria-selected={group === name} className={group === name ? "active" : ""} onClick={() => { if (!dragRef.current.moved) setGroup(name); dragRef.current.moved = false; }}>{name}</button>)}
                </div>
                {group !== "Paint" ? <div className="upgrade-grid">
                    {upgradeGroups[group].map((item) => <div key={item.id} role="button" tabIndex={0} className={`upgrade-card ${selected[item.id] ? "selected" : ""}`} onClick={() => toggleUpgrade(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleUpgrade(item); } }}>
                        <span className="upgrade-image"><img src={item.image} alt={item.name} />{selected[item.id] && <img src="/icons/check-circle.png" className="check-icon" alt="Selected" />}
                            <span className="zoom-button" role="button" aria-label={`Preview ${item.name}`} onClick={(event) => { event.stopPropagation(); setPreview(item); }}><img src="/icons/zoom-in.png" alt="" /></span>
                        </span>
                        <span className="upgrade-copy"><strong>{item.name}</strong><span>{item.price ? `+${money(item.price)}` : "Included"}</span></span>
                    </div>)}
                </div> : <div className="paint-panel">
                    <h3>Exterior Paint</h3>
                    <p>Select a color to customize the paint pattern.</p>
                    {patternColors.length > 0 ? <div className="paint-swatches" aria-label="Pattern colors">
                        {patternColors.map((pattern) => <label key={pattern.id} className="paint-swatch" style={{ backgroundColor: pattern.color }} title={`Pattern ${pattern.id}: ${pattern.color}`}>
                            <input type="color" value={pattern.color} onChange={(event) => experienceRef.current?.setTextureColor(pattern.id, event.target.value)} aria-label={`Change pattern ${pattern.id} color`} />
                        </label>)}
                    </div> : <p className="paint-empty">Paint colors will be available when the model finishes loading.</p>}
                </div>}
            </div>}

            {step === 3 && <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
                <div className="step3-model-summary"><strong>Luxe Toy Hauler</strong><span><small>Total</small>{money(buildConfiguration.estimatedTotal)}</span></div>
                <div className="step3-divider" />
                <h3>Ready to Take the Next Step?</h3>
                <p className="form-intro">Fill out the form below to receive exclusive updates, event reminders, and personalized assistance</p>
                <div className="form-fields">
                    <label>First name *<input required value={contact.firstName} onChange={(event) => updateContact("firstName", event.target.value)} placeholder="First name" /></label>
                    <label>Last name *<input required value={contact.lastName} onChange={(event) => updateContact("lastName", event.target.value)} placeholder="Last name" /></label>
                    <label className="form-wide">Phone number<div className="phone-field"><select aria-label="Country code" defaultValue="US"><option value="US">US</option></select><input type="tel" value={contact.phone} onChange={(event) => updateContact("phone", event.target.value)} placeholder="+1 (555) 000-0000" /></div></label>
                    <label className="form-wide">State/Province<select value={contact.state} onChange={(event) => updateContact("state", event.target.value)}><option value="">Select</option><option>Alabama</option><option>Alaska</option><option>Arizona</option><option>California</option><option>Florida</option><option>New York</option><option>Texas</option><option>Other</option></select></label>
                    <label className="form-wide">Email *<input required type="email" value={contact.email} onChange={(event) => updateContact("email", event.target.value)} placeholder="you@mail.com" /></label>
                </div>
                <label className="consent-row"><input type="checkbox" checked={contact.serviceConsent} onChange={(event) => updateContact("serviceConsent", event.target.checked)} /><span>I consent to receive text messages about appointment reminders, account notifications, and relevant information from Luxe Fifth Wheels at the phone number I provided. I acknowledge that my consent is not a condition of purchase. Msg &amp; data rates may apply. Msg frequency varies. Reply HELP for assistance or STOP to opt out of receiving messages. Privacy Policy &amp; Terms &amp; Conditions .</span></label>
                <label className="consent-row"><input type="checkbox" checked={contact.marketingConsent} onChange={(event) => updateContact("marketingConsent", event.target.checked)} /><span>I consent to receive marketing text messages, such as promotional offers, discounts, and sales events from Luxe Fifth Wheels at the number I provided, including messages sent via auto dialer. I understand that my consent is not a condition of purchase. Msg &amp; data rates may apply. Msg frequency varies. Reply HELP for assistance or STOP to opt out of receiving messages. Privacy Policy &amp; Terms &amp; Conditions .</span></label>
                <div className="form-actions"><button type="button" className="form-previous" onClick={() => setStep(2)}>Previous</button><button type="submit" className="form-send">Send My Build</button></div>
            </form>}

            {step < 3 && <div className="build-summary">
                <h3>Build Summary</h3>
                <div className="summary-row"><span>Base Price</span><span>{money(basePrice)}</span></div>
                <div className="summary-row"><span>Selected Upgrades</span><span>{money(upgradesTotal)}</span></div>
                <div className="summary-row total"><span>Estimated Total</span><span>{money(basePrice + upgradesTotal)}</span></div><hr />
                <div className="summary-header"><span>Selected Items ({Object.keys(selected).length})</span><button className="view-all" onClick={() => setStep(3)}>View all</button></div>
                <div className="summary-buttons"><button className="review-button">Review Build</button><button className="send-button" onClick={() => setStep(3)}>Send My Build</button></div>
            </div>}
        </aside>

        {preview && <div className="upgrade-modal" role="dialog" aria-modal="true" aria-label={preview.name} onMouseDown={(e) => e.target === e.currentTarget && setPreview(null)}>
            <div className="upgrade-modal-card"><button className="modal-close" aria-label="Close preview" onClick={() => setPreview(null)}>×</button><img src={preview.image} alt={preview.name} /><div className="modal-caption"><strong>{preview.name}</strong><span>{preview.price ? `+${money(preview.price)}` : "Included"}</span></div></div>
        </div>}
    </>;
}
