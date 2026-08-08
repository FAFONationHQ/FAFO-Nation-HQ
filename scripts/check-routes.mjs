import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appDirectory = path.join(root, "app");
const headerSource = await readFile(path.join(appDirectory, "Header.tsx"), "utf8");

function extractStaticInternalRoutes(source) {
  const routes = new Set();
  const patterns = [
    /href\s*=\s*["'](\/[^"'#?]*)["']/g,
    /href\s*:\s*["'](\/[^"'#?]*)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      routes.add(match[1]);
    }
  }

  return routes;
}

const navigationRoutes = extractStaticInternalRoutes(headerSource);

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

async function findFiles(directory, includeFile) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findFiles(entryPath, includeFile)));
    } else if (includeFile(entry)) {
      files.push(entryPath);
    }
  }

  return files;
}

const pageFiles = await findFiles(appDirectory, (entry) => entry.name === "page.tsx");
const implementedRoutes = new Set(
  pageFiles.map((pageFile) => {
    const relative = path.relative(appDirectory, path.dirname(pageFile));
    return relative === "" ? "/" : `/${relative.split(path.sep).join("/")}`;
  }),
);

const sourceFiles = await findFiles(
  appDirectory,
  (entry) => entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"),
);
const routeSources = new Map();

for (const sourceFile of sourceFiles) {
  const source = await readFile(sourceFile, "utf8");

  for (const route of extractStaticInternalRoutes(source)) {
    const sources = routeSources.get(route) ?? new Set();
    sources.add(path.relative(root, sourceFile).split(path.sep).join("/"));
    routeSources.set(route, sources);
  }
}

const referencedRoutes = new Set(routeSources.keys());

const missingRoutes = [...navigationRoutes].filter(
  (route) => !implementedRoutes.has(route),
);
const unexpectedMissing = missingRoutes.filter(
  (route) => !intentionallyUnimplemented.has(route),
);
const unexpectedBrokenLinks = [...referencedRoutes].filter(
  (route) =>
    !implementedRoutes.has(route) && !intentionallyUnimplemented.has(route),
);
const staleExceptions = [...intentionallyUnimplemented].filter(
  (route) => implementedRoutes.has(route) || !navigationRoutes.has(route),
);

console.log(`Navigation routes: ${navigationRoutes.size}`);
console.log(
  `Implemented navigation routes: ${navigationRoutes.size - missingRoutes.length}`,
);
console.log(`Intentional blockers: ${missingRoutes.length}`);
console.log(`Static internal links inspected: ${referencedRoutes.size}`);

if (unexpectedMissing.length > 0) {
  console.error("Unexpected missing navigation routes:");
  unexpectedMissing.forEach((route) => console.error(`- ${route}`));
}

if (unexpectedBrokenLinks.length > 0) {
  console.error("Unexpected broken static internal links:");
  unexpectedBrokenLinks.forEach((route) => {
    const sources = [...(routeSources.get(route) ?? [])].join(", ");
    console.error(`- ${route} (${sources})`);
  });
}

if (staleExceptions.length > 0) {
  console.error("Stale intentional-route exceptions:");
  staleExceptions.forEach((route) => console.error(`- ${route}`));
}

if (
  unexpectedMissing.length > 0 ||
  unexpectedBrokenLinks.length > 0 ||
  staleExceptions.length > 0
) {
  process.exitCode = 1;
} else {
  console.log("Route inventory check passed.");
}
