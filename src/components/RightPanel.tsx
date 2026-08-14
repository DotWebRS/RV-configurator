"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { useConfiguratorUi, useExperienceRef } from "../three/ExperienceContext";
import { getModelConfiguration, type FloorPlan } from "./data";
import "./UpgradeSteps.css";

type Upgrade = { id: string; name: string; price: number; image: string };
type PreviewItem = { name: string; image: string; price?: number };
type ContactForm = { firstName: string; lastName: string; phone: string; state: string; email: string; serviceConsent: boolean; marketingConsent: boolean };

/* Premešteno u data.ts; ostavljeno samo u istoriji verzija.
*/
const legacyFloorPlans = [
    /* SaÄuvano za ponovno ukljuÄivanje Regent floor plan kartica:
    { id: 1, name: "48FLB", height: "13'5\"", length: "33'", width: "8'6\"", gvwr: "16,000", grey: "40 gal", black: "40 gal", fresh: "75 gal", modelPath: "threejs-assets/Regent/models/48FLB/Regent Hauler Flyer_48FLB_(10707)_V7-optimized-2k.glb" },
    { id: 2, name: "49RH", height: "13'5\"", length: "33'", width: "8'6\"", gvwr: "16,000", grey: "40 gal", black: "40 gal", fresh: "75 gal", modelPath: "threejs-assets/Regent/models/49RH/Regent Hauler Flyer_49RH_F10-optimized-2k-rotated.glb" },
    */
    { id: 3, name: "33EFS", height: "13'5\"", length: "33'", width: "8'6\"", gvwr: "16,000", grey: "40 gal", black: "40 gal", fresh: "75 gal", modelPath: "threejs-assets/Elegante/models/elegante test.glb" },
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
    Paint: [
        { id: "paint-2-color-standard", name: "2 Color (Standard)", price: 0, image: "/images/paint/2-color-standard.webp" },
        { id: "paint-velocity", name: "Velocity", price: 4400, image: "/images/paint/velocity-elite.webp" },
        { id: "paint-3-color-elite", name: "3 Color (Elite)", price: 7400, image: "/images/paint/3-color-elite-standard.webp" },
        { id: "paint-tsunami", name: "Tsunami", price: 10500, image: "/images/paint/tsunami-elite.webp" },
    ],
};

const money = (value: number) => `$${value.toLocaleString("en-US")}`;
const upgradeCategories = Object.keys(upgradeGroups);
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = getCountries().map((code) => ({ code, name: countryNames.of(code) ?? code, dial: getCountryCallingCode(code) })).sort((a, b) => a.name.localeCompare(b.name));
const countryFlag = (code: string) => String.fromCodePoint(...code.split("").map((letter) => 127397 + letter.charCodeAt(0)));

