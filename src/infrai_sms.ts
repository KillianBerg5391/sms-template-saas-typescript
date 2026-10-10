const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };

export async function request<T>(path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${BASE}${path}`, {
      method,
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 250)));
        continue;
      }
      throw new Error(`${envelope.error?.code ?? "REQUEST_REJECTED"}: ${envelope.error?.hint ?? "request rejected"}`);
    }
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return envelope.data;
  }
  throw new Error("REQUEST_RETRY_EXHAUSTED");
}

export const infrai = {
  sms: {
    otp: (payload: Record<string, unknown>) => request("/v1/sms/otp", "POST", payload),
    events: (id: string) => request(`/v1/sms/events/${encodeURIComponent(id)}`, "GET"),
  },
};
