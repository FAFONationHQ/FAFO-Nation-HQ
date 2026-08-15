# Self-Hosted Map Infrastructure Recommendation

Date: 2026-08-08  
Status: owner approval package; no infrastructure installed or deployed

## Current implementation

FAFO World uses MapLibre GL JS and the public demonstration style at `https://demotiles.maplibre.org/style.json`. The application’s seven static public records and popup content are independent from the basemap. Day Shift #3 kept MapLibre, isolated its CSS to the FAFO World route, inserted a public-deployment repository boundary, and did not change the tile source.

The demonstration service is not a production availability commitment. OpenStreetMap data may be used under its licence, but the community `tile.openstreetmap.org` service is not a free production CDN: its policy requires attribution and cache compliance, prohibits bulk scraping/prefetch, and offers no SLA. See the [OSMF Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) and [OSM copyright/attribution guidance](https://www.openstreetmap.org/copyright).

## Options

| Approach | Runtime shape | Operational complexity | Storage/bandwidth/caching | Fit for FAFO |
| --- | --- | --- | --- | --- |
| Pre-generated vector-tile object tree | Many `{z}/{x}/{y}` objects behind a CDN | Low to medium; generation and invalidation are the main work | Many small objects and requests; conventional CDN caching is straightforward | Viable, but object count and update bookkeeping are unnecessary at current scale |
| PMTiles archive in object storage | One versioned archive read through HTTP range requests, plus style/sprite/font assets | Lowest practical production runtime; offline generation still requires an owned pipeline | CDN-friendly byte ranges; simple atomic archive versioning; object storage and egress still cost money | Best match for low/medium traffic and infrequent basemap updates |
| Conventional tile server (for example Martin) | Long-running service backed by PMTiles/MBTiles, files, or PostGIS | Medium to high; patching, scaling, health, cache, and database operations | Flexible and efficient at scale, but adds compute and operational ownership | Premature unless live/custom geodata or request-time tiles become necessary |
| Vercel-hosted tile assets/proxy | Tiles or archive shipped with the app, or proxied through functions | Looks simple but couples large geodata and transfer to app deployments | Vercel documents static upload limits and metered CDN transfer; proxying adds a hop and timeout/failure surface | Keep Vercel for the application shell, not the primary basemap origin |

MapLibre documents a [PMTiles protocol integration](https://maplibre.org/maplibre-gl-js/docs/examples/pmtiles/). The MapLibre Martin documentation describes PMTiles as the cloud/distributed choice where remote access, CDN integration, or object storage is preferred: [MBTiles and PMTiles file sources](https://maplibre.org/martin/sources-files/). Vercel’s current limits include 100 MB static source uploads on Hobby and 1 GB on Pro, while CDN requests and transfer are usage-bearing resources: [Vercel limits](https://vercel.com/docs/limits), [CDN pricing and usage](https://vercel.com/docs/manage-cdn-usage).

## Recommendation

Approve a **versioned PMTiles basemap served from object storage through a CDN**, with Vercel continuing to host only the Next.js application. Keep FAFO deployment/member markers in the application’s sanitized repository; do not bake private or frequently changing FAFO data into the basemap.

Proposed production shape:

1. Pin a permitted OpenStreetMap-derived extract and generation toolchain.
2. Generate a bounded North America archive first, with an owner-approved maximum zoom and layer set based on actual FAFO traffic and map use.
3. Store immutable archives under versioned keys such as `basemap/2026-08-08/fafo-na.pmtiles`.
4. Serve range requests through a CDN/object-storage origin with long immutable cache headers, CORS restricted to approved origins, logs, cost alerts, and origin access controls.
5. Self-host the style JSON, glyphs, and sprites under versioned keys. Preserve visible OSM attribution in the MapLibre control.
6. Promote by changing a small versioned manifest/style reference; keep the prior archive available for rollback.
7. Run a repeatable update job only after validating licence/source changes, archive size, visual regressions, and cache behavior.

## Cost and operations reality

“Self-hosted” does not mean free. It shifts recurring provider markup toward object storage, CDN requests/egress, build compute, data refreshes, monitoring, backups/version retention, and operator time. The owner should approve the source dataset, geographic/zoom scope, storage/CDN vendor, update frequency, budget alerts, and retention before implementation.

## Approval questions still open

- Which object-storage/CDN region and provider satisfy Canadian/US privacy, cost, and operations requirements?
- What geographic bounds, maximum zoom, and visual layer set are required?
- How often should the basemap update, and who reviews data/licence/style changes?
- What monthly request/egress budget and alert threshold is acceptable?
- Is the initial visual style approved once reproduced from self-hosted assets?
