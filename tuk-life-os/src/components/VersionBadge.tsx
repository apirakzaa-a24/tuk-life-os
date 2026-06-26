import React from "react";
import { ShieldCheck } from "lucide-react";

export type BuildInfo = {
  app: string;
  version: string;
  sprint: string;
  buildDate: string;
  buildName: string;
  status: string;
};

export function VersionBadge({ build }: { build: BuildInfo }) {
  return (
    <div className="version-badge" title="System Version">
      <ShieldCheck size={16} />
      <div>
        <strong>{build.version}</strong>
        <span>{build.sprint} · {build.buildDate}</span>
      </div>
    </div>
  );
}
