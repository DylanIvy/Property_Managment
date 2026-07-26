// Seeds a known fixture to verify the cross-owner permission model:
//   owner1 -> "Owner1 - Lake House"
//   owner2 -> "Owner2 - Beach House"
//   staff-shared is linked to BOTH properties (across the two different owners)
//   one task per property, assigned to staff-shared
//
// Uses the service-role key (admin, bypasses RLS) — Node-only, never run in the browser.
// Run with: npm run seed

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_PASSWORD = "TestPass123!";

const testUsers = [
  { email: "owner1@test.com", role: "owner" as const, name: "Owner One" },
  { email: "owner2@test.com", role: "owner" as const, name: "Owner Two" },
  { email: "staff-shared@test.com", role: "staff" as const, name: "Shared Staff" },
];

async function getOrCreateUser(email: string, role: "owner" | "staff", name: string) {
  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { name, role },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create ${email}: ${error?.message}`);
  }

  return data.user.id;
}

async function main() {
  console.log("Seeding test fixture...");

  const owner1Id = await getOrCreateUser(testUsers[0].email, testUsers[0].role, testUsers[0].name);
  const owner2Id = await getOrCreateUser(testUsers[1].email, testUsers[1].role, testUsers[1].name);
  const staffId = await getOrCreateUser(testUsers[2].email, testUsers[2].role, testUsers[2].name);

  async function getOrCreateProperty(ownerId: string, name: string, address: string) {
    const { data: existing } = await admin
      .from("properties")
      .select("id")
      .eq("owner_id", ownerId)
      .eq("name", name)
      .maybeSingle();
    if (existing) return existing;

    const { data, error } = await admin
      .from("properties")
      .insert({ owner_id: ownerId, name, address })
      .select("id")
      .single();
    if (error || !data) throw new Error(`Failed to create property ${name}: ${error?.message}`);
    return data;
  }

  const prop1 = await getOrCreateProperty(owner1Id, "Owner1 - Lake House", "1 Lake Rd");
  const prop2 = await getOrCreateProperty(owner2Id, "Owner2 - Beach House", "2 Beach Ave");

  await admin
    .from("property_staff")
    .upsert(
      { property_id: prop1.id, staff_id: staffId, service_type: "house watcher" },
      { onConflict: "property_id,staff_id" },
    );
  await admin
    .from("property_staff")
    .upsert(
      { property_id: prop2.id, staff_id: staffId, service_type: "landscaper" },
      { onConflict: "property_id,staff_id" },
    );

  async function getOrCreateTask(propertyId: string, title: string) {
    const { data: existing } = await admin
      .from("tasks")
      .select("id")
      .eq("property_id", propertyId)
      .eq("title", title)
      .maybeSingle();
    if (existing) return;

    await admin.from("tasks").insert({
      property_id: propertyId,
      title,
      assigned_staff_id: staffId,
    });
  }

  await getOrCreateTask(prop1.id, "Check for leaks");
  await getOrCreateTask(prop2.id, "Mow the lawn");

  console.log("Seed complete:");
  console.log({ owner1Id, owner2Id, staffId, prop1: prop1.id, prop2: prop2.id });
  console.log(`All test accounts use password: ${TEST_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
