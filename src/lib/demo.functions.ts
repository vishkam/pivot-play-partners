import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type DemoRole = "athlete" | "brand" | "admin";

const DEMO_PASSWORD = "PegasusDemo2026!";

const DEMO_USERS: Record<DemoRole, { email: string; full_name: string }> = {
  athlete: { email: "demo-athlete@pegasus.app", full_name: "Maya Rivera" },
  brand: { email: "demo-brand@pegasus.app", full_name: "Lumen Wellness" },
  admin: { email: "demo-admin@pegasus.app", full_name: "Pegasus Admin" },
};

export const ensureDemoUser = createServerFn({ method: "POST" })
  .inputValidator((input: { role: DemoRole }) => input)
  .handler(async ({ data }) => {
    const role = data.role;
    const cfg = DEMO_USERS[role];
    if (!cfg) throw new Error("Invalid demo role");

    // Find existing user by email
    let userId: string | null = null;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === cfg.email);

    if (existing) {
      userId = existing.id;
      // Make sure password is the known one
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: cfg.full_name, role },
      });
    } else {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: cfg.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: cfg.full_name, role },
      });
      if (error || !created.user) throw new Error(error?.message ?? "Failed to create demo user");
      userId = created.user.id;
    }

    // Ensure profile row + role + onboarding complete
    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: cfg.email,
        full_name: cfg.full_name,
        primary_role: role,
        onboarding_completed: true,
        country: role === "brand" ? "United States" : role === "athlete" ? "United States" : null,
      },
      { onConflict: "id" },
    );

    // Ensure user_roles row
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", role)
      .maybeSingle();
    if (!existingRole) {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
    }

    // Seed role-specific profile basics
    if (role === "athlete") {
      await supabaseAdmin.from("athlete_profiles").upsert(
        {
          user_id: userId,
          sport: "Swimming",
          discipline: "Freestyle 200m",
          professional_level: "Pro / National Team",
          team_federation: "USA Swimming",
          rankings: "National top 10 · World ranking #42",
          achievements: "2x national champion · Olympic trials finalist",
          values: ["Sustainability", "Mental health", "Equity in sport"],
          causes: ["Girls in STEM", "Ocean conservation"],
          story:
            "Recovering from injury taught me the power of clean nutrition, recovery routines and brands that show up for women athletes.",
          favorite_brands: ["TYR", "Arena", "Lululemon", "Hoka"],
          favorite_products: "Tech racing suits, recovery wear, clean electrolytes",
          material_preferences: ["Recycled polyester", "Carbon-fiber composites", "Merino blends"],
          sponsorship_categories: ["Apparel", "Nutrition", "Recovery tech"],
          partnership_types: ["Long-term ambassador", "Campaign", "Product seeding"],
          availability: "Open to 3–5 partnerships in 2026",
          pricing_min: 5000,
          pricing_max: 45000,
          profile_completeness: 92,
          verification_status: "verified",
          social_links: { instagram: "@maya.swims", tiktok: "@mayar", youtube: "Maya Rivera" },
          audience_demographics: { female_pct: 68, age_18_34_pct: 71, top_geos: ["US", "UK", "AU"] },
        },
        { onConflict: "user_id" },
      );
    } else if (role === "brand") {
      await supabaseAdmin.from("brand_profiles").upsert(
        {
          user_id: userId,
          brand_name: "Lumen Wellness",
          website: "https://lumenwellness.demo",
          industry: "Health & Nutrition",
          revenue_stage: "$5M–$25M ARR",
          contact_role: "Head of Brand Partnerships",
          values: ["Clean ingredients", "Women-led", "Sustainability"],
          mission:
            "Help women athletes recover smarter with clean, science-backed nutrition.",
          esg_priorities: ["Recyclable packaging", "Carbon-neutral shipping"],
          positioning: "Premium recovery nutrition for performance women",
          consumer_demographics: { female_pct: 74, age_25_44_pct: 66 },
          verification_status: "verified",
        },
        { onConflict: "user_id" },
      );
    }

    return { email: cfg.email, password: DEMO_PASSWORD, role };
  });
