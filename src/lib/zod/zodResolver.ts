import { z } from "zod";

export type MantineZodResolverOptions = {
  pathSeparator?: string;
  duplicateStrategy?: "first" | "all";
  multiMessageJoiner?: string;
  formLevelKey?: string;
};

type MantineErrors = Record<string, string>;
type ZodIssue = z.core.$ZodIssue;

function issuesToMantineErrors(
  issues: ReadonlyArray<ZodIssue>,
  {
    pathSeparator = ".",
    duplicateStrategy = "first",
    multiMessageJoiner = " | ",
    formLevelKey = "_form",
  }: MantineZodResolverOptions
): MantineErrors {
  const out: MantineErrors = {};

  const segToString = (seg: PropertyKey): string =>
    typeof seg === "symbol" ? seg.description ?? seg.toString() : String(seg);

  const joinPath = (path: ReadonlyArray<PropertyKey>): string =>
    path.length === 0 ? formLevelKey : path.map(segToString).join(pathSeparator);

  for (const issue of issues) {
    const key = joinPath(issue.path);
    const msg = issue.message || "Invalid value";

    if (!(key in out)) out[key] = msg;
    else if (duplicateStrategy === "all") out[key] = `${out[key]}${multiMessageJoiner}${msg}`;
  }
  return out;
}

export function mantineZodResolver<S extends z.ZodTypeAny>(
  schema: S,
  opts: MantineZodResolverOptions = {}
) {
  return (values: unknown): MantineErrors => {
    const parsed = schema.safeParse(values);
    if (parsed.success) return {};
    return issuesToMantineErrors(parsed.error.issues as ReadonlyArray<ZodIssue>, opts);
  };
}

export function mantineZodResolverAsync<S extends z.ZodTypeAny>(
  schema: S,
  opts: MantineZodResolverOptions = {}
) {
  return async (values: unknown): Promise<MantineErrors> => {
    const parsed = await schema.safeParseAsync(values);
    if (parsed.success) return {};
    return issuesToMantineErrors(parsed.error.issues as ReadonlyArray<ZodIssue>, opts);
  };
}
