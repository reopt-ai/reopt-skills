import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Internal maintenance script. Expects to run from inside the reopt monorepo
// where seed skills live at ../packages/cli/skills. Outside the monorepo this
// path will not exist and the script exits as a no-op.
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.resolve(rootDir, "../packages/cli/skills");
const targetDir = path.join(rootDir, "skills");
const force = process.argv.includes("--force");

if (!existsSync(sourceDir)) {
  console.log(`No CLI skills source found at ${sourceDir} (expected when running outside the reopt monorepo).`);
  process.exit(0);
}

const copied = [];

for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const sourceSkillDir = path.join(sourceDir, entry.name);
  const sourceSkillFile = path.join(sourceSkillDir, "SKILL.md");
  const targetSkillDir = path.join(targetDir, entry.name);
  const targetSkillFile = path.join(targetSkillDir, "SKILL.md");

  if (!existsSync(sourceSkillFile)) continue;
  if (!force && existsSync(targetSkillFile)) continue;

  mkdirSync(targetSkillDir, { recursive: true });
  cpSync(sourceSkillFile, targetSkillFile);
  copied.push(entry.name);
}

if (copied.length === 0) {
  console.log(force ? "No SKILL.md files copied." : "No missing SKILL.md files to seed.");
  process.exit(0);
}

console.log(`${force ? "Synced" : "Seeded"} ${copied.length} skills from ${sourceDir}`);
for (const name of copied) {
  console.log(`- ${name}`);
}
