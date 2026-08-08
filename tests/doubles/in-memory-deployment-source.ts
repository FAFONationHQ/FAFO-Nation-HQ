import type { PrivateDeploymentRecord } from "../../lib/fafo-world/domain.ts";
import type { PrivateDeploymentCandidateSource } from "../../lib/fafo-world/database-adapter.ts";

export class InMemoryDeploymentCandidateSource implements PrivateDeploymentCandidateSource {
  constructor(private readonly candidates: readonly PrivateDeploymentRecord[]) {}

  async listPublicationCandidates(): Promise<readonly PrivateDeploymentRecord[]> {
    return structuredClone(this.candidates);
  }
}
