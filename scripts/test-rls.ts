// Verifies the permission model by signing in with the ANON key as each test
// user (exercising the exact RLS policies the app uses) and asserting:
//   - owner1 never sees owner2's property/tasks, and vice versa
//   - staff-shared sees BOTH properties, but each property's tasks stay siloed
//
// Requires scripts/seed-test-users.ts to have been run first.
// Run with: npm run test:rls

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const TEST_PASSWORD = "TestPass123!";
let failures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS: ${message}`);
  } else {
    console.error(`  FAIL: ${message}`);
    failures++;
  }
}

async function signInAs(email: string) {
  const client = createClient(supabaseUrl!, anonKey!);
  const { data, error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error || !data.session) {
    throw new Error(`Could not sign in as ${email}: ${error?.message}`);
  }
  return client;
}

async function main() {
  console.log("--- As owner1 ---");
  const owner1 = await signInAs("owner1@test.com");

  const { data: owner1Properties } = await owner1.from("properties").select("name");
  assert(
    (owner1Properties?.length ?? 0) === 1 && owner1Properties![0].name === "Owner1 - Lake House",
    "owner1 sees exactly their own property, never owner2's",
  );

  const { data: owner1StaffRows } = await owner1.from("property_staff").select("property_id");
  assert(
    (owner1StaffRows?.length ?? 0) === 1,
    "owner1 sees only the property_staff row for their own property (not the shared staff's link to owner2)",
  );

  const { data: owner1Tasks } = await owner1.from("tasks").select("title");
  assert(
    (owner1Tasks?.length ?? 0) === 1 && owner1Tasks![0].title === "Check for leaks",
    "owner1 sees only their own property's task",
  );

  console.log("--- As owner2 ---");
  const owner2 = await signInAs("owner2@test.com");

  const { data: owner2Properties } = await owner2.from("properties").select("name");
  assert(
    (owner2Properties?.length ?? 0) === 1 && owner2Properties![0].name === "Owner2 - Beach House",
    "owner2 sees exactly their own property, never owner1's",
  );

  const { data: owner2Tasks } = await owner2.from("tasks").select("title");
  assert(
    (owner2Tasks?.length ?? 0) === 1 && owner2Tasks![0].title === "Mow the lawn",
    "owner2 sees only their own property's task",
  );

  console.log("--- As staff-shared ---");
  const staff = await signInAs("staff-shared@test.com");

  const { data: staffProperties } = await staff.from("properties").select("name");
  const staffPropertyNames = (staffProperties ?? []).map((p) => p.name).sort();
  assert(
    staffPropertyNames.length === 2 &&
      staffPropertyNames[0] === "Owner1 - Lake House" &&
      staffPropertyNames[1] === "Owner2 - Beach House",
    "staff-shared sees BOTH properties, spanning two different owners",
  );

  const { data: staffTasks } = await staff.from("tasks").select("title");
  const staffTaskTitles = (staffTasks ?? []).map((t) => t.title).sort();
  assert(
    staffTaskTitles.length === 2 &&
      staffTaskTitles[0] === "Check for leaks" &&
      staffTaskTitles[1] === "Mow the lawn",
    "staff-shared sees their assigned task on EACH property, correctly scoped per property",
  );

  if (failures > 0) {
    console.error(`\n${failures} assertion(s) failed. The permission model has a gap.`);
    process.exit(1);
  }

  console.log("\nAll permission boundary assertions passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
