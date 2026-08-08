import type {
  PublicGearDeployment,
  PublicMemberLocation,
} from "@/lib/fafo-world/domain";
import { staticFafoWorldRepository } from "@/lib/fafo-world/static-repository";

export type GearDeploymentMarkerType = PublicGearDeployment["markerType"];
export type MemberLocationMarkerType = PublicMemberLocation["markerType"];
export type GearDeployment = PublicGearDeployment;
export type MemberLocation = PublicMemberLocation;

export const GEAR_DEPLOYMENTS =
  staticFafoWorldRepository.listGearDeployments();
export const MEMBER_LOCATIONS =
  staticFafoWorldRepository.listMemberLocations();
export const FAFO_WORLD_STATS =
  staticFafoWorldRepository.statistics();
