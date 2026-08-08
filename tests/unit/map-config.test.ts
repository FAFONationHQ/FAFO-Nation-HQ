import { describe, expect, test } from "vitest";

import {
  DEMONSTRATION_MAP_STYLE,
  resolveFafoWorldMapConfiguration,
} from "../../lib/fafo-world/map-config.ts";

describe("FAFO World PMTiles configuration", () => {
  test("keeps the existing map source by default", () => {
    expect(resolveFafoWorldMapConfiguration(undefined, "http://localhost:3000")).toEqual({
      mode: "demonstration",
      style: DEMONSTRATION_MAP_STYLE,
    });
  });

  test("builds a same-origin raster PMTiles style", () => {
    const config = resolveFafoWorldMapConfiguration(
      "/maps/fafo-world.pmtiles",
      "http://localhost:3000",
    );
    expect(config.mode).toBe("local-pmtiles");
    if (config.mode === "local-pmtiles") {
      expect(config.archiveUrl).toBe("http://localhost:3000/maps/fafo-world.pmtiles");
      expect(config.style.sources["fafo-pmtiles"]).toMatchObject({
        type: "raster",
        url: "pmtiles://http://localhost:3000/maps/fafo-world.pmtiles",
      });
    }
  });

  test.each([
    "https://tiles.example.test/fafo.pmtiles",
    "//tiles.example.test/fafo.pmtiles",
    "/maps/not-an-archive.json",
    "/maps/fafo world.pmtiles",
    "/../private.pmtiles",
  ])("rejects an unsafe or non-local archive path: %s", (path) => {
    expect(resolveFafoWorldMapConfiguration(path, "http://localhost:3000").mode)
      .toBe("demonstration");
  });
});
