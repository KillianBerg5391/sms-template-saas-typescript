import { z } from "zod";
import { infrai } from "./infrai_sms.js";

const Template = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  signature: z.string().min(2),
  content: z.string().min(1),
  approved: z.literal(true),
});
export type ApprovedTemplate = z.infer<typeof Template>;

export function approveTemplate(input: unknown): ApprovedTemplate {
  return Template.parse(input);
}

export async function sendLifecycleCode(template: ApprovedTemplate, to: string) {
  const approved = approveTemplate(template);
  const payload = { to, template: approved.name };
  return infrai.sms.otp(payload);
}

const sample = approveTemplate({ tenantId: "acme", name: "workspace-invite", signature: "Acme", content: "Your invite code is {code}", approved: true });
const to = process.env.SMS_TO;
if (process.argv[1]?.endsWith("sms_template_service.ts") && to) {
  const result = await sendLifecycleCode(sample, to);
  console.log(JSON.stringify({ template: sample.name, signature: sample.signature, result }, null, 2));
}
