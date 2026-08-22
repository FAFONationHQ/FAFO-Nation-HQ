export type ModuleId = string;
export type CapabilityId = string;

export type FoundationModuleDefinition<TConfiguration = unknown> = Readonly<{
  id: ModuleId;
  enabled: boolean;
  requiredModules?: readonly ModuleId[];
  optionalModules?: readonly ModuleId[];
  capabilities?: readonly CapabilityId[];
  configuration?: TConfiguration;
}>;

export type ResolvedFoundationModules = Readonly<{
  enabled: ReadonlyMap<ModuleId, FoundationModuleDefinition>;
  capabilities: ReadonlySet<CapabilityId>;
}>;

export class ModuleCompositionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleCompositionError";
  }
}

/** Static application composition validation, not a runtime package loader. */
export function resolveFoundationModules(
  definitions: readonly FoundationModuleDefinition[],
): ResolvedFoundationModules {
  const known = new Map<ModuleId, FoundationModuleDefinition>();

  for (const definition of definitions) {
    if (known.has(definition.id)) {
      throw new ModuleCompositionError(`Duplicate Foundation module: ${definition.id}`);
    }
    known.set(definition.id, definition);
  }

  const enabled = new Map([...known].filter(([, definition]) => definition.enabled));

  for (const definition of enabled.values()) {
    for (const dependency of definition.requiredModules ?? []) {
      if (!enabled.has(dependency)) {
        throw new ModuleCompositionError(
          `Enabled module ${definition.id} requires enabled module ${dependency}.`,
        );
      }
    }
  }

  return {
    enabled,
    capabilities: new Set(
      [...enabled.values()].flatMap((definition) => definition.capabilities ?? []),
    ),
  };
}

export function moduleIsEnabled(
  composition: ResolvedFoundationModules,
  moduleId: ModuleId,
): boolean {
  return composition.enabled.has(moduleId);
}

export function capabilityIsEnabled(
  composition: ResolvedFoundationModules,
  capability: CapabilityId,
): boolean {
  return composition.capabilities.has(capability);
}
