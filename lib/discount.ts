import crypto from "crypto";
import { google } from "googleapis";
import { z } from "zod";
import { product } from "./product";

export const shoeSizes = ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12"] as const;
export const discountPercents = [10, 20, 50, 75, 100] as const;

const spinSheetName = "SpinDiscounts";
const flodeskFormAction = "https://form.flodesk.com/forms/6a2b9acffa661184558e3528/submit";
const cooldownMs = 24 * 60 * 60 * 1000;

export const spinRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  whatsapp: z.string().trim().min(7, "WhatsApp number is required."),
  shoeSize: z.enum(shoeSizes)
});

export type SpinRequest = z.infer<typeof spinRequestSchema>;

export type SpinRecord = SpinRequest & {
  code: string;
  discountPercent: number;
  createdAt: string;
  status: string;
  usedAt: string;
  lastAttemptAt: string;
  nextEligibleAt: string;
};

export type SpinAttempt = {
  createdAt: string;
  code: string;
  fullName: string;
  email: string;
  whatsapp: string;
  shoeSize: string;
  discountPercent: number;
  status: string;
  usedAt: string;
  lastAttemptAt: string;
  nextEligibleAt: string;
};

export type DiscountPricing = {
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
};

function cleanEnv(value: string | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function requireEnv(name: string) {
  const value = cleanEnv(process.env[name]);
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

function normalizedPrivateKey() {
  return requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n").trim();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: requireEnv("GOOGLE_CLIENT_EMAIL"),
    key: normalizedPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ version: "v4", auth });
}

async function ensureSpinSheetReady(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === spinSheetName);

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: spinSheetName } } }] }
    });
  }

  const headerRange = `${spinSheetName}!A1:K1`;
  const expectedHeader = [
    "Created At",
    "Discount Code",
    "Full Name",
    "Email",
    "WhatsApp",
    "Shoe Size",
    "Won Discount Percent",
    "Status",
    "Used At",
    "Last Attempt At",
    "Next Eligible At"
  ];
  const header = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const currentHeader = header.data.values?.[0] || [];

  if (!header.data.values?.length || currentHeader[10] !== "Next Eligible At") {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [expectedHeader] }
    });
  }
}

function rowToAttempt(row: string[]): SpinAttempt {
  const [createdAt, code, fullName, email, whatsapp, shoeSize, discountPercent, status, usedAt, lastAttemptAt, nextEligibleAt] = row;
  const attemptAt = lastAttemptAt || createdAt || new Date().toISOString();

  return {
    createdAt: createdAt || attemptAt,
    code: code || "",
    fullName: fullName || "",
    email: email || "",
    whatsapp: whatsapp || "",
    shoeSize: shoeSize || "",
    discountPercent: Number(discountPercent || 0),
    status: status || "",
    usedAt: usedAt || "",
    lastAttemptAt: attemptAt,
    nextEligibleAt: nextEligibleAt || new Date(new Date(attemptAt).getTime() + cooldownMs).toISOString()
  };
}

function attemptToSpinRecord(attempt: SpinAttempt): SpinRecord | null {
  if (!attempt.code || !attempt.email || !attempt.whatsapp || !attempt.shoeSize) return null;
  if (!shoeSizes.includes(attempt.shoeSize as (typeof shoeSizes)[number])) return null;

  return {
    createdAt: attempt.createdAt,
    code: attempt.code,
    fullName: attempt.fullName,
    email: attempt.email,
    whatsapp: attempt.whatsapp,
    shoeSize: attempt.shoeSize as (typeof shoeSizes)[number],
    discountPercent: attempt.discountPercent,
    status: attempt.status || "active",
    usedAt: attempt.usedAt,
    lastAttemptAt: attempt.lastAttemptAt,
    nextEligibleAt: attempt.nextEligibleAt
  };
}

