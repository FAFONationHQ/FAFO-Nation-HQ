"use client";

import { useEffect, useRef } from "react";
import maplibregl, {
  Map as MapLibreMap,
  Marker,
  Popup,
} from "maplibre-gl";
import {
  GEAR_DEPLOYMENTS,
  MEMBER_LOCATIONS,
  type GearDeployment,
  type MemberLocation,
} from "./deployments";

const MAP_STYLE =
  "https://demotiles.maplibre.org/style.json";

const INITIAL_CENTER: [number, number] = [-103, 49];
const INITIAL_ZOOM = 2.7;

function createMarkerElement(
  kind: "standard" | "gold-star" | "member",
) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.setAttribute("aria-label", "Open map marker details");
  marker.style.width = kind === "gold-star" ? "34px" : "28px";
  marker.style.height = kind === "gold-star" ? "34px" : "28px";
  marker.style.display = "grid";
  marker.style.placeItems = "center";
  marker.style.cursor = "pointer";
  marker.style.border = "2px solid #D4AF37";
  marker.style.background = "#050505";
  marker.style.color = "#D4AF37";
  marker.style.boxShadow = "0 0 14px rgba(212,175,55,0.55)";
  marker.style.fontWeight = "900";
  marker.style.fontSize = kind === "gold-star" ? "20px" : "14px";
  marker.style.lineHeight = "1";

  if (kind === "standard") {
    marker.style.borderRadius = "9999px";
    marker.textContent = "🍁";
  }

  if (kind === "gold-star") {
    marker.style.clipPath =
      "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 94%,50% 72%,21% 94%,32% 57%,2% 35%,39% 35%)";
    marker.style.background = "#D4AF37";
    marker.style.color = "#050505";
    marker.style.border = "0";
    marker.textContent = "★";
  }

  if (kind === "member") {
    marker.style.transform = "rotate(45deg)";
    marker.style.borderRadius = "4px";
    marker.textContent = "◆";
  }

  return marker;
}

function popupMarkup(
  title: string,
  location: string,
  detail: string,
) {
  return `
    <div style="min-width:190px;background:#050505;color:#fff;padding:12px;border:1px solid rgba(212,175,55,.45)">
      <div style="color:#D4AF37;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.12em">
        ${title}
      </div>
      <div style="margin-top:7px;font-size:14px;font-weight:800">
        ${location}
      </div>
      <div style="margin-top:6px;color:rgba(255,255,255,.65);font-size:12px;line-height:1.5">
        ${detail}
      </div>
    </div>
  `;
}

function addGearMarker(
  map: MapLibreMap,
  deployment: GearDeployment,
  offsetIndex: number,
) {
  const isGoldStar =
    deployment.markerType === "gold-star-fafo";

  const element = createMarkerElement(
    isGoldStar ? "gold-star" : "standard",
  );

  const popup = new Popup({
    offset: 24,
    closeButton: true,
    closeOnClick: true,
    className: "fafo-world-popup",
  }).setHTML(
    popupMarkup(
      deployment.publicLabel,
      `${deployment.city}, ${deployment.region}`,
      isGoldStar
        ? "Verified custom gear deployment."
        : "Verified FAFO Nation gear deployment.",
    ),
  );

  const overlapOffset = offsetIndex * 0.018;

  new Marker({
    element,
    anchor: "center",
  })
    .setLngLat([
      deployment.longitude + overlapOffset,
      deployment.latitude + overlapOffset,
    ])
    .setPopup(popup)
    .addTo(map);
}

function addMemberMarker(
  map: MapLibreMap,
  member: MemberLocation,
) {
  const element = createMarkerElement("member");

  const popup = new Popup({
    offset: 24,
    closeButton: true,
    closeOnClick: true,
    className: "fafo-world-popup",
  }).setHTML(
    popupMarkup(
      member.publicLabel,
      `${member.city}, ${member.region}`,
      member.role,
    ),
  );

  new Marker({
    element,
    anchor: "center",
  })
    .setLngLat([member.longitude, member.latitude])
    .setPopup(popup)
    .addTo(map);
}

export default function FAFOWorldMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      minZoom: 1.5,
      maxZoom: 16,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      "top-right",
    );

    map.addControl(
      new maplibregl.FullscreenControl(),
      "top-right",
    );

    const cedarCityCount = new Map<string, number>();

    GEAR_DEPLOYMENTS.forEach((deployment) => {
      const locationKey =
        `${deployment.city}-${deployment.region}`;

      const overlapIndex =
        cedarCityCount.get(locationKey) ?? 0;

      addGearMarker(map, deployment, overlapIndex);

      cedarCityCount.set(locationKey, overlapIndex + 1);
    });

    MEMBER_LOCATIONS.forEach((member) => {
      addMemberMarker(map, member);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative overflow-hidden border border-[#D4AF37]/35 bg-black shadow-[0_0_30px_rgba(212,175,55,0.12)]">
      <div
        ref={mapContainerRef}
        aria-label="Interactive FAFO World map"
        className="h-[62dvh] min-h-[440px] w-full lg:h-[70dvh]"
      />

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2">
        <div className="border border-white/15 bg-black/85 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#D4AF37] backdrop-blur">
          🍁 Verified Gear Deployment
        </div>

        <div className="border border-[#D4AF37]/40 bg-black/85 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#D4AF37] backdrop-blur">
          ★ Gold Star FAFO
        </div>

        <div className="border border-white/15 bg-black/85 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
          ◆ FAFO Member Location
        </div>
      </div>
    </div>
  );
}