export const stripCodeFences = (text: string) => {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  if (fence?.[1]) return fence[1].trim();
  return trimmed;
};

export const tryParseJsonObject = (text: string): { ok: true; value: unknown } | { ok: false; error: string } => {
  try {
    const cleaned = stripCodeFences(text);
    return { ok: true, value: JSON.parse(cleaned) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid JSON" };
  }
};