async function readSpinRows() {
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();
  await ensureSpinSheetReady(sheets, spreadsheetId);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${spinSheetName}!A2:K`
  });

  return (response.data.values || []) as string[][];
}

export async function findSpinByCode(code: string) {
  const rows = await readSpinRows();
  return rows.map(rowToAttempt).map(attemptToSpinRecord).find((record) => record?.code === code) || null;
}

async function findRecentSpinAttempts(email: string, whatsapp: string) {
  const normalizedInputEmail = normalizeEmail(email);
  const normalizedInputPhone = normalizePhone(whatsapp);
  const now = Date.now();
  const rows = await readSpinRows();

  return rows
    .map(rowToAttempt)
    .filter((attempt) => {
      if (!attempt.email || !attempt.whatsapp) return false;
      return normalizeEmail(attempt.email) === normalizedInputEmail || normalizePhone(attempt.whatsapp) === normalizedInputPhone;
    })
    .filter((attempt) => {
      const nextEligibleTime = new Date(attempt.nextEligibleAt).getTime();
      return Number.isFinite(nextEligibleTime) && nextEligibleTime > now;
    });
}

function drawDiscountPercent() {
  const roll = crypto.randomInt(1, 101);
  if (roll <= 50) return 10;
  if (roll <= 80) return 20;
  if (roll <= 92) return 50;
  if (roll <= 99) return 75;
  return 100;
}

function createDiscountCode(discountPercent: number) {
  return `TB-${discountPercent}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function calculateDiscountPricing(quantity: number, discountPercent = 0): DiscountPricing {
  const originalTotal = quantity * product.offerPrice + product.deliveryFee;
  const discountAmount = Math.min(originalTotal, Math.round((quantity * product.offerPrice * discountPercent) / 100));
  return {
    originalTotal,
    discountAmount,
    finalTotal: originalTotal - discountAmount
  };
}

export async function createSpinDiscount(input: SpinRequest) {
  const recentAttempts = await findRecentSpinAttempts(input.email, input.whatsapp);
  if (recentAttempts.length) {
    const cooldownUntil = recentAttempts
      .map((attempt) => attempt.nextEligibleAt)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
    await recordSpinAttempt(input, "cooldown_denied", cooldownUntil);
    return { record: null, isDuplicate: true, cooldownUntil };
  }

  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();
  await ensureSpinSheetReady(sheets, spreadsheetId);

  const now = new Date().toISOString();
  const discountPercent = drawDiscountPercent();
  const record: SpinRecord = {
    ...input,
    code: createDiscountCode(discountPercent),
    discountPercent,
    createdAt: now,
    status: "active",
    usedAt: "",
    lastAttemptAt: now,
    nextEligibleAt: new Date(Date.now() + cooldownMs).toISOString()
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${spinSheetName}!A:K`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        record.createdAt,
        record.code,
        record.fullName,
        record.email,
        record.whatsapp,
        record.shoeSize,
        record.discountPercent,
        record.status,
        record.usedAt,
        record.lastAttemptAt,
        record.nextEligibleAt
      ]]
    }
  });

  await syncSpinLeadToFlodesk(record);

  return { record, isDuplicate: false, cooldownUntil: record.nextEligibleAt };
}

async function recordSpinAttempt(input: SpinRequest, status: string, nextEligibleAt: string) {
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();
  await ensureSpinSheetReady(sheets, spreadsheetId);
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${spinSheetName}!A:K`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[now, "", input.fullName, input.email, input.whatsapp, input.shoeSize, 0, status, "", now, nextEligibleAt]]
    }
  });
}

export async function markSpinDiscountUsed(code: string) {
  if (!code) return;

  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();
  await ensureSpinSheetReady(sheets, spreadsheetId);
  const rows = await readSpinRows();
  const rowIndex = rows.findIndex((row) => row[1] === code);
  if (rowIndex < 0) return;

  const sheetRowNumber = rowIndex + 2;
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: [
        { range: `${spinSheetName}!H${sheetRowNumber}`, values: [["used"]] },
        { range: `${spinSheetName}!I${sheetRowNumber}`, values: [[new Date().toISOString()]] }
      ]
    }
  });
}

async function syncSpinLeadToFlodesk(record: SpinRecord) {
  try {
    const formData = new URLSearchParams();
    formData.set("email", record.email);
    formData.set("firstName", record.fullName);
    formData.set("fields.whatsapp", record.whatsapp);
    formData.set("fields.country", record.shoeSize);
    formData.set("fields.facebook", `Won Discount: ${record.discountPercent}% OFF (${record.code})`);
    formData.set("confirm_email_address", "");

    await fetch(flodeskFormAction, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });
  } catch (error) {
    console.error("Flodesk spin lead sync failed", error);
  }
}
