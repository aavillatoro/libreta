import { createClientFromRequest } from "npm:@base44/sdk@0.8.53";

const MAX_LENGTH = 60;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

// 24 random bytes as 32 url-safe characters
function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_");
}

// called by the start screen; open to anyone, so it only ever creates
export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const businessName = clean(body.business_name);
    const ownerName = clean(body.owner_name);

    if (!businessName || !ownerName) {
      return Response.json({ error: "business_name and owner_name are required" }, { status: 400 });
    }
    if (businessName.length > MAX_LENGTH || ownerName.length > MAX_LENGTH) {
      return Response.json({ error: `names must be ${MAX_LENGTH} characters or fewer` }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const vendor = await base44.asServiceRole.entities.Vendor.create({
      business_name: businessName,
      owner_name: ownerName,
      token: newToken(),
    });

    return Response.json({ ok: true, user_token: vendor.token });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
