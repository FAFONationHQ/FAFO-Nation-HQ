import "server-only";

import { prisma } from "../../prisma.ts";
import {
  createPrismaMemberRepositorySet,
  PrismaMemberRepositoryUnitOfWork,
} from "./prisma-member-repositories.server.ts";

const repositories = createPrismaMemberRepositorySet(prisma);

export const memberIdentityRepository = repositories.identities;
export const memberProfileRepository = repositories.profiles;
export const consentDecisionRepository = repositories.consents;
export const memberRepositoryUnitOfWork = new PrismaMemberRepositoryUnitOfWork(prisma);
