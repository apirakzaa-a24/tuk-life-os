import { APP_VERSION } from '../utils/version';
export default function VersionBadge(){return <div className="version-badge"><b>{APP_VERSION.name}</b><span>Version {APP_VERSION.version}</span><span>{APP_VERSION.sprint}</span><span>Build {APP_VERSION.build}</span></div>}
