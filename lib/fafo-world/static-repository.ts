import type { PublicDeploymentRepository } from "@/lib/fafo-world/repository";
import {
  STATIC_GEAR_DEPLOYMENTS,
  STATIC_MEMBER_LOCATIONS,
} from "@/lib/fafo-world/static-data";

export const staticFafoWorldRepository: PublicDeploymentRepository = {
  listAll: () => [...STATIC_GEAR_DEPLOYMENTS, ...STATIC_MEMBER_LOCATIONS],
  listGearDeployments: () => STATIC_GEAR_DEPLOYMENTS,
  listMemberLocations: () => STATIC_MEMBER_LOCATIONS,
  statistics: () => ({
    gearDeployments: STATIC_GEAR_DEPLOYMENTS.length,
    standardDeployments: STATIC_GEAR_DEPLOYMENTS.filter(
      (deployment) => deployment.markerType === "standard-deployment",
    ).length,
    goldStarDeployments: STATIC_GEAR_DEPLOYMENTS.filter(
      (deployment) => deployment.markerType === "gold-star-fafo",
    ).length,
    memberLocations: STATIC_MEMBER_LOCATIONS.length,
    countriesReached: new Set([
      ...STATIC_GEAR_DEPLOYMENTS.map((deployment) => deployment.country),
      ...STATIC_MEMBER_LOCATIONS.map((member) => member.country),
    ]).size,
  }),
};
