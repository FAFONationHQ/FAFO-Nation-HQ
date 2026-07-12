export type GearDeploymentMarkerType =
  | "standard-deployment"
  | "gold-star-fafo";

export type MemberLocationMarkerType =
  | "fafo-member-location";

export type GearDeployment = {
  id: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  markerType: GearDeploymentMarkerType;
  publicLabel: string;
};

export type MemberLocation = {
  id: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  markerType: MemberLocationMarkerType;
  role: string;
  publicLabel: string;
};

export const GEAR_DEPLOYMENTS: GearDeployment[] = [
  {
    id: "gear-vancouver-bc-001",
    city: "Vancouver",
    region: "British Columbia",
    country: "Canada",
    latitude: 49.2827,
    longitude: -123.1207,
    markerType: "standard-deployment",
    publicLabel: "FAFO Gear Deployed",
  },
  {
    id: "gear-chemainus-bc-001",
    city: "Chemainus",
    region: "British Columbia",
    country: "Canada",
    latitude: 48.9208,
    longitude: -123.7165,
    markerType: "standard-deployment",
    publicLabel: "FAFO Gear Deployed",
  },
  {
    id: "gear-cedar-city-ut-001",
    city: "Cedar City",
    region: "Utah",
    country: "USA",
    latitude: 37.6775,
    longitude: -113.0619,
    markerType: "gold-star-fafo",
    publicLabel: "Gold Star FAFO Custom Deployment",
  },
  {
    id: "gear-cedar-city-ut-002",
    city: "Cedar City",
    region: "Utah",
    country: "USA",
    latitude: 37.6775,
    longitude: -113.0619,
    markerType: "gold-star-fafo",
    publicLabel: "Gold Star FAFO Custom Deployment",
  },
  {
    id: "gear-calgary-ab-001",
    city: "Calgary",
    region: "Alberta",
    country: "Canada",
    latitude: 51.0447,
    longitude: -114.0719,
    markerType: "gold-star-fafo",
    publicLabel: "Gold Star FAFO Custom Deployment",
  },
  {
    id: "gear-toronto-on-001",
    city: "Toronto",
    region: "Ontario",
    country: "Canada",
    latitude: 43.6532,
    longitude: -79.3832,
    markerType: "standard-deployment",
    publicLabel: "FAFO Gear Deployed",
  },
];

export const MEMBER_LOCATIONS: MemberLocation[] = [
  {
    id: "member-victoria-bc-001",
    city: "Victoria",
    region: "British Columbia",
    country: "Canada",
    latitude: 48.4284,
    longitude: -123.3656,
    markerType: "fafo-member-location",
    role: "Founding Member / Owner",
    publicLabel: "FAFO Member Location",
  },
];

export const FAFO_WORLD_STATS = {
  gearDeployments: GEAR_DEPLOYMENTS.length,
  standardDeployments: GEAR_DEPLOYMENTS.filter(
    (deployment) =>
      deployment.markerType === "standard-deployment",
  ).length,
  goldStarDeployments: GEAR_DEPLOYMENTS.filter(
    (deployment) =>
      deployment.markerType === "gold-star-fafo",
  ).length,
  memberLocations: MEMBER_LOCATIONS.length,
  countriesReached: new Set([
    ...GEAR_DEPLOYMENTS.map((deployment) => deployment.country),
    ...MEMBER_LOCATIONS.map((member) => member.country),
  ]).size,
};
