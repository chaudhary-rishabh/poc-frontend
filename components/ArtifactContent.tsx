import type { BuildPrompts, DocA, DocB, DocC, DocType } from "@/lib/types";
import DocARenderer from "./docs/DocARenderer";
import DocBRenderer from "./docs/DocBRenderer";
import DocCRenderer from "./docs/DocCRenderer";
import BuildPromptsRenderer from "./docs/BuildPromptsRenderer";

export function pinPocCdnVersions(html: string): string {
  return html
    .replace(
      /https:\/\/unpkg\.com\/@babel\/standalone(?:@[^/"'\s]+)?\/babel(?:\.min)?\.js/g,
      "https://unpkg.com/@babel/standalone@7/babel.min.js"
    )
    .replace(
      /https:\/\/unpkg\.com\/react(?:@[^/"'\s]+)?\/umd\/react\.development\.js/g,
      "https://unpkg.com/react@18/umd/react.development.js"
    )
    .replace(
      /https:\/\/unpkg\.com\/react-dom(?:@[^/"'\s]+)?\/umd\/react-dom\.development\.js/g,
      "https://unpkg.com/react-dom@18/umd/react-dom.development.js"
    );
}

interface ArtifactContentProps {
  type: DocType;
  data: DocA | DocB | DocC | BuildPrompts | string;
}

export default function ArtifactContent({ type, data }: ArtifactContentProps) {
  if (type === "poc") {
    const html = data as string;
    return (
      <iframe
        key={html.length}
        srcDoc={pinPocCdnVersions(html)}
        title="Generated POC preview"
        className="block h-full min-h-[80vh] w-full border-0 bg-white"
        sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
      />
    );
  }

  return (
    <div className="flex justify-center px-6 py-8">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl">
        {type === "docA" && <DocARenderer doc={data as DocA} />}
        {type === "docB" && <DocBRenderer doc={data as DocB} />}
        {type === "docC" && <DocCRenderer doc={data as DocC} />}
        {type === "buildPrompts" && <BuildPromptsRenderer doc={data as BuildPrompts} />}
      </div>
    </div>
  );
}
