import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appDirectory = path.join(root, "app");
const headerSource = await readFile(path.join(appDirectory, "Header.tsx"), "utf8");

const navigationRoutes = new Set(
  [...headerSource.matchAll(/href:\s*"(\/[^"#?]*)"/g)].map((match) => match[1]),
);

const intentionallyUnimplemented = new Set([
  "/fafo-cares/annual-campaign",
  "/fafo-cares/cancer-support",
  "/fafo-cares/emergency-fund",
  "/fafo-cares/fundraising",
  "/fafo-cares/mental-health",
  "/fafo-cares/need-help-now",
  "/fafo-cares/spotlights",
  "/fafo-cares/support",
  "/fafo-cares/veterans",
  "/fafo-cares/volunteer",
]);

async function findPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      pages.push(...(await findPages(entryPath)));
    } else if (entry.name === "page.tsx") {
      pages.push(entryPath);
    }
  }

  return pages;
}

const pageFiles = await findPages(appDirectory);
const implementedRoutes = new Set(
  pageFiles.map((pageFile) => {
    const relative = path.relative(appDirectory, path.dirname(pageFile));
    return relative === "" ? "/" : `/${relative.split(path.sep).join("/")}`;
  }),
);

const missingRoutes = [...navigationRoutes].filter(
  (route) => !implementedRoutes.has(route),
);
const unexpectedMissing = missingRoutes.filter(
  (route) => !intentionallyUnimplemented.has(route),
);
const staleExceptions = [...intentionallyUnimplemented].filter(
  (route) => implementedRoutes.has(route) || !navigationRoutes.has(route),
);

console.log(`Navigation routes: ${navigationRoutes.size}`);
console.log(
  `Implemented navigation routes: ${navigationRoutes.size - missingRoutes.length}`,
);
console.log(`Intentional blockers: ${missingRoutes.length}`);

if (unexpectedMissing.length > 0) {
  console.error("Unexpected missing navigation routes:");
  unexpectedMissing.forEach((route) => console.error(`- ${route}`));
}

if (staleExceptions.length > 0) {
  console.error("Stale intentional-route exceptions:");
  staleExceptions.forEach((route) => console.error(`- ${route}`));
}

if (unexpectedMissing.length > 0 || staleExceptions.length > 0) {
  process.exitCode = 1;
} else {
  console.log("Route inventory check passed.");
}
