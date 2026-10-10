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

const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const money = (cents) => dollars.format(cents / 100);

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'America/New_York',
  hour: '2-digit',
  minute: '2-digit',
});

// base44 timestamps are utc without a zone suffix
export function entryTime(createdDate) {
  const iso = /Z|[+-]\d\d:?\d\d$/.test(createdDate) ? createdDate : `${createdDate}Z`;
  return clock.format(new Date(iso));
}

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
