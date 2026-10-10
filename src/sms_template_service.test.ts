import assert from "node:assert/strict";
process.env.INFRAI_API_KEY = "test-key";
const { approveTemplate, sendLifecycleCode } = await import("./sms_template_service.js");

const accepted = approveTemplate({ tenantId: "tenant-7", name: "login-code", signature: "Northstar", content: "Code {code}", approved: true });
assert.equal(accepted.approved, true);
assert.throws(() => approveTemplate({ tenantId: "tenant-7", name: "draft", signature: "N", content: "Code", approved: false }));
const originalFetch = globalThis.fetch;
globalThis.fetch = async (_url, init) => {
  assert.deepEqual(JSON.parse(String(init?.body)), { to: "test-destination", template: "login-code" });
  return new Response(JSON.stringify({ ok: true, data: { id: "test-id" } }), { status: 200 });
};
try {
  assert.deepEqual(await sendLifecycleCode(accepted, "test-destination"), { id: "test-id" });
} finally {
  globalThis.fetch = originalFetch;
}
console.log("approval decision test passed");
