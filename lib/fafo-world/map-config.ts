import type { StyleSpecification } from "maplibre-gl";

export const DEMONSTRATION_MAP_STYLE = "https://demotiles.maplibre.org/style.json";
const LOCAL_PMTILES_PATH = /^\/[A-Za-z0-9/_-]+\.pmtiles$/;

export type FafoWorldMapConfiguration =
  | { mode: "demonstration"; style: string }
  | { mode: "local-pmtiles"; archiveUrl: string; style: StyleSpecification };

export function resolveFafoWorldMapConfiguration(
  configuredPath: string | undefined,
  origin: string,
): FafoWorldMapConfiguration {
  const path = configuredPath?.trim();
  if (!path) return { mode: "demonstration", style: DEMONSTRATION_MAP_STYLE };
  if (!LOCAL_PMTILES_PATH.test(path)) {
    return { mode: "demonstration", style: DEMONSTRATION_MAP_STYLE };
  }

  const archiveUrl = new URL(path, origin).toString();
  return {
    mode: "local-pmtiles",
    archiveUrl,
    style: {
      version: 8,
      name: "FAFO World local PMTiles prototype",
      sources: {
        "fafo-pmtiles": {
          type: "raster",
          url: `pmtiles://${archiveUrl}`,
          tileSize: 256,
          attribution: "Map data © OpenStreetMap contributors",
        },
      },
      layers: [
        {
          id: "fafo-pmtiles-basemap",
          type: "raster",
          source: "fafo-pmtiles",
        },
      ],
    },
  };
}
