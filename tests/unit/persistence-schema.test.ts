import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

const schema = await readFile("prisma/schema.prisma", "utf8");
const migration = await readFile(
  "prisma/migrations/20260808113000_member_privacy_v1/migration.sql",
  "utf8",
);

function modelBlock(name: string): string {
  const match = schema.match(new RegExp(`model ${name} \\{([\\s\\S]*?)\\n\\}`));
  expect(match, `${name} should exist in the Prisma schema`).not.toBeNull();
  return match?.[1] ?? "";
}

describe("member privacy persistence schema", () => {
  test("contains only the approved first-slice models", () => {
    expect([...schema.matchAll(/^model (\w+)/gm)].map((match) => match[1])).toEqual([
      "Member",
      "AuthIdentity",
      "MemberProfile",
      "ConsentDecision",
    ]);
  });

  test("keeps profiles private by default with stable public identity", () => {
    const profile = modelBlock("MemberProfile");
    expect(profile).toContain("publicId");
    expect(profile).toMatch(/publicId\s+String\s+@unique\s+@default\(cuid\(\)\)/);
    expect(profile).toMatch(/visibility\s+ProfileVisibility\s+@default\(PRIVATE\)/);
    expect(migration).toContain('"visibility" "ProfileVisibility" NOT NULL DEFAULT \'PRIVATE\'');
  });

  test("links external subjects uniquely without local credentials", () => {
    const identity = modelBlock("AuthIdentity");
    expect(identity).toContain("@@unique([provider, providerSubject])");
    expect(schema).not.toMatch(/password|secret|token/i);
  });

  test("models consent as append-only decisions", () => {
    const consent = modelBlock("ConsentDecision");
    expect(consent).toContain("decidedAt");
    expect(consent).not.toContain("updatedAt");
    expect(consent).toContain("onDelete: Restrict");
    expect(migration).toContain("ConsentDecision_policy_not_blank_check");
  });

  test("enforces normalized callsigns and complete city-level locations", () => {
    expect(migration).toContain("MemberProfile_callsign_format_check");
    expect(migration).toContain("MemberProfile_location_triplet_check");
    expect(migration).not.toMatch(/street|postal|latitude|longitude/i);
  });
});
