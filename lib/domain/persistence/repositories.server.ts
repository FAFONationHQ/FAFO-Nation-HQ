import "server-only";

import { prisma } from "../../prisma.ts";
import {
  PrismaConsentDecisionRepository,
  PrismaMemberIdentityRepository,
  PrismaMemberProfileRepository,
} from "./prisma-member-repositories.server.ts";

export const memberIdentityRepository = new PrismaMemberIdentityRepository(prisma);
export const memberProfileRepository = new PrismaMemberProfileRepository(prisma);
export const consentDecisionRepository = new PrismaConsentDecisionRepository(prisma);
