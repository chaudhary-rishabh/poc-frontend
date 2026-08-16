import { pinPocCdnVersions } from "@/components/ArtifactContent";
import type { DocType } from "./types";

export function downloadArtifact(type: DocType, data: unknown, filenamePrefix: string) {
  const isPoc = type === "poc";
  const content = isPoc ? pinPocCdnVersions(data as string) : JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: isPoc ? "text/html" : "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenamePrefix}-${type}.${isPoc ? "html" : "json"}`;
  a.click();
  URL.revokeObjectURL(url);
}
