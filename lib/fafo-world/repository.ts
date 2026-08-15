import type {
  PublicDeployment,
  PublicGearDeployment,
  PublicMemberLocation,
} from "./domain.ts";

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
