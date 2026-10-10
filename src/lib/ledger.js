import { base44 } from '@/api/base44Client';

export const AGENT_ID = 'agent_3201m42b3j77f53thmejngdf7cgc';

// sample vendor "Quesadillas Doña Rosa (muestra)"; public on purpose
export const DEMO_TOKEN = 'px1AROl93z0BCmQVvwJNYgWhEyV003QI';

export const vendorToken = () => new URLSearchParams(window.location.search).get('v');

export const vendorLink = (token) => `/?v=${encodeURIComponent(token)}`;

// resolves to null when the token matches no vendor
export async function fetchLedger(token) {
  try {
    const { data } = await base44.functions.invoke('get-ledger', { user_token: token });
    return data;
  } catch (error) {
    if (error?.response?.status === 404 || error?.status === 404) return null;
    throw error;
  }
}

// resolves to the new vendor's private token
export async function createVendor(businessName, ownerName) {
  const { data } = await base44.functions.invoke('create-vendor', {
    business_name: businessName,
    owner_name: ownerName,
  });
  return data.user_token;
}

// kept out of the url so the link the vendor saves stays clean
const NEW_VENDOR_KEY = 'libreta:nueva';

export const markNewVendor = (token) => window.sessionStorage.setItem(NEW_VENDOR_KEY, token);

export const isNewVendor = (token) => window.sessionStorage.getItem(NEW_VENDOR_KEY) === token;

// period: 1m | 3m | 12m
export async function fetchStatement(token, period) {
  const { data } = await base44.functions.invoke('get-statement', { user_token: token, period });
  return data;
}

const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const money = (cents) => dollars.format(cents / 100);

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'America/New_York',
  hour: '2-digit',
  minute: '2-digit',
});

export const entryTime = (loggedAt) => clock.format(new Date(loggedAt));

const dayLabel = new Intl.DateTimeFormat('es', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

// "2026-10-10" -> "sáb 10 oct 2026"
export function dateLabel(date) {
  return dayLabel.format(new Date(`${date}T12:00:00Z`)).replace(/[.,]/g, '');
}
