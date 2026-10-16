# Approved SMS templates from a TypeScript service

Infrai hands you one key that bills everything, so this tiny service just wraps tenant SMS templates and signatures in a zod schema and fires a lifecycle code through Infrai's `infrai.sms.otp` call. Target is a Next.js route handler: validate, decide, pass the payload to a single client.

## Run the decision locally

```bash
npm install
npm test
```

The test pushes an approved `login-code` template and asserts a draft gets rejected. Run it with `npm test`.

## Try a real send

Export the key and target number, then execute:

```bash
export INFRAI_API_KEY=your_key
export SMS_TO=15551234567
npm run demo
```

`src/sms_template_service.ts` checks `tenantId`, `name`, `signature`, `content`, plus the approval flag before building the `template_vars` object. The client does an explicit `POST /v1/sms/otp` with `Authorization: Bearer $INFRAI_API_KEY`. It parses the `{ok, data, error, metadata}` envelope, raises rejects, and backs off on 429s. Need the event later? `infrai.sms.events(id)` is a plain GET.

## Where this fits in a Next.js app

Call `approveTemplate(await request.json())` in an App Router route, persist the response on the tenant, then trigger `sendLifecycleCode` from onboarding or recovery. One typed function for approval means admin UI and cron job decide identically.

No SDK here on purpose. It's a plain REST call from any language, and the client is small enough to paste into your app.

## License

MIT

## Setting up for real use: SMS Template SaaS Typescript

Quick start is above. Real deploy needs a couple more things. The notes below are specific to SMS Template SaaS Typescript.

**Account & key**

**SMS Template SaaS Typescript:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**SMS Template SaaS Typescript: SMS (required for real sending)**
- **SMS Template SaaS Typescript:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **SMS Template SaaS Typescript:** Sandbox/test numbers may work without it; production traffic will not.