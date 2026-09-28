// ── Core Types ────────────────────────────────────────────────────────────────

export type AssetType = 'Road' | 'Building' | 'Bridge' | 'Component';
export type ConditionLabel = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
export type CriticalityLabel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PriorityLabel = 'Low' | 'Medium' | 'High' | 'Critical';
export type DefectSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type WorkOrderPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type WorkOrderStatus = 'Reported' | 'Reviewed' | 'Assigned' | 'InProgress' | 'Completed' | 'Verified' | 'Closed';
export type DefectStatus = 'Reported' | 'Reviewed' | 'Assigned' | 'InProgress' | 'Resolved' | 'Verified' | 'Closed';
export type ProjectStatus = 'Proposed' | 'Approved' | 'Tendering' | 'UnderConstruction' | 'Delayed' | 'Completed' | 'Closed';
export type InspectionType = 'Routine' | 'Structural' | 'Fire Safety' | 'Electrical' | 'Annual' | 'Emergency';

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  type: AssetType;
  subtype?: string;
  district: string;
  division?: string;
  condition: number;
  conditionLabel: ConditionLabel;
  criticality?: number;
  criticalityLabel?: CriticalityLabel;
  lifecycleStatus?: string;
  lat?: number;
  lng?: number;
  priorityScore?: number;
  priorityLabel?: PriorityLabel;
  riskScore?: number;
  overdueMaintenanceDays?: number;
  assignedEngineer?: string;
  assignedEngineerName?: string;
  lastInspection?: string;
  nextInspection?: string;
  constructionYear?: number;
  commissionedDate?: string;
  currentValue?: number;
  department?: string;
  owner?: string;
  description?: string;
  // Road-specific
  length?: number;
  width?: number;
  lanes?: number;
  surfaceType?: string;
  trafficCategory?: string;
  roadType?: string;
  roadNumber?: string;
  // Building-specific
  buildingType?: string;
  floors?: number;
  builtUpArea?: number;
  capacity?: number;
  occupancy?: string;
  // Bridge-specific
  bridgeType?: string;
  // Relations (when fetched via /:id)
  inspections?: Inspection[];
  defects?: Defect[];
  workOrders?: WorkOrder[];
  projects?: Project[];
  maintenance?: MaintenanceRecord[];
  documents?: Document[];
  lifecycle?: LifecycleEvent[];
}

export interface PriorityExplanationItem {
  factor: string;
  value: string;
  contribution: number;
  status: 'critical' | 'warning' | 'good' | 'neutral';
}

export interface PriorityResult {
  score: number;
  label: PriorityLabel;
  explanation: PriorityExplanationItem[];
  recommendedAction: string;
  reasons: string[];
  asset?: Partial<Asset>;
  evidence?: {
    lastInspection?: string;
    openDefects: number;
    criticalDefects: number;
    overdueMaintenanceDays: number;
    estimatedRepairCost: number;
    previousMaintenanceMonthsAgo?: number;
  };
}

export interface Inspection {
  id: string;
  assetId: string;
  assetName?: string;
  assetType?: string;
  district?: string;
  date: string;
  inspector: string;
  inspectorName?: string;
  type: InspectionType;
  status: string;
  conditionScoreBefore?: number;
  conditionScoreAfter?: number;
  severityRating: string;
  findings?: string;
  recommendations?: string;
  defectsFound?: string[];
  items?: InspectionItem[];
}

export interface InspectionItem {
  id?: string;
  category: string;
  rating: number;
  severity: string;
  remarks?: string;
}

export interface Defect {
  id: string;
  assetId: string;
  assetName?: string;
  assetType?: string;
  district?: string;
  inspectionId?: string;
  severity: DefectSeverity;
  description: string;
  status: DefectStatus;
  reportedBy?: string;
  reportedByName?: string;
  assignedTo?: string | null;
  assignedToName?: string | null;
  workOrderId?: string | null;
  createdDate?: string;
  dueDate?: string;
  sla?: string;
  slaDaysRemaining?: number;
}

export interface WorkOrder {
  id: string;
  assetId: string;
  asset?: Partial<Asset>;
  projectId?: string | null;
  problem: string;
  description?: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  type?: string;
  assignedEngineer?: string;
  assignedEngineerName?: string;
  contractor?: string;
  contractorName?: string;
  estimatedCost?: number;
  approvedCost?: number | null;
  spentSoFar?: number;
  startDate?: string | null;
  expectedCompletion?: string;
  createdDate?: string;
  createdBy?: string;
  defectIds?: string[];
  district?: string;
  division?: string;
  approvalStatus?: string;
  approvalChain?: ApprovalStep[];
  defects?: Defect[];
  documents?: Document[];
  audit?: AuditLog[];
}

export interface ApprovalStep {
  role: string;
  user: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  date?: string | null;
  remarks?: string | null;
}

export interface Project {
  id: string;
  name: string;
  assetId?: string;
  district: string;
  division?: string;
  contractor: string;
  contractorName?: string;
  budget: number;
  spent: number;
  committed?: number;
  progress: number;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  milestones?: ProjectMilestone[];
  description?: string;
  engineer?: string;
  engineerName?: string;
  budgetUtilization?: number;
}

export interface ProjectMilestone {
  name: string;
  progress: number;
  completedDate?: string;
  expectedDate?: string;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  department?: string;
  district?: string;
  division?: string;
  email?: string;
  phone?: string;
  workload?: number;
  status?: string;
  skills?: string[];
  joinDate?: string;
  currentAssignment?: string | null;
  assignments?: WorkOrder[];
}

export interface Contractor {
  id: string;
  name: string;
  regNo?: string;
  activeContracts?: number;
  totalContractValue?: number;
  projectsCompleted?: number;
  delayedProjects?: number;
  defectsRecorded?: number;
  inspectionPassRate?: number;
  status?: string;
  district?: string;
  paymentStatus?: string;
  projects?: Project[];
}

export interface Budget {
  id: string;
  name: string;
  financialYear?: string;
  allocated: number;
  committed: number;
  spent: number;
  remaining: number;
  utilization?: number;
  heads?: BudgetHead[];
}

export interface BudgetHead {
  id: string;
  name: string;
  district?: string;
  allocated: number;
  committed: number;
  spent: number;
  remaining: number;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName?: string;
  assetType?: string;
  district?: string;
  type: string;
  description?: string;
  status: string;
  scheduledDate?: string;
  completedDate?: string | null;
  cost?: number;
  contractor?: string | null;
  engineer?: string;
}

export interface LifecycleEvent {
  id: string;
  assetId: string;
  date: string;
  event: string;
  type: string;
  description: string;
  user?: string;
  role?: string;
}

export interface Document {
  id: string;
  entityType: string;
  entityId: string;
  name: string;
  type: string;
  size?: string;
  uploadedBy?: string;
  uploadedDate?: string;
  version?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  description?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  entityId?: string | null;
  entityType?: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  district?: string;
  division?: string;
  orgScope?: string;
  employeeId?: string;
  designation?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Dashboard Types ────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalAssets: number;
  activeProjects: number;
  annualBudget: number;
  budgetUtilization: number;
  criticalAssets: number;
  openDefects: number;
  openWorkOrders: number;
  overdueInspections: number;
  poorConditionAssets: number;
  budgetSpent: number;
  budgetRemaining: number;
}

export interface SystemInsight {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action?: string;
  actionLink?: string;
}
