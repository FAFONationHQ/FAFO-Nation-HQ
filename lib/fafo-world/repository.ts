import type {
  PublicDeployment,
  PublicGearDeployment,
  PublicMemberLocation,
} from "@/lib/fafo-world/domain";

export type FafoWorldStatistics = {
  gearDeployments: number;
  standardDeployments: number;
  goldStarDeployments: number;
  memberLocations: number;
  countriesReached: number;
};

export interface PublicDeploymentRepository {
  listAll(): readonly PublicDeployment[];
  listGearDeployments(): readonly PublicGearDeployment[];
  listMemberLocations(): readonly PublicMemberLocation[];
  statistics(): FafoWorldStatistics;
}
