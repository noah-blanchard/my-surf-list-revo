// src/utils/mantineZodResolver.ts
import type { ZodSchema, ZodIssue } from "zod";

/**
 * Options pour le resolver.
 */
export type MantineZodResolverOptions = {
  /**
   * Joindre les segments du path avec ce séparateur.
   * Mantine supporte la notation à points pour les champs imbriqués.
   * @default "."
   */
  pathSeparator?: string;

  /**
   * Quand plusieurs erreurs existent pour le même champ :
   * - "first": garder seulement le premier message
   * - "all": concaténer tous les messages avec `multiMessageJoiner`
   * @default "first"
   */
  duplicateStrategy?: "first" | "all";

  /**
   * Séparateur entre messages quand duplicateStrategy="all"
   * @default " | "
   */
  multiMessageJoiner?: string;

  /**
   * Clé utilisée pour les erreurs au niveau formulaire (path vide).
   * @default "_form"
   */
  formLevelKey?: string;

  /**
   * Forcer l’usage de safeParseAsync (utile si vous avez des refinements async)
   * @default false (auto: utilise async si schema est async, sinon sync)
   */
  forceAsync?: boolean;
};

type MantineErrors = Record<string, string>;

/**
 * Convertit une liste d'issues Zod en objet d'erreurs Mantine.
 */
function issuesToMantineErrors(
  issues: ZodIssue[],
  {
    pathSeparator = ".",
    duplicateStrategy = "first",
    multiMessageJoiner = " | ",
    formLevelKey = "_form",
  }: MantineZodResolverOptions
): MantineErrors {
  const out: MantineErrors = {};

  const joinPath = (path: (string | number)[]) =>
    path.length === 0 ? formLevelKey : path.map(String).join(pathSeparator);

  for (const issue of issues) {
    const key = joinPath(issue.path);
    const msg = issue.message || "Invalid value";

    if (!(key in out)) {
      out[key] = msg;
    } else if (duplicateStrategy === "all") {
      // concatène si on veut garder tous les messages pour le même champ
      out[key] = `${out[key]}${multiMessageJoiner}${msg}`;
    } // sinon "first" -> on ignore les suivantes
  }

  return out;
}

/**
 * Resolver Mantine <-> Zod robuste.
 *
 * Utilisation:
 *   const form = useForm<T>({
 *     initialValues: ...,
 *     validate: mantineZodResolver(schema),
 *     validateInputOnBlur: true,
 *     validateInputOnChange: true,
 *   });
 */
export function mantineZodResolver<T>(
  schema: ZodSchema<T>,
  opts: MantineZodResolverOptions = {}
) {
  // Mantine attend une fonction: (values) => Record<string, string>
  return (values: unknown) => {
    // On tente d'abord en sync, puis on “rattrape” les schemas async proprement.
    try {
      const parsed = (schema as any).safeParse
        ? (schema as any).safeParse(values)
        : { success: true, data: values };

      if (parsed.success) return {};
      // Zod v3 et v4 exposent toujours `issues` (pas "errors")
      const { issues } = parsed.error;
      return issuesToMantineErrors(issues, opts);
    } catch {
      // Si le schema a des refinements async, safeParse va lancer (dans certains contextes),
      // on fallback en "bloquant" le submit avec une erreur formulaire claire.
      return {
        [opts.formLevelKey ?? "_form"]:
          "Validation failed (async schema detected). Use mantineZodResolverAsync for async refinements.",
      };
    }
  };
}

/**
 * Variante async si vous utilisez des refinements asynchrones (safeParseAsync).
 *
 * Utilisation:
 *   const form = useForm<T>({
 *     initialValues: ...,
 *     validate: async (values) => await mantineZodResolverAsync(schema)(values),
 *   });
 */
export function mantineZodResolverAsync<T>(
  schema: ZodSchema<T>,
  opts: MantineZodResolverOptions = {}
) {
  return async (values: unknown) => {
    // utilise safeParseAsync pour supporter les refinements async / effets IO
    const parsed = (schema as any).safeParseAsync
      ? await (schema as any).safeParseAsync(values)
      : { success: true, data: values };

    if (parsed.success) return {};
    const { issues } = parsed.error;
    return issuesToMantineErrors(issues, opts);
  };
}
