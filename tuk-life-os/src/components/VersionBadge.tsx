import { appVersion } from '../data/mockData';

export function VersionBadge() {
  return (
    <div className="versionBadge" title={appVersion.codename}>
      <strong>{appVersion.version}</strong>
      <span>{appVersion.sprint}</span>
      <small>Build {appVersion.build}</small>
    </div>
  );
}
