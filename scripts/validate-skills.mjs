import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = path.join(rootDir, "skills");
const compatFile = path.join(rootDir, "COMPATIBILITY.md");

const failures = [];
const warnings = [];

// ---------- Minimal YAML frontmatter parser ----------
// Handles the subset this repo uses: string scalars, `|` / `>` block
// scalars, and two-space-indented `-` list items. Nested mappings are
// tolerated but their values are ignored.
function parseFrontmatter(block) {
  const out = {};
  const lines = block.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.startsWith("#")) {
      i++;
      continue;
    }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!kv) {
      i++;
      continue;
    }
    const key = kv[1];
    const rest = kv[2];
    if (rest === "|" || rest === ">" || rest === "|-" || rest === ">-") {
      const buf = [];
      i++;
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i] === "")) {
        buf.push(lines[i].replace(/^ {2}/, ""));
        i++;
      }
      out[key] = buf.join("\n").trimEnd();
    } else if (rest === "") {
      const arr = [];
      let seenNested = false;
      i++;
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i] === "")) {
        const item = lines[i].match(/^ {2}- (.*)$/);
        if (item) {
          arr.push(item[1].replace(/^["']|["']$/g, ""));
        } else {
          seenNested = true;
        }
        i++;
      }
      if (arr.length) out[key] = arr;
      else if (seenNested) out[key] = "__nested__";
    } else {
      out[key] = rest.replace(/^["']|["']$/g, "");
      i++;
    }
  }
  return out;
}

// ---------- COMPATIBILITY.md table parser ----------
// Matches rows of the form `| \`skill\` | \`pkg\` | **X.Y.Z** | ... |`
// Any row where the min-version cell is not wrapped in ** is treated as
// deliberately unpinned and skipped.
function parseCompat() {
  if (!existsSync(compatFile)) return {};
  const text = readFileSync(compatFile, "utf8");
  const table = {};
  const rowRe = /^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*\*\*([^*]+)\*\*\s*\|/gm;
  let match;
  while ((match = rowRe.exec(text))) {
    table[match[1]] = { target: match[2], minVersion: match[3] };
  }
  return table;
}

const compat = parseCompat();

const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !name.startsWith("_"))
  .sort();

const allSkills = new Set(skillDirs);
const frontmatters = {};

if (skillDirs.length === 0) failures.push("No skill directories found.");

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

  const fm = parseFrontmatter(frontmatterMatch[1]);
  frontmatters[skillName] = fm;

  if (!fm.name) {
    failures.push(`${skillName}: frontmatter missing name`);
  } else if (fm.name !== skillName) {
    failures.push(
      `${skillName}: frontmatter name must match directory (got '${fm.name}')`,
    );
  }

  if (!fm.description) {
    failures.push(`${skillName}: frontmatter missing description`);
  }

  // requires: array and referential checks
  if ("requires" in fm) {
    if (!Array.isArray(fm.requires)) {
      failures.push(`${skillName}: requires must be a YAML list`);
    } else {
      for (const dep of fm.requires) {
        if (dep === skillName) {
          failures.push(`${skillName}: requires itself`);
        } else if (!allSkills.has(dep)) {
          failures.push(`${skillName}: requires '${dep}' but no such skill exists`);
        }
      }
    }
  }

  // target / targetMinVersion coherence + COMPATIBILITY.md cross-check
  const hasTarget = "target" in fm;
  const hasMinVer = "targetMinVersion" in fm;
  if (hasTarget !== hasMinVer) {
    failures.push(
      `${skillName}: target and targetMinVersion must be declared together`,
    );
  } else if (hasTarget && hasMinVer) {
    const row = compat[skillName];
    if (!row) {
      warnings.push(
        `${skillName}: declares target/targetMinVersion but has no pinned row in COMPATIBILITY.md`,
      );
    } else {
      if (row.target !== fm.target) {
        failures.push(
          `${skillName}: target mismatch — SKILL.md='${fm.target}', COMPATIBILITY.md='${row.target}'`,
        );
      }
      if (row.minVersion !== fm.targetMinVersion) {
        failures.push(
          `${skillName}: targetMinVersion mismatch — SKILL.md='${fm.targetMinVersion}', COMPATIBILITY.md='${row.minVersion}'`,
        );
      }
    }
  }

  if (existsSync(metadataFile)) {
    try {
      JSON.parse(readFileSync(metadataFile, "utf8"));
    } catch (error) {
      failures.push(`${skillName}: invalid metadata.json (${error.message})`);
    }
  }
}

// ---------- requires cycle detection ----------
const WHITE = 0;
const GRAY = 1;
const BLACK = 2;
const color = new Map(skillDirs.map((name) => [name, WHITE]));
const reportedCycles = new Set();

function visit(node, stack) {
  color.set(node, GRAY);
  stack.push(node);
  const reqs = frontmatters[node]?.requires;
  if (Array.isArray(reqs)) {
    for (const next of reqs) {
      if (!allSkills.has(next)) continue;
      if (color.get(next) === GRAY) {
        const idx = stack.indexOf(next);
        const cycle = stack.slice(idx).concat(next).join(" -> ");
        if (!reportedCycles.has(cycle)) {
          failures.push(`requires cycle: ${cycle}`);
          reportedCycles.add(cycle);
        }
      } else if (color.get(next) === WHITE) {
        visit(next, stack);
      }
    }
  }
  stack.pop();
  color.set(node, BLACK);
}

for (const name of skillDirs) {
  if (color.get(name) === WHITE) visit(name, []);
}

if (warnings.length > 0) {
  console.warn("Warnings:");
  for (const w of warnings) console.warn(`- ${w}`);
}

if (failures.length > 0) {
  console.error("Skill validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validated ${skillDirs.length} skills.`);
