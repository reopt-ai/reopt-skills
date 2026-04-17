import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = path.join(rootDir, "skills");

const failures = [];

const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  // Skip underscore-prefixed directories (e.g. _shared pipeline templates
  // consumed by multiple skills via references/).
  .filter((name) => !name.startsWith("_"))
  .sort();

if (skillDirs.length === 0) {
  failures.push("No skill directories found.");
}

for (const skillName of skillDirs) {
  const skillDir = path.join(skillsDir, skillName);
  const skillFile = path.join(skillDir, "SKILL.md");
  const metadataFile = path.join(skillDir, "metadata.json");

  if (!existsSync(skillFile)) {
    failures.push(`${skillName}: missing SKILL.md`);
    continue;
  }

  const content = readFileSync(skillFile, "utf8");
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);

  if (!frontmatterMatch) {
    failures.push(`${skillName}: missing YAML frontmatter`);
    continue;
  }

  const frontmatter = frontmatterMatch[1];

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);

  if (!nameMatch) {
    failures.push(`${skillName}: frontmatter missing name`);
  } else if (nameMatch[1].trim() !== skillName) {
    failures.push(
      `${skillName}: frontmatter name must match directory (${nameMatch[1].trim()})`,
    );
  }

  if (!descriptionMatch) {
    failures.push(`${skillName}: frontmatter missing description`);
  }

  if (existsSync(metadataFile)) {
    try {
      JSON.parse(readFileSync(metadataFile, "utf8"));
    } catch (error) {
      failures.push(`${skillName}: invalid metadata.json (${error.message})`);
    }
  }
}

if (failures.length > 0) {
  console.error("Skill validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validated ${skillDirs.length} skills.`);

