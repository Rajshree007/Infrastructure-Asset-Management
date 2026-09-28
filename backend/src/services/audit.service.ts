import { db } from '../database/store';
import { v4 as uuidv4 } from 'uuid';

interface AuditEntry {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  oldValue: any;
  newValue: any;
  reason: string;
  ipAddress: string;
}

export function logAudit(entry: AuditEntry) {
  const id = `AUD-${uuidv4().slice(0, 8).toUpperCase()}`;
  db.auditLogs.set(id, {
    id,
    timestamp: new Date().toISOString(),
    ...entry,
  });
}
