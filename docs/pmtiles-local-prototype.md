# Local PMTiles Prototype

Date: 2026-08-08
Status: integration path implemented; local/non-production only; no archive acquired or deployed

FAFO World can now read a same-origin raster PMTiles archive through MapLibre while preserving the existing markers and text location index. The default remains the existing MapLibre demonstration style.

## Local use

1. Obtain or generate a reviewed, licensed raster PMTiles archive without scraping public OSM tile servers.
2. Place it at `public/maps/fafo-world.pmtiles`.
3. Set `NEXT_PUBLIC_FAFO_PMTILES_URL=/maps/fafo-world.pmtiles` in `.env.local` and restart local development.

Only a same-origin absolute path ending in `.pmtiles` is accepted. External URLs, protocol-relative URLs, traversal, spaces, and other file types fail back to the existing demonstration style. The configuration is public by design and must never contain credentials.

The archive is deliberately absent: choosing/extracting map data, validating ODbL attribution and derivative-database obligations, and deciding geographic/zoom coverage remain owner/licensing decisions. This means the code path and protocol integration are testable, but end-to-end tile rendering remains blocked on an approved archive.

## Production requirements

- Versioned immutable archive names, object storage, CDN range-request support, correct `Content-Type`, cache policy, approved-origin CORS, origin access controls, logs, and cost alerts.
- A reviewed style matched to the archive format/layers. This prototype expects raster tiles; vector basemaps require a versioned style and source-layer contract.
- Visible attribution and a documented data refresh/removal process.
- Measure archive bytes, requested byte ranges, cold/warm load time, and cache hit rate using the selected coverage. No defensible storage estimate is possible before coverage, zoom range, tile format, and data source are chosen.

Implementation follows the official Protomaps MapLibre pattern: register the PMTiles protocol once, then use a `pmtiles://` source URL.
