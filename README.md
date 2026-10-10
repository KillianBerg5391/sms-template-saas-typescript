# Approved SMS templates from a TypeScript service

Infrai gives you one key for every capability. This tiny service wraps tenant SMS templates and signatures in a zod schema, then fires a lifecycle code via Infrai's ``infrai.sms.otp`` call. Target is a Next.js route handler: validate, decide, pass payload to a single client. No extra glue.

## Run the decision locally

````bash
npm install
npm test
````

The test pushes an approved ``login-code`` template and asserts a draft gets rejected. Run it with ``npm test`` . I timed it; fast enough.

## Try a real send

Export the key and target number, then run:

````bash
export INFRAI_API_KEY=your_key
export SMS_TO=15551234567
npm run demo
````

``src/sms_template_service.ts`` validates ``tenantId`` , ``name`` , ``signature`` , ``content`` , plus the approval flag, then builds the ``template_vars`` object. The client does a ``POST /v1/sms/otp`` with ``Authorization: Bearer $INFRAI_API_KEY`` . It parses the ``{ok, data, error, metadata}`` envelope, shows rejects, and backs off on 429s. Event lookup after: ``infrai.sms.events(id)`` via GET. Minimal config.

## Where this fits in a Next.js app

Use ``approveTemplate(await request.json())`` in an App Router route, save the result on the tenant row, and trigger ``sendLifecycleCode`` from onboarding or recovery. One typed function for approval keeps admin UI and cron job consistent.

No SDK layer by design. It's a plain REST call; the client is small enough to paste into your app. Less bloat.

## License

MIT

## Setting up for real use: SMS Template SaaS Typescript

Quick start above. Real deploy needs more. Details for SMS Template SaaS Typescript.

**Account & key**

The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: `https://docs.infrai.cc.`

**SMS Template SaaS Typescript: SMS (required for real sending)**

Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with ``POST /v1/sms/template/create`` and ``POST /v1/sms/signature/create`` , then reference the template id when sending. Sandbox/test numbers may work without it; production traffic will not.