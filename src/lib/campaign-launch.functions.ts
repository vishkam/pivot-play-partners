import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { submitCampaign } from "./campaign-launch.server";

const campaignSubmissionSchema = z.object({
  mode: z.enum(["draft", "launch"]),
  name: z.string().max(140),
  goals: z.string().max(1000),
  description: z.string().max(1600),
  audience: z.string().max(1000),
  values: z.string().max(1000),
  sports: z.string().max(800),
  geo: z.string().max(800),
  partnership_structure: z.string().max(160),
  deliverables: z.string().max(1000),
  timeline: z.string().max(300),
  product_category: z.string().max(160),
  budget_min: z.string().max(20),
  budget_max: z.string().max(20),
  notes: z.string().max(2000),
});

export type CampaignSubmission = z.infer<typeof campaignSubmissionSchema>;

export const submitCampaignLaunch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => campaignSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    console.log("[Pegasus Launch] server function received", {
      userId: context.userId,
      mode: data.mode,
      campaignName: data.name,
    });

    return submitCampaign({ userId: context.userId, data });
  });