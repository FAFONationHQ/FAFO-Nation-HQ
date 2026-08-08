import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const appDirectory = path.join(root, "app");
const manifestModule = await import(
  pathToFileURL(path.join(root, "lib/navigation/public-routes.ts"))
);
const {
  INTENTIONALLY_BLOCKED_ROUTES,
  PUBLIC_ROUTES,
  SITEMAP_ROUTES,
} = manifestModule;

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
const declaredRoutes = new Set(PUBLIC_ROUTES.map(({ path: route }) => route));
const blockedRoutes = new Set(INTENTIONALLY_BLOCKED_ROUTES);
const sitemapRoutes = new Set(SITEMAP_ROUTES.map(({ path: route }) => route));

const duplicateDeclaredRoutes = PUBLIC_ROUTES
  .map(({ path: route }) => route)
  .filter((route, index, routes) => routes.indexOf(route) !== index);
const undeclaredImplementedRoutes = [...implementedRoutes].filter(
  (route) => !declaredRoutes.has(route),
);
const declaredButMissingRoutes = [...declaredRoutes].filter(
  (route) => !implementedRoutes.has(route),
);
const unexpectedBrokenLinks = [...referencedRoutes].filter(
  (route) => !implementedRoutes.has(route) && !blockedRoutes.has(route),
);
const staleBlockers = [...blockedRoutes].filter(
  (route) => implementedRoutes.has(route) || !referencedRoutes.has(route),
);
const blockedSitemapRoutes = [...blockedRoutes].filter((route) => sitemapRoutes.has(route));
const missingSitemapRoutes = [...declaredRoutes].filter(
  (route) => !sitemapRoutes.has(route),
);

console.log(`Declared public routes: ${declaredRoutes.size}`);
console.log(`Implemented public routes: ${implementedRoutes.size}`);
console.log(`Intentional blockers: ${blockedRoutes.size}`);
console.log(`Sitemap routes: ${sitemapRoutes.size}`);
console.log(`Static internal links inspected: ${referencedRoutes.size}`);

function report(label, values, describe = (value) => value) {
  if (values.length === 0) return;
  console.error(label);
  values.forEach((value) => console.error(`- ${describe(value)}`));
}

report("Duplicate route manifest entries:", duplicateDeclaredRoutes);
report("Implemented routes missing from manifest:", undeclaredImplementedRoutes);
report("Manifest routes missing page implementations:", declaredButMissingRoutes);
report("Unexpected broken static internal links:", unexpectedBrokenLinks, (route) => {
  const sources = [...(routeSources.get(route) ?? [])].join(", ");
  return `${route} (${sources})`;
});
report("Stale intentional-route blockers:", staleBlockers);
report("Blocked routes exposed in sitemap:", blockedSitemapRoutes);
report("Declared public routes omitted from sitemap:", missingSitemapRoutes);

const failures = [
  duplicateDeclaredRoutes,
  undeclaredImplementedRoutes,
  declaredButMissingRoutes,
  unexpectedBrokenLinks,
  staleBlockers,
  blockedSitemapRoutes,
  missingSitemapRoutes,
];

if (failures.some((failure) => failure.length > 0)) {
  process.exitCode = 1;
} else {
  console.log("Route manifest and sitemap integrity check passed.");
}
