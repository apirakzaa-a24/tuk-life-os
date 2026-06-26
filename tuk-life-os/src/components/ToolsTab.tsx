import React from 'react';
import KnowledgeBase from './KnowledgeBase';
import BackupManager from './BackupManager';
import AuditLogViewer from './AuditLogViewer';
import DataHealthChecker from './DataHealthChecker';
import RepairCenter from './RepairCenter';

interface ToolsTabProps {
  language: 'th' | 'en';
}

const ToolsTab = React.memo(({ language }: ToolsTabProps) => {
  return (
    <div className="space-y-6">
      <KnowledgeBase />
      <BackupManager language={language} />
      <AuditLogViewer language={language} />
      <DataHealthChecker language={language} />
      <RepairCenter language={language} />
    </div>
  );
});

export default ToolsTab;
