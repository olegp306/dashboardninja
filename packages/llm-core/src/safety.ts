export const clampText = (text: string, maxChars: number) => {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1))}…`;
};

export const sanitizeForLogs = (text: string, maxChars: number) => {
  // Lightweight redaction + truncation (avoid shipping huge blobs into UI logs).
  const withoutKeys = text.replace(/\bsk-[A-Za-z0-9]{10,}\b/g, "[redacted]");
  return clampText(withoutKeys, maxChars);
};
