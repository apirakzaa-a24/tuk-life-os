
export interface AuditLogEntry {
  timestamp: string;
  action: string;
  module: string;
  recordId: string;
  status: 'SUCCESS' | 'FAILURE';
  description: string;
}

export const logAudit = (action: string, module: string, recordId: string, status: 'SUCCESS' | 'FAILURE', description: string) => {
  const logEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    action,
    module,
    recordId,
    status,
    description
  };
  
  const existingLogs = JSON.parse(localStorage.getItem('tuk_life_audit_logs') || '[]');
  existingLogs.push(logEntry);
  // Keep last 100 logs
  if (existingLogs.length > 100) existingLogs.shift();
  
  localStorage.setItem('tuk_life_audit_logs', JSON.stringify(existingLogs));
  console.log('[AUDIT]', logEntry);
};
