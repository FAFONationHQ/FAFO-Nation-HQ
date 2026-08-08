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

export type DeploymentTimelineQuery = {
  publishedAfter?: string;
  cursor?: string;
  limit: number;
};

export interface DeploymentTimelineSource {
  listTimelineCandidates(query: DeploymentTimelineQuery): Promise<readonly PrivateDeploymentRecord[]>;
}

export type PublicDeploymentParityResult =
  | { matches: true }
  | { matches: false; differingIds: readonly string[]; statisticsMatch: boolean };

export function comparePublicDeploymentSnapshots(
  expected: PublicDeploymentSnapshot,
  candidate: PublicDeploymentSnapshot,
): PublicDeploymentParityResult {
  const serialize = (deployment: PublicDeployment) => JSON.stringify(deployment);
  const expectedById = new Map(expected.all.map((deployment) => [deployment.id, serialize(deployment)]));
  const candidateById = new Map(candidate.all.map((deployment) => [deployment.id, serialize(deployment)]));
  const differingIds = [...new Set([...expectedById.keys(), ...candidateById.keys()])]
    .filter((id) => expectedById.get(id) !== candidateById.get(id))
    .sort();
  const statisticsMatch = JSON.stringify(expected.statistics) === JSON.stringify(candidate.statistics);
  return differingIds.length === 0 && statisticsMatch
    ? { matches: true }
    : { matches: false, differingIds, statisticsMatch };
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
