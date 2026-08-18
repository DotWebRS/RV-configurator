"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type MutableRefObject, type RefObject } from "react";
import { AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { allCountries } from "country-region-data";
import { useConfiguratorUi, useExperienceRef } from "../three/ExperienceContext";
import { getModelConfiguration, type FloorPlan } from "./data";
import "./UpgradeSteps.css";
import { pushConfiguratorUrl } from "../configuratorUrl";
import { getUpgradeGroups } from "./upgradeData";

type Upgrade = { id: string; name: string; price: number; image: string; restriction?: string; compatibility?: string[] };
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

const money = (value: number) => value < 0
    ? `-$${Math.abs(value).toLocaleString("en-US")}`
    : `$${value.toLocaleString("en-US")}`;
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = getCountries()
    .filter((code) => code !== "XK")
    .map((code) => ({ code, name: countryNames.of(code) ?? code, dial: getCountryCallingCode(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
const countryRegionData = new Map<string, { countryName: string; regions: string[] }>(
    allCountries.map(([countryName, countryCode, regions]) => [
        countryCode,
        { countryName, regions: regions.map(([regionName]) => regionName) },
    ]),
);
const countriesWithoutProvinceSelection = new Set(["RS"]);

const getStateProvinceOptions = (countryCode: CountryCode) => {
    const data = countryRegionData.get(countryCode);
    const countryName = countryNames.of(countryCode) ?? data?.countryName ?? countryCode;

    if (countriesWithoutProvinceSelection.has(countryCode) || !data?.regions.length) {
        return [countryName];
    }

    return data.regions;
};

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
    const [countryOpen, setCountryOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const [stateTouched, setStateTouched] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);
    const [preparedPayload, setPreparedPayload] = useState<Record<string, unknown> | null>(null);
    const [contact, setContact] = useState<ContactForm>({ firstName: "", lastName: "", phone: "", state: "", email: "", serviceConsent: false, marketingConsent: false });
    const tabsRef = useRef<HTMLDivElement | null>(null);
    const phoneRef = useRef<HTMLInputElement | null>(null);
    const countryButtonRef = useRef<HTMLButtonElement | null>(null);
    const stateButtonRef = useRef<HTMLButtonElement | null>(null);
    const countryOptionRefs = useRef(new Map<string, HTMLButtonElement>());
    const stateOptionRefs = useRef(new Map<string, HTMLButtonElement>());
    const countrySearchRef = useRef({ query: "", at: 0 });
    const stateSearchRef = useRef({ query: "", at: 0 });
    const dragRef = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });
    const experienceRef = useExperienceRef();
    const { activeModelId, selectedFloorPlanId, setSelectedFloorPlanId, isModelLoading, setModelLoading, setActiveCameraView, setViewMode, patternColors } = useConfiguratorUi();
    const activeModel = getModelConfiguration(activeModelId);
    const floorPlans = activeModel.floorPlans;
    const selectedPlan = floorPlans.find((plan) => plan.id === selectedFloorPlanId) ?? floorPlans[0];
    const upgradeGroups = useMemo(
        () => getUpgradeGroups(activeModelId, selectedPlan.name),
        [activeModelId, selectedPlan.name],
    );
    const upgradeCategories = Object.keys(upgradeGroups);
    const activeUpgradeItems = upgradeGroups[group]
        ?? upgradeGroups.Interior
        ?? Object.values(upgradeGroups)[0]
        ?? [];
    const upgradesTotal = useMemo(() => Object.values(selected).reduce((sum, item) => sum + item.price, 0), [selected]);
    const previousConfigurationRef = useRef({ activeModelId, selectedFloorPlanId });
    const basePrice = selectedPlan.basePrice;
    const animatedUpgradesTotal = useAnimatedNumber(upgradesTotal);
    const animatedEstimatedTotal = useAnimatedNumber(basePrice + upgradesTotal);
    const fullPhone = `+${getCountryCallingCode(country)}${contact.phone.replace(/\D/g, "")}`;
    const isPhoneValid = contact.phone.trim().length > 0 && parsePhoneNumberFromString(fullPhone)?.isValid() === true;
    const stateProvinceOptions = getStateProvinceOptions(country);
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

    const selectCountry = (countryCode: CountryCode) => {
        setCountry(countryCode);
        setCountryOpen(false);
        setStateOpen(false);
        setStateTouched(false);
        setPhoneTouched(true);
        setPreparedPayload(null);
        setContact((current) => ({ ...current, state: "" }));
        countryButtonRef.current?.focus();
    };

    const updatePhoneFromInput = (rawValue: string) => {
        const trimmedValue = rawValue.trim();
        const internationalValue = trimmedValue.startsWith("+")
            ? trimmedValue
            : trimmedValue.startsWith("00")
                ? `+${trimmedValue.slice(2)}`
                : null;
        const internationalPhone = internationalValue
            ? parsePhoneNumberFromString(internationalValue)
            : undefined;
        const detectedCountry = internationalPhone?.country;
        const canUseDetectedCountry = detectedCountry
            && detectedCountry !== "XK"
            && countries.some((item) => item.code === detectedCountry);
        const nextCountry = canUseDetectedCountry ? detectedCountry : country;
        const numberToFormat = canUseDetectedCountry && internationalPhone
            ? internationalPhone.nationalNumber
            : rawValue;
        const formattedPhone = new AsYouType(nextCountry).input(numberToFormat);

        if (nextCountry !== country) {
            setCountry(nextCountry);
            setStateOpen(false);
            setStateTouched(false);
        }

        setPreparedPayload(null);
        setContact((current) => ({
            ...current,
            phone: formattedPhone,
            state: nextCountry !== country ? "" : current.state,
        }));
    };

    const handleDropdownKeyboard = (
        event: ReactKeyboardEvent<HTMLDivElement>,
        values: string[],
        selectedValue: string,
        setOpen: (open: boolean) => void,
        optionRefs: MutableRefObject<Map<string, HTMLButtonElement>>,
        searchRef: MutableRefObject<{ query: string; at: number }>,
        triggerRef: RefObject<HTMLButtonElement | null>,
    ) => {
        const currentValue = (document.activeElement as HTMLElement | null)?.dataset.optionValue;
        const currentIndex = currentValue ? values.indexOf(currentValue) : values.indexOf(selectedValue);

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            const direction = event.key === "ArrowDown" ? 1 : -1;
            const fallback = direction === 1 ? 0 : values.length - 1;
            const nextIndex = currentIndex < 0 ? fallback : (currentIndex + direction + values.length) % values.length;
            requestAnimationFrame(() => optionRefs.current.get(values[nextIndex])?.focus());
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
            return;
        }

        if (event.key.length !== 1 || !/[a-z0-9]/i.test(event.key)) return;

        event.preventDefault();
        const now = Date.now();
        const character = event.key.toLowerCase();
        let query = now - searchRef.current.at < 750
            ? searchRef.current.query + character
            : character;
        let matches = values.filter((value) => value.toLowerCase().startsWith(query));

        if (matches.length === 0) {
            query = character;
            matches = values.filter((value) => value.toLowerCase().startsWith(query));
        }

        searchRef.current = { query, at: now };
        if (matches.length === 0) return;

        const activeMatchIndex = currentValue ? matches.indexOf(currentValue) : -1;
        const match = query.length === 1 && activeMatchIndex >= 0
            ? matches[(activeMatchIndex + 1) % matches.length]
            : matches[0];
        setOpen(true);
        requestAnimationFrame(() => optionRefs.current.get(match)?.focus());
    };

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setPreview(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        const previous = previousConfigurationRef.current;
        if (
            previous.activeModelId === activeModelId
            && previous.selectedFloorPlanId === selectedFloorPlanId
        ) return;

        previousConfigurationRef.current = { activeModelId, selectedFloorPlanId };
        setSelected({});
        setStep(1);
        setGroup("Interior");
        setPreview(null);
        setSummaryOpen(false);
        setPreparedPayload(null);
    }, [activeModelId, selectedFloorPlanId]);

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
        setStateTouched(true);

        if (!contact.state) {
            stateButtonRef.current?.focus();
            return;
        }

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
        if (isModelLoading) return;
        if (selectedFloorPlanId === plan.id) {
            pushConfiguratorUrl(activeModel, plan);
            return;
        }
        const experience = experienceRef.current;
        if (!experience) return;
        setSelectedFloorPlanId(plan.id);
        pushConfiguratorUrl(activeModel, plan);
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
            if (item.restriction && item.restriction !== "None") {
                Object.keys(next)
                    .filter((id) => next[id].restriction === item.restriction)
                    .forEach((id) => delete next[id]);
            }
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
                    {activeUpgradeItems.map((item) => <div key={item.id} role="button" tabIndex={0} className={`upgrade-card ${selected[item.id] ? "selected" : ""}`} onClick={() => toggleUpgrade(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleUpgrade(item); } }}>
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
                            <div className={`custom-select country-select ${countryOpen ? "open" : ""}`} onKeyDown={(event) => handleDropdownKeyboard(event, countries.map((item) => item.code), country, setCountryOpen, countryOptionRefs, countrySearchRef, countryButtonRef)}>
                                <button ref={countryButtonRef} type="button" className="custom-select-trigger" aria-label="Country" aria-haspopup="listbox" aria-expanded={countryOpen} onClick={() => { setCountryOpen((open) => !open); setStateOpen(false); }}>{country}<span className="select-chevron" /></button>
                                {countryOpen && <div className="custom-select-menu" role="listbox" aria-label="Countries">
                                    {countries.map((item) => <button ref={(element) => { if (element) countryOptionRefs.current.set(item.code, element); else countryOptionRefs.current.delete(item.code); }} data-option-value={item.code} type="button" role="option" aria-selected={country === item.code} className={country === item.code ? "selected" : ""} key={item.code} onClick={() => selectCountry(item.code)}>{item.code}</button>)}
                                </div>}
                            </div>
                            <span className="phone-dial-code">+{getCountryCallingCode(country)}</span>
                            <input
                                ref={phoneRef}
                                required
                                type="tel"
                                name="phone"
                                autoComplete="tel"
                                value={contact.phone}
                                onBlur={() => setPhoneTouched(true)}
                                onChange={(event) => updatePhoneFromInput(event.target.value)}
                                onInput={(event) => updatePhoneFromInput(event.currentTarget.value)}
                                onAnimationStart={(event) => {
                                    if (event.animationName === "phone-autofill-start") {
                                        updatePhoneFromInput(event.currentTarget.value);
                                    }
                                }}
                                placeholder={country === "US" ? "(555) 000-0000" : "Phone number"}
                                aria-invalid={phoneTouched && !isPhoneValid}
                            />
                        </div>
                        {phoneTouched && !isPhoneValid && <small className="phone-error">Enter a valid phone number for the selected country.</small>}
                    </label>
                    <label className="form-wide">State/Province *
                        <div className={`custom-select state-select ${stateOpen ? "open" : ""} ${stateTouched && !contact.state ? "invalid" : ""}`} onKeyDown={(event) => handleDropdownKeyboard(event, stateProvinceOptions, contact.state, setStateOpen, stateOptionRefs, stateSearchRef, stateButtonRef)}>
                            <button ref={stateButtonRef} type="button" className="custom-select-trigger" aria-haspopup="listbox" aria-expanded={stateOpen} aria-invalid={stateTouched && !contact.state} onClick={() => { setStateOpen((open) => !open); setCountryOpen(false); }}>{contact.state || "Select"}<span className="select-chevron" /></button>
                            {stateOpen && <div className="custom-select-menu" role="listbox" aria-label="State or province">
                                {stateProvinceOptions.map((state) => <button ref={(element) => { if (element) stateOptionRefs.current.set(state, element); else stateOptionRefs.current.delete(state); }} data-option-value={state} type="button" role="option" aria-selected={contact.state === state} className={contact.state === state ? "selected" : ""} key={state} onClick={() => { updateContact("state", state); setStateTouched(true); setStateOpen(false); stateButtonRef.current?.focus(); }}>{state}</button>)}
                            </div>}
                        </div>
                        {stateTouched && !contact.state && <small className="phone-error">Select a state or province.</small>}
                    </label>
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
