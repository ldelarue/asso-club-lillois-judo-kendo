interface ReferenceValidationOptions {
  source: string;
  values: string[];
  knownValues: string[];
  requireAll?: boolean;
}

export function validateContentReferences({
  source,
  values,
  knownValues,
  requireAll = false,
}: ReferenceValidationOptions) {
  const known = new Set(knownValues);
  const unknown = [...new Set(values.filter((value) => !known.has(value)))];
  const duplicates = [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
  const referenced = new Set(values);
  const missing = requireAll
    ? knownValues.filter((value) => !referenced.has(value))
    : [];

  const problems = [
    unknown.length > 0 ? `références inconnues : ${unknown.join(", ")}` : "",
    duplicates.length > 0 ? `références dupliquées : ${duplicates.join(", ")}` : "",
    missing.length > 0 ? `références manquantes : ${missing.join(", ")}` : "",
  ].filter(Boolean);

  if (problems.length > 0) {
    throw new Error(`${source} — ${problems.join(" ; ")}`);
  }
}