function useAnimatedNumber(value: number, duration = 2000) {
    const [displayed, setDisplayed] = useState(value);
    const previous = useRef(value);
    useEffect(() => {
        const from = previous.current;
        previous.current = value;
        if (from === value) return;
        const started = performance.now();
        let frame = 0;
        const tick = (now: number) => {
            const progress = Math.min(1, (now - started) / duration);
            const eased = progress < .5 ? 4 * progress ** 3 : 1 - ((-2 * progress + 2) ** 3) / 2;
            setDisplayed(Math.round(from + (value - from) * eased));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [duration, value]);
    return displayed;
}

export default function RightPanel() {
    const [step, setStep] = useState(1);
    const [group, setGroup] = useState("Interior");
    const [selected, setSelected] = useState<Record<string, Upgrade>>({});
    const [preview, setPreview] = useState<PreviewItem | null>(null);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [country, setCountry] = useState<CountryCode>("US");
    const [phoneTouched, setPhoneTouched] = useState(false);
    const [preparedPayload, setPreparedPayload] = useState<Record<string, unknown> | null>(null);
    const [contact, setContact] = useState<ContactForm>({ firstName: "", lastName: "", phone: "", state: "", email: "", serviceConsent: false, marketingConsent: false });
    const tabsRef = useRef<HTMLDivElement | null>(null);
    const phoneRef = useRef<HTMLInputElement | null>(null);
    const dragRef = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });
    const experienceRef = useExperienceRef();
    const { activeModelId, selectedFloorPlanId, setSelectedFloorPlanId, isModelLoading, setModelLoading, setActiveCameraView, setViewMode, patternColors } = useConfiguratorUi();
    const activeModel = getModelConfiguration(activeModelId);
    const floorPlans = activeModel.floorPlans;
    const selectedPlan = floorPlans.find((plan) => plan.id === selectedFloorPlanId) ?? floorPlans[0];
    const upgradesTotal = useMemo(() => Object.values(selected).reduce((sum, item) => sum + item.price, 0), [selected]);
    const basePrice = activeModel.basePrice;
    const animatedUpgradesTotal = useAnimatedNumber(upgradesTotal);
    const animatedEstimatedTotal = useAnimatedNumber(basePrice + upgradesTotal);
    const fullPhone = `+${getCountryCallingCode(country)}${contact.phone.replace(/\D/g, "")}`;
    const isPhoneValid = contact.phone.trim().length > 0 && parsePhoneNumberFromString(fullPhone)?.isValid() === true;
    const buildConfiguration = useMemo(() => ({
        model: activeModel.name,
        floorPlan: selectedPlan?.name ?? null,
        basePrice,
        additionalOptions: Object.values(selected).map(({ id, name, price }) => ({ id, name, price })),
        selectedUpgradesTotal: upgradesTotal,
        estimatedTotal: basePrice + upgradesTotal,
        colors: Object.fromEntries(patternColors.map((pattern, index) => [`color${index + 1}`, pattern.color])),
    }), [activeModel.name, basePrice, patternColors, selected, selectedPlan?.name, upgradesTotal]);

    const updateContact = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => {
        setPreparedPayload(null);
        setContact((current) => ({ ...current, [key]: value }));
    };

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setPreview(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        phoneRef.current?.setCustomValidity(
            contact.phone && !isPhoneValid
                ? "Enter a valid phone number for the selected country."
                : "",
        );
    }, [contact.phone, country, isPhoneValid]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPhoneTouched(true);

        if (!event.currentTarget.checkValidity() || !isPhoneValid) {
            event.currentTarget.reportValidity();
            return;
        }

        const selectedByCategory = Object.fromEntries(
            Object.entries(upgradeGroups)
                .map(([category, items]) => [
                    category,
                    items
                        .filter((item) => selected[item.id])
                        .map(({ id, name, price }) => ({ id, name, price })),
                ])
                .filter(([, items]) => (items as Upgrade[]).length > 0),
        );

        const luxeBuildConfiguration = {
            model: activeModel.name,
            floorPlan: selectedPlan?.name ?? null,
            basePrice,
            selectedUpgradesTotal: upgradesTotal,
            totalPrice: basePrice + upgradesTotal,
            selectedOptions: selectedByCategory,
        };
        const payload = {
            data: [{
                First_Name: contact.firstName.trim(),
                Last_Name: contact.lastName.trim(),
                Email: contact.email.trim(),
                Phone: fullPhone,
                State: contact.state,
                Lead_Source: "Luxe Build Your Own",
                Service_Consent: contact.serviceConsent,
                Marketing_Consent: contact.marketingConsent,
                Luxe_Build_Configuration: luxeBuildConfiguration,
            }],
            duplicate_check_fields: ["Email", "Phone"],
        };

        setPreparedPayload(payload);
        console.log("Prepared Send My Build payload:", payload);
    };

    const choosePlan = async (plan: FloorPlan) => {
        if (isModelLoading || selectedFloorPlanId === plan.id) return;
        const experience = experienceRef.current;
        if (!experience) return;
        setSelectedFloorPlanId(plan.id);
        setViewMode("Exterior");
        experience.setCameraInteractionMode("Exterior");
        setActiveCameraView("Right View");
        experience.updateCameraView("right");
        setModelLoading(true);
        try { await experience.changeRV(plan.modelPath); } finally { setModelLoading(false); }
    };

    const toggleUpgrade = (item: Upgrade) => setSelected((current) => {
        const next = { ...current };
        if (next[item.id]) delete next[item.id];
        else {
            if (item.id.startsWith("paint-")) Object.keys(next).filter((id) => id.startsWith("paint-")).forEach((id) => delete next[id]);
            next[item.id] = item;
        }
        return next;
    });

    return <>
        <aside className={`right-panel step-${step}`}>
            <script id="build-configuration" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildConfiguration).replace(/</g, "\\u003c") }} />
            {preparedPayload && <script id="lead-payload" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(preparedPayload).replace(/</g, "\\u003c") }} />}
            <h2 className="right-title">{summaryOpen ? "Your Selected Upgrades" : `Customize Your ${activeModel.name}`}</h2>
            {summaryOpen && <div className="summary-details">
                <button type="button" className="summary-back" onClick={() => setSummaryOpen(false)}>← Back</button>
                <div className="summary-details-list">
                    {Object.values(selected).length ? Object.values(selected).map((item) => <div className="summary-detail-item" key={item.id}>
                        <img src={item.image} alt="" />
                        <span><strong>{item.name}</strong><small>{money(item.price)}</small></span>
                    </div>) : <p className="summary-empty">No upgrades selected yet.</p>}
                </div>
                <div className="summary-detail-total"><span>Selected Upgrades</span><strong>{money(animatedUpgradesTotal)}</strong></div>
            </div>}
            {!summaryOpen && step < 3 && <p className="right-step"><strong>Step {step}:</strong> {step === 1 ? "select the Floor Plan" : "Select interior and exterior upgrades"}</p>}
            {!summaryOpen && step < 3 && <div className="right-buttons">
                <button className="step-button" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>Previous</button>
                <button className="step-button" onClick={() => setStep((s) => Math.min(3, s + 1))}>Next</button>
            </div>}
            {!summaryOpen && step < 3 && <div className="right-divider" />}

            {!summaryOpen && step === 1 && <div className="floorplan-container">
                {floorPlans.map((plan) => <button key={plan.id} className={`floor-card ${selectedFloorPlanId === plan.id ? "active" : ""}`} onClick={() => choosePlan(plan)}>
                    <div className="floor-image"><img src={plan.image} alt={`${plan.name} floor plan`} />
                        {selectedFloorPlanId === plan.id && <img src="/icons/check-circle.png" className="check-icon" alt="Selected" />}
                        <span
                            className="zoom-button"
                            role="button"
                            tabIndex={0}
                            aria-label={`Preview ${plan.name} floor plan`}
                            onClick={(event) => {
                                event.stopPropagation();
                                setPreview({ name: `${plan.name} Floor Plan`, image: plan.image });
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setPreview({ name: `${plan.name} Floor Plan`, image: plan.image });
                                }
                            }}
                        ><img src="/icons/zoom-in.png" alt="Zoom" /></span>
                    </div>
                    <div className="floor-content"><h4>{plan.name}</h4><p>Height: {plan.height} / Length: {plan.length}</p><p>Width: {plan.width} / GVWR: {plan.gvwr}</p><p>Grey Water: {plan.grey}</p><p>Black Water: {plan.black}</p><p>Fresh Water: {plan.fresh}</p></div>
                </button>)}
            </div>}

            {!summaryOpen && step === 2 && <div className="upgrades-section">
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
                <div className="upgrade-grid">
                    {upgradeGroups[group].map((item) => <div key={item.id} role="button" tabIndex={0} className={`upgrade-card ${selected[item.id] ? "selected" : ""}`} onClick={() => toggleUpgrade(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleUpgrade(item); } }}>
                        <span className="upgrade-image"><img src={item.image} alt={item.name} />{selected[item.id] && <img src="/icons/check-circle.png" className="check-icon" alt="Selected" />}
                            <span className="zoom-button" role="button" aria-label={`Preview ${item.name}`} onClick={(event) => { event.stopPropagation(); setPreview(item); }}><img src="/icons/zoom-in.png" alt="" /></span>
                        </span>
                        <span className="upgrade-copy"><strong>{item.name}</strong><span>{item.price ? `+${money(item.price)}` : "Included"}</span></span>
                    </div>)}
                </div>
                {/* Color picker je privremeno isključen i sačuvan za ponovno uključivanje.
                {group === "Paint" && <div className="paint-panel">
                    <h3>Exterior Paint</h3>
                    <p>Select a color to customize the paint pattern.</p>
                    {patternColors.length > 0 ? <div className="paint-swatches" aria-label="Pattern colors">
                        {patternColors.map((pattern) => <label key={pattern.id} className="paint-swatch" style={{ backgroundColor: pattern.color }} title={`Pattern ${pattern.id}: ${pattern.color}`}>
                            <input type="color" value={pattern.color} onChange={(event) => experienceRef.current?.setTextureColor(pattern.id, event.target.value)} aria-label={`Change pattern ${pattern.id} color`} />
                        </label>)}
                    </div> : <p className="paint-empty">Paint colors will be available when the model finishes loading.</p>}
                </div>}
                */}
            </div>}

            {!summaryOpen && step === 3 && <form className="contact-form" onSubmit={handleSubmit}>
                <div className="step3-model-summary"><strong>{activeModel.name}</strong><span><small>Total</small>{money(buildConfiguration.estimatedTotal)}</span></div>
                <div className="step3-divider" />
                <h3>Ready to Take the Next Step?</h3>
                <p className="form-intro">Fill out the form below to receive exclusive updates, event reminders, and personalized assistance</p>
                <div className="form-fields">
                    <label>First name *<input required pattern=".*\S.*" title="Enter your first name." value={contact.firstName} onChange={(event) => updateContact("firstName", event.target.value)} placeholder="First name" /></label>
                    <label>Last name *<input required pattern=".*\S.*" title="Enter your last name." value={contact.lastName} onChange={(event) => updateContact("lastName", event.target.value)} placeholder="Last name" /></label>
                    <label className="form-wide">Phone number *
                        <div className={`phone-field ${phoneTouched && !isPhoneValid ? "invalid" : ""}`}>
                            <select aria-label="Country and calling code" value={country} onChange={(event) => { setCountry(event.target.value as CountryCode); setPhoneTouched(true); setPreparedPayload(null); }}>
                                {countries.map((item) => <option key={item.code} value={item.code}>{countryFlag(item.code)} {item.code} (+{item.dial})</option>)}
                            </select>
                            <input ref={phoneRef} required type="tel" value={contact.phone} onBlur={() => setPhoneTouched(true)} onChange={(event) => updateContact("phone", event.target.value)} placeholder="Phone number" aria-invalid={phoneTouched && !isPhoneValid} />
                        </div>
                        {phoneTouched && !isPhoneValid && <small className="phone-error">Enter a valid phone number for the selected country.</small>}
                    </label>
                    <label className="form-wide">State/Province *<select required value={contact.state} onChange={(event) => updateContact("state", event.target.value)}><option value="">Select</option><option>Alabama</option><option>Alaska</option><option>Arizona</option><option>California</option><option>Florida</option><option>New York</option><option>Texas</option><option>Other</option></select></label>
                    <label className="form-wide">Email *<input required type="email" value={contact.email} onChange={(event) => updateContact("email", event.target.value)} placeholder="you@mail.com" /></label>
                </div>
                <label className="consent-row"><input type="checkbox" checked={contact.serviceConsent} onChange={(event) => updateContact("serviceConsent", event.target.checked)} /><span>I consent to receive text messages about appointment reminders, account notifications, and relevant information from Luxe Fifth Wheels at the phone number I provided. I acknowledge that my consent is not a condition of purchase. Msg &amp; data rates may apply. Msg frequency varies. Reply HELP for assistance or STOP to opt out of receiving messages. Privacy Policy &amp; Terms &amp; Conditions .</span></label>
                <label className="consent-row"><input type="checkbox" checked={contact.marketingConsent} onChange={(event) => updateContact("marketingConsent", event.target.checked)} /><span>I consent to receive marketing text messages, such as promotional offers, discounts, and sales events from Luxe Fifth Wheels at the number I provided, including messages sent via auto dialer. I understand that my consent is not a condition of purchase. Msg &amp; data rates may apply. Msg frequency varies. Reply HELP for assistance or STOP to opt out of receiving messages. Privacy Policy &amp; Terms &amp; Conditions .</span></label>
                <div className="form-actions"><button type="button" className="form-previous" onClick={() => setStep(2)}>Previous</button><button type="submit" className="form-send">Send My Build</button></div>
                {preparedPayload && <p className="form-payload-ready" role="status">Build payload prepared successfully.</p>}
            </form>}

            {!summaryOpen && step < 3 && <div className="build-summary">
                <h3>Build Summary</h3>
                <div className="summary-row"><span>Base Price</span><span>{money(basePrice)}</span></div>
                <div className="summary-row"><span>Selected Upgrades</span><span aria-live="polite">{money(animatedUpgradesTotal)}</span></div>
                <div className="summary-row total"><span>Estimated Total</span><span aria-live="polite">{money(animatedEstimatedTotal)}</span></div><hr />
                <div className="summary-header"><span>Selected Items ({Object.keys(selected).length})</span><button className="view-all" onClick={() => setSummaryOpen(true)}>View more</button></div>
                <div className="summary-buttons"><button className="review-button">Review Build</button><button className="send-button" onClick={() => setStep(3)}>Send My Build</button></div>
            </div>}
        </aside>

        {preview && <div className="upgrade-modal" role="dialog" aria-modal="true" aria-label={preview.name} onMouseDown={(e) => e.target === e.currentTarget && setPreview(null)}>
            <div className="upgrade-modal-card"><button className="modal-close" aria-label="Close preview" onClick={() => setPreview(null)}>×</button><img src={preview.image} alt={preview.name} /><div className="modal-caption"><strong>{preview.name}</strong>{preview.price !== undefined && <span>{preview.price ? `+${money(preview.price)}` : "Included"}</span>}</div></div>
        </div>}
    </>;
}
