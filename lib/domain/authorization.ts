export const PERMISSIONS = [
  "member.profile.read-self",
  "member.profile.write-self",
  "member.preferences.write-self",
  "deployment.review",
  "deployment.publish",
  "media.publish",
  "community.moderate",
  "custom-shop.operate",
  "catalog.operate",
  "order.view",
  "refund.propose",
  "refund.execute",
  "cares.publish",
  "system.administer",
  "permission.manage",
  "audit.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSION_SETS = {
  MEMBER: [
    "member.profile.read-self",
    "member.profile.write-self",
    "member.preferences.write-self",
  ],
  DEPLOYMENT_REVIEWER: ["deployment.review"],
  DEPLOYMENT_PUBLISHER: ["deployment.review", "deployment.publish"],
  MEDIA_PUBLISHER: ["media.publish"],
  COMMUNITY_MODERATOR: ["community.moderate"],
  CUSTOM_SHOP_OPERATOR: ["custom-shop.operate"],
  CATALOG_OPERATOR: ["catalog.operate"],
  ORDER_SUPPORT: ["order.view"],
  REFUND_OPERATOR: ["order.view", "refund.propose", "refund.execute"],
  CARES_PUBLISHER: ["cares.publish"],
  SYSTEM_OPERATOR: ["system.administer", "permission.manage", "audit.view"],
  OWNER_OPERATOR: [...PERMISSIONS],
} as const satisfies Record<string, readonly Permission[]>;

export type RoleName = keyof typeof ROLE_PERMISSION_SETS;

export function isRoleName(value: string): value is RoleName {
  return Object.hasOwn(ROLE_PERMISSION_SETS, value);
}

export type AuthorizationSubject = {
  subjectId: string;
  permissions: readonly string[];
};

export type AuthorizationDecision =
  | { allowed: true; permission: Permission }
  | { allowed: false; permission: Permission; reason: "MISSING_PERMISSION" };

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}

export function permissionsForRoles(roles: readonly string[]): Permission[] {
  return [
    ...new Set(
      roles.filter(isRoleName).flatMap((role) => ROLE_PERMISSION_SETS[role]),
    ),
  ];
}

export function authorize(
  subject: AuthorizationSubject | null | undefined,
  permission: Permission,
): AuthorizationDecision {
  const allowed = subject?.permissions.some(
    (candidate) => isPermission(candidate) && candidate === permission,
  ) ?? false;

  return allowed
    ? { allowed: true, permission }
    : { allowed: false, permission, reason: "MISSING_PERMISSION" };
}

export function hasEveryPermission(
  subject: AuthorizationSubject | null | undefined,
  required: readonly Permission[],
): boolean {
  return required.every((permission) => authorize(subject, permission).allowed);
}
