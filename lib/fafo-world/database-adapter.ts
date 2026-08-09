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

export type DeploymentTimelineCursor = {
  publishedAt: string;
  deploymentId: string;
};

export type DeploymentTimelineQueryInput = {
  publishedAfter?: string;
  cursor?: DeploymentTimelineCursor;
  limit?: number;
};

export type DeploymentTimelineQuery = {
  publishedAfter?: string;
  cursor?: DeploymentTimelineCursor;
  limit: number;
};

export interface DeploymentTimelineSource {
  listTimelineCandidates(query: DeploymentTimelineQuery): Promise<readonly PrivateDeploymentRecord[]>;
}

export type PublicDeploymentTimelinePage = {
  items: readonly PublicDeployment[];
  nextCursor: DeploymentTimelineCursor | null;
};

export class DeploymentTimelineQueryError extends Error {
  constructor() {
    super("Invalid deployment timeline query.");
    this.name = "DeploymentTimelineQueryError";
  }
}

function canonicalTimestamp(value: string): boolean {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

function safeDeploymentId(value: string): boolean {
  return value.length > 0 &&
    value === value.trim() &&
    value.length <= 200 &&
    !/\p{Cc}/u.test(value);
}

export async function loadPublicDeploymentTimeline(
  source: DeploymentTimelineSource,
  input: DeploymentTimelineQueryInput = {},
): Promise<PublicDeploymentTimelinePage> {
  const limit = input.limit ?? 50;
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    (input.publishedAfter !== undefined && !canonicalTimestamp(input.publishedAfter)) ||
    (input.cursor !== undefined && (
      !canonicalTimestamp(input.cursor.publishedAt) ||
      !safeDeploymentId(input.cursor.deploymentId)
    ))
  ) throw new DeploymentTimelineQueryError();

  const query: DeploymentTimelineQuery = Object.freeze({
    publishedAfter: input.publishedAfter,
    cursor: input.cursor ? Object.freeze({ ...input.cursor }) : undefined,
    limit,
  });
  const projected = (await source.listTimelineCandidates(query))
    .map(projectPublicDeployment)
    .filter((deployment): deployment is PublicDeployment => deployment !== null)
    .filter((deployment) => {
      const publishedAt = deployment.timeline.publishedAt!;
      if (query.publishedAfter && publishedAt <= query.publishedAfter) return false;
      if (!query.cursor) return true;
      return publishedAt < query.cursor.publishedAt ||
        (publishedAt === query.cursor.publishedAt && deployment.id < query.cursor.deploymentId);
    });
  const counts = new Map<string, number>();
  for (const deployment of projected) counts.set(deployment.id, (counts.get(deployment.id) ?? 0) + 1);
  const ordered = projected
    .filter((deployment) => counts.get(deployment.id) === 1)
    .sort((left, right) =>
      right.timeline.publishedAt!.localeCompare(left.timeline.publishedAt!) ||
      right.id.localeCompare(left.id));
  const items = ordered.slice(0, limit);
  const last = items.at(-1);
  return {
    items,
    nextCursor: ordered.length > limit && last
      ? { publishedAt: last.timeline.publishedAt!, deploymentId: last.id }
      : null,
  };
}

export type PublicDeploymentParityResult =
  | { matches: true }
  | { matches: false; differingIds: readonly string[]; statisticsMatch: boolean };

export function comparePublicDeploymentSnapshots(
  expected: PublicDeploymentSnapshot,
  candidate: PublicDeploymentSnapshot,
): PublicDeploymentParityResult {
  const serialize = (deployment: PublicDeployment) => JSON.stringify(deployment);
  const index = (deployments: readonly PublicDeployment[]) => {
    const byId = new Map<string, string>();
    const duplicates = new Set<string>();
    for (const deployment of deployments) {
      if (byId.has(deployment.id)) duplicates.add(deployment.id);
      byId.set(deployment.id, serialize(deployment));
    }
    return { byId, duplicates };
  };
  const expectedIndex = index(expected.all);
  const candidateIndex = index(candidate.all);
  const differingIds = [...new Set([
    ...expectedIndex.byId.keys(),
    ...candidateIndex.byId.keys(),
    ...expectedIndex.duplicates,
    ...candidateIndex.duplicates,
  ])]
    .filter((id) =>
      expectedIndex.byId.get(id) !== candidateIndex.byId.get(id) ||
      expectedIndex.duplicates.has(id) ||
      candidateIndex.duplicates.has(id))
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
    const projected = (await this.source.listPublicationCandidates())
      .map(projectPublicDeployment)
      .filter((deployment): deployment is PublicDeployment => deployment !== null);
    const counts = new Map<string, number>();
    for (const deployment of projected) counts.set(deployment.id, (counts.get(deployment.id) ?? 0) + 1);
    const all = projected
      .filter((deployment) => counts.get(deployment.id) === 1)
      .sort((left, right) => left.id.localeCompare(right.id));
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
