export interface Store {
  users: Map<string, any>;
  employees: Map<string, any>;
  contractors: Map<string, any>;
  assets: Map<string, any>;
  projects: Map<string, any>;
  inspections: Map<string, any>;
  defects: Map<string, any>;
  workOrders: Map<string, any>;
  budgets: Map<string, any>;
  maintenance: Map<string, any>;
  lifecycleEvents: Map<string, any>;
  documents: Map<string, any>;
  auditLogs: Map<string, any>;
  notifications: Map<string, any>;
  monthlyExpenditure: any[];
}

export const db: Store = {
  users: new Map(),
  employees: new Map(),
  contractors: new Map(),
  assets: new Map(),
  projects: new Map(),
  inspections: new Map(),
  defects: new Map(),
  workOrders: new Map(),
  budgets: new Map(),
  maintenance: new Map(),
  lifecycleEvents: new Map(),
  documents: new Map(),
  auditLogs: new Map(),
  notifications: new Map(),
  monthlyExpenditure: [],
};
