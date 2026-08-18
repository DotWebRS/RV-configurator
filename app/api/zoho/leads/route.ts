import { NextRequest, NextResponse } from "next/server";
import type {
    LeadBuildConfiguration,
    LeadSubmissionResponse,
    ZohoLeadSubmission,
} from "../../../../src/lib/zohoLead";

export const runtime = "nodejs";

const LIVE_CONFIRMATION = "UPSERT_REAL_ZOHO_LEADS";
const DEFAULT_ACCOUNTS_URL = "https://accounts.zoho.com";
const DEFAULT_API_URL = "https://www.zohoapis.com";
const ALLOWED_ACCOUNTS_URLS = new Set([DEFAULT_ACCOUNTS_URL]);
const ALLOWED_API_URLS = new Set([DEFAULT_API_URL]);

let cachedAccessToken: { value: string; expiresAt: number } | null = null;

const json = (body: LeadSubmissionResponse, status = 200) =>
    NextResponse.json(body, {
        status,
        headers: { "Cache-Control": "no-store" },
    });

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedString(value: unknown, maximumLength: number): value is string {
    return typeof value === "string"
        && value.trim().length > 0
        && value.length <= maximumLength;
}

function isValidBuildConfiguration(value: unknown): value is LeadBuildConfiguration {
    if (!isRecord(value) || !isRecord(value.selectedOptions)) return false;

    return isBoundedString(value.model, 100)
        && (value.floorPlan === null || isBoundedString(value.floorPlan, 100))
        && typeof value.basePrice === "number"
        && Number.isFinite(value.basePrice)
        && typeof value.selectedUpgradesTotal === "number"
        && Number.isFinite(value.selectedUpgradesTotal)
        && typeof value.totalPrice === "number"
        && Number.isFinite(value.totalPrice);
}

function parseSubmission(value: unknown): ZohoLeadSubmission | null {
    if (!isRecord(value)) return null;

    const email = typeof value.email === "string" ? value.email.trim() : "";
    const emailIsValid = email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
        !isBoundedString(value.firstName, 80)
        || !isBoundedString(value.lastName, 80)
        || !emailIsValid
        || !isBoundedString(value.phone, 40)
        || !/^\+[1-9]\d{6,14}$/.test(value.phone)
        || !isBoundedString(value.state, 100)
        || typeof value.serviceConsent !== "boolean"
        || typeof value.marketingConsent !== "boolean"
        || !isValidBuildConfiguration(value.buildConfiguration)
    ) {
        return null;
    }

    return {
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        email,
        phone: value.phone,
        state: value.state.trim(),
        serviceConsent: value.serviceConsent,
        marketingConsent: value.marketingConsent,
        buildConfiguration: value.buildConfiguration,
    };
}

function isLiveSubmissionEnabled() {
    return process.env.ZOHO_LEAD_SUBMISSION_ENABLED === "true"
        && process.env.ZOHO_LIVE_CONFIRMATION === LIVE_CONFIRMATION;
}

function getZohoConfiguration() {
    const accountsUrl = process.env.ZOHO_ACCOUNTS_URL ?? DEFAULT_ACCOUNTS_URL;
    const apiUrl = process.env.ZOHO_API_URL ?? DEFAULT_API_URL;

    if (!ALLOWED_ACCOUNTS_URLS.has(accountsUrl) || !ALLOWED_API_URLS.has(apiUrl)) {
        throw new Error("Unsupported Zoho data-center URL.");
    }

    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Zoho OAuth environment variables are incomplete.");
    }

    return { accountsUrl, apiUrl, clientId, clientSecret, refreshToken };
}

async function getAccessToken() {
    const now = Date.now();
    if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) {
        return cachedAccessToken.value;
    }

    const config = getZohoConfiguration();
    const tokenBody = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token",
    });
    const response = await fetch(`${config.accountsUrl}/oauth/v2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenBody,
        cache: "no-store",
    });
    const result: unknown = await response.json().catch(() => null);

    if (!response.ok || !isRecord(result) || typeof result.access_token !== "string") {
        throw new Error("Zoho OAuth token refresh failed.");
    }

    const expiresIn = typeof result.expires_in === "number" ? result.expires_in : 3600;
    cachedAccessToken = {
        value: result.access_token,
        expiresAt: now + Math.max(60, expiresIn) * 1000,
    };

    return cachedAccessToken.value;
}

function createZohoPayload(submission: ZohoLeadSubmission) {
    return {
        data: [{
            First_Name: submission.firstName,
            Last_Name: submission.lastName,
            Email: submission.email,
            Phone: submission.phone,
            State: submission.state,
            Lead_Source: "Luxe Build Your Own",
            Service_Consent: submission.serviceConsent,
            Marketing_Consent: submission.marketingConsent,
            Luxe_Build_Configuration: JSON.stringify(submission.buildConfiguration),
        }],
        duplicate_check_fields: ["Email"],
    };
}

export async function POST(request: NextRequest) {
    if (!request.headers.get("content-type")?.includes("application/json")) {
        return json({ ok: false, message: "Content-Type must be application/json." }, 415);
    }

    const submission = parseSubmission(await request.json().catch(() => null));
    if (!submission) {
        return json({ ok: false, message: "Lead submission data is invalid." }, 400);
    }

    // This check must stay before OAuth refresh and CRM calls.
    if (!isLiveSubmissionEnabled()) {
        return json({
            ok: true,
            dryRun: true,
            message: "Dry run completed. No data was sent to Zoho.",
        });
    }

    try {
        const config = getZohoConfiguration();
        const accessToken = await getAccessToken();
        const response = await fetch(`${config.apiUrl}/crm/v8/Leads/upsert`, {
            method: "POST",
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createZohoPayload(submission)),
            cache: "no-store",
        });
        const result: unknown = await response.json().catch(() => null);
        const record = isRecord(result)
            && Array.isArray(result.data)
            && isRecord(result.data[0])
            ? result.data[0]
            : null;

        if (!response.ok || !record || record.status !== "success") {
            const message = record && typeof record.message === "string"
                ? record.message
                : "Zoho rejected the lead submission.";
            return json({ ok: false, message }, 502);
        }

        const details = isRecord(record.details) ? record.details : null;
        return json({
            ok: true,
            message: "Your build was sent successfully.",
            leadId: details && typeof details.id === "string" ? details.id : undefined,
        });
    } catch {
        return json({
            ok: false,
            message: "Lead submission is temporarily unavailable.",
        }, 503);
    }
}
