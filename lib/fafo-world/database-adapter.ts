import {
  projectPublicDeployment,
  type PrivateDeploymentRecord,
  type PublicDeployment,
  type PublicGearDeployment,
  type PublicMemberLocation,
} from "./domain.ts";
import type { FafoWorldStatistics } from "./repository.ts";

export interface PrivateDeploymentCandidateSource {
  listPublicationCandidates(): Promise<readonly PrivateDeploymentRecord[]>;
}

export type PublicDeploymentSnapshot = {
  all: readonly PublicDeployment[];
  gearDeployments: readonly PublicGearDeployment[];
  memberLocations: readonly PublicMemberLocation[];
  statistics: FafoWorldStatistics;
};

export interface AsyncPublicDeploymentRepository {
  loadSnapshot(): Promise<PublicDeploymentSnapshot>;
}

/**
 * Database preparation adapter. The future Prisma source owns its private
 * select; this adapter owns fail-closed public projection and DTO assembly.
 */
export class ProjectingPublicDeploymentRepository implements AsyncPublicDeploymentRepository {
  constructor(private readonly source: PrivateDeploymentCandidateSource) {}

  async loadSnapshot(): Promise<PublicDeploymentSnapshot> {
    const all = (await this.source.listPublicationCandidates())
      .map(projectPublicDeployment)
      .filter((deployment): deployment is PublicDeployment => deployment !== null);
    const gearDeployments = all.filter(
      (deployment): deployment is PublicGearDeployment => deployment.category !== "MEMBER_LOCATION",
    );
    const memberLocations = all.filter(
      (deployment): deployment is PublicMemberLocation => deployment.category === "MEMBER_LOCATION",
    );

    return {
      all,
      gearDeployments,
      memberLocations,
      statistics: {
        gearDeployments: gearDeployments.length,
        standardDeployments: gearDeployments.filter(
          (deployment) => deployment.category === "STANDARD_GEAR",
        ).length,
        goldStarDeployments: gearDeployments.filter(
          (deployment) => deployment.category === "GOLD_STAR_CUSTOM",
        ).length,
        memberLocations: memberLocations.length,
        countriesReached: new Set(all.map((deployment) => deployment.country)).size,
      },
    };
  }
}
