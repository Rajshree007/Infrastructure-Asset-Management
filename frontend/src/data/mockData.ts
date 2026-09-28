// Comprehensive mock data for offline/fallback mode
// This mirrors the API response format so the app works without the backend

import type { Asset, Project, Inspection, Defect, WorkOrder, Employee, Contractor, AuditLog, Notification } from '../types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'RD-GJ-1024', assetId: 'RD-GJ-1024',
    name: 'Ahmedabad Ring Road Section 4', type: 'Road', subtype: 'Highway',
    district: 'Ahmedabad', division: 'Central',
    condition: 38, conditionLabel: 'Poor', criticality: 3, criticalityLabel: 'High',
    lifecycleStatus: 'Operational', lat: 23.0225, lng: 72.5714,
    length: 12.4, width: 7.3, lanes: 4, surfaceType: 'Bituminous', trafficCategory: 'High',
    constructionYear: 2018, currentValue: 48000000, priorityScore: 91, riskScore: 87,
    assignedEngineerName: 'Priya Mehta', lastInspection: '2026-09-12', nextInspection: '2026-10-12',
    overdueMaintenanceDays: 45,
    description: 'Critical arterial road connecting Ahmedabad ring road network.',
  },
  {
    id: 'RD-GJ-0912', assetId: 'RD-GJ-0912',
    name: 'Gandhinagar-Ahmedabad Highway Connector', type: 'Road', subtype: 'State Road',
    district: 'Gandhinagar', division: 'North',
    condition: 52, conditionLabel: 'Fair', criticality: 3, criticalityLabel: 'High',
    lifecycleStatus: 'Operational', lat: 23.1111, lng: 72.5800,
    length: 8.5, lanes: 6, constructionYear: 2020, priorityScore: 82, riskScore: 78,
    overdueMaintenanceDays: 20,
  },
  {
    id: 'GB-018', assetId: 'GB-018',
    name: 'Government District Hospital Ahmedabad', type: 'Building', subtype: 'Hospital',
    district: 'Ahmedabad', division: 'Central',
    condition: 45, conditionLabel: 'Poor', criticality: 3, criticalityLabel: 'Critical',
    lifecycleStatus: 'Operational', lat: 23.0369, lng: 72.5596,
    buildingType: 'Hospital', floors: 5, builtUpArea: 8500, capacity: 450,
    occupancy: 'High', constructionYear: 1998, currentValue: 125000000,
    priorityScore: 94, riskScore: 92,
    overdueMaintenanceDays: 45,
    assignedEngineerName: 'Amit Shah',
  },
  {
    id: 'GB-024', assetId: 'GB-024',
    name: 'Government Primary School Gandhinagar', type: 'Building', subtype: 'School',
    district: 'Gandhinagar', division: 'North',
    condition: 55, conditionLabel: 'Fair', criticality: 2, criticalityLabel: 'High',
    lifecycleStatus: 'Operational', lat: 23.2156, lng: 72.6369,
    buildingType: 'School', constructionYear: 2005, priorityScore: 86, riskScore: 82,
    overdueMaintenanceDays: 43,
  },
  {
    id: 'BR-GJ-042', assetId: 'BR-GJ-042',
    name: 'Sabarmati River Major Bridge Ahmedabad', type: 'Bridge', subtype: 'Major Bridge',
    district: 'Ahmedabad', division: 'Central',
    condition: 35, conditionLabel: 'Poor', criticality: 3, criticalityLabel: 'Critical',
    lifecycleStatus: 'Operational', lat: 23.0435, lng: 72.5777,
    length: 320, width: 12.5, lanes: 4, constructionYear: 1985,
    priorityScore: 97, riskScore: 94,
    overdueMaintenanceDays: 78,
    currentValue: 220000000,
  },
];

// Add 20 more generic assets for table demo
const districts = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'];
const assetTypes = ['Road', 'Building', 'Bridge'] as const;
for (let i = 0; i < 20; i++) {
  const cond = 30 + Math.floor(Math.random() * 60);
  MOCK_ASSETS.push({
    id: `ASSET-${String(i + 100).padStart(4, '0')}`,
    assetId: `ASSET-${String(i + 100).padStart(4, '0')}`,
    name: `${districts[i % 5]} Infrastructure Asset ${i + 1}`,
    type: assetTypes[i % 3],
    district: districts[i % 5],
    division: ['Central', 'North', 'South', 'East', 'West'][i % 5],
    condition: cond,
    conditionLabel: cond >= 65 ? 'Good' : cond >= 50 ? 'Fair' : cond >= 35 ? 'Poor' : 'Critical',
    criticality: cond < 40 ? 3 : 2,
    criticalityLabel: cond < 40 ? 'High' : 'Medium',
    lifecycleStatus: 'Operational',
    priorityScore: Math.round((100 - cond) * 0.7 + 20),
    riskScore: Math.round((100 - cond) * 0.6 + 15),
    lat: 22 + Math.random() * 2,
    lng: 71 + Math.random() * 2,
    constructionYear: 2000 + i,
  });
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-2026-001', name: 'Ahmedabad Ring Road Rehabilitation', assetId: 'RD-GJ-1024',
    district: 'Ahmedabad', division: 'Central', contractor: 'CONT-001', contractorName: 'ABC Infrastructure Pvt Ltd',
    budget: 184000000, spent: 128000000, committed: 150000000, progress: 72, status: 'UnderConstruction',
    startDate: '2026-01-12', endDate: '2026-11-30',
    milestones: [
      { name: 'Site Preparation & Mobilization', progress: 100, completedDate: '2026-01-25' },
      { name: 'Base Layer Repair', progress: 100, completedDate: '2026-03-10' },
      { name: 'Structural Patching', progress: 78, expectedDate: '2026-09-30' },
      { name: 'Surface Finishing', progress: 35, expectedDate: '2026-10-30' },
      { name: 'Road Marking & Safety', progress: 20, expectedDate: '2026-11-15' },
      { name: 'Quality Inspection & Handover', progress: 0, expectedDate: '2026-11-30' },
    ],
    engineerName: 'Priya Mehta',
  },
  {
    id: 'PRJ-2026-002', name: 'Gandhinagar Government Complex Renovation',
    district: 'Gandhinagar', contractor: 'CONT-002', contractorName: 'Bharat Road Construction Ltd',
    budget: 95000000, spent: 42000000, committed: 70000000, progress: 44, status: 'UnderConstruction',
    startDate: '2026-03-01', endDate: '2026-12-31',
    milestones: [],
    engineerName: 'Mihir Trivedi',
  },
  {
    id: 'PRJ-2026-004', name: 'Sabarmati Bridge Maintenance Program', assetId: 'BR-GJ-042',
    district: 'Ahmedabad', contractor: 'CONT-008', contractorName: 'Param Bridge Builders',
    budget: 420000000, spent: 85000000, committed: 180000000, progress: 20, status: 'Delayed',
    startDate: '2026-04-01', endDate: '2026-12-31',
    milestones: [],
    engineerName: 'Amit Shah',
  },
  {
    id: 'PRJ-2025-048', name: 'Surat Coastal Highway Extension',
    district: 'Surat', contractor: 'CONT-005', contractorName: 'National Infra Developers',
    budget: 850000000, spent: 680000000, committed: 800000000, progress: 80, status: 'Delayed',
    startDate: '2025-01-01', endDate: '2026-06-30',
    milestones: [],
    engineerName: 'Kavita Iyer',
  },
];

export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'INS-001', assetId: 'RD-GJ-1024', assetName: 'Ahmedabad Ring Road Section 4', assetType: 'Road', district: 'Ahmedabad',
    date: '2026-09-12', inspector: 'EMP-003', inspectorName: 'Priya Mehta',
    type: 'Routine', status: 'Completed',
    conditionScoreBefore: 52, conditionScoreAfter: 38, severityRating: 'Critical',
    findings: 'Severe pavement cracking over 340m stretch. Multiple pothole clusters. Drainage failure on eastern shoulder.',
    recommendations: 'Immediate corrective maintenance required.',
    defectsFound: ['DEF-001', 'DEF-002'],
    items: [
      { category: 'Surface Condition', rating: 1, severity: 'Critical', remarks: 'Severe cracking and deformation' },
      { category: 'Potholes', rating: 1, severity: 'Critical', remarks: '23 potholes identified over 340m' },
      { category: 'Drainage', rating: 2, severity: 'High', remarks: 'Drainage blocked on eastern shoulder' },
      { category: 'Shoulder', rating: 2, severity: 'High', remarks: 'Edge deterioration on both sides' },
    ],
  },
  {
    id: 'INS-002', assetId: 'GB-018', assetName: 'Government District Hospital Ahmedabad', assetType: 'Building', district: 'Ahmedabad',
    date: '2026-08-20', inspector: 'EMP-002', inspectorName: 'Amit Shah',
    type: 'Fire Safety', status: 'Completed',
    conditionScoreBefore: 58, conditionScoreAfter: 45, severityRating: 'Critical',
    findings: 'Fire suppression system non-functional on floors 3 and 4. Electrical wiring deterioration.',
    recommendations: 'Immediate fire safety remediation required.',
    defectsFound: ['DEF-003', 'DEF-004'],
    items: [
      { category: 'Fire Safety', rating: 1, severity: 'Critical', remarks: 'Suppression system non-functional' },
      { category: 'Electrical', rating: 1, severity: 'Critical', remarks: 'Exposed wiring in corridors' },
    ],
  },
  {
    id: 'INS-003', assetId: 'BR-GJ-042', assetName: 'Sabarmati River Major Bridge Ahmedabad', assetType: 'Bridge', district: 'Ahmedabad',
    date: '2026-07-05', inspector: 'EMP-002', inspectorName: 'Amit Shah',
    type: 'Structural', status: 'Completed',
    conditionScoreBefore: 48, conditionScoreAfter: 35, severityRating: 'Critical',
    findings: 'Deep structural cracks in pier 3 and pier 7. Spalling concrete. Corroded rebar exposed.',
    recommendations: 'Urgent structural rehabilitation required.',
    defectsFound: ['DEF-005', 'DEF-006', 'DEF-007'],
    items: [
      { category: 'Piers', rating: 1, severity: 'Critical', remarks: 'Deep cracks in pier 3 and pier 7' },
      { category: 'Rebar Condition', rating: 1, severity: 'Critical', remarks: 'Exposed corroded rebar at joints' },
    ],
  },
];

export const MOCK_DEFECTS: Defect[] = [
  { id: 'DEF-001', assetId: 'RD-GJ-1024', assetName: 'Ahmedabad Ring Road Section 4', severity: 'Critical', description: 'Severe pavement cracking and pothole formation over 340m stretch.', status: 'InProgress', reportedByName: 'Priya Mehta', assignedToName: 'Priya Mehta', workOrderId: 'WO-2026-00482', createdDate: '2026-09-12', sla: '14 days', slaDaysRemaining: -5, district: 'Ahmedabad' },
  { id: 'DEF-002', assetId: 'RD-GJ-1024', assetName: 'Ahmedabad Ring Road Section 4', severity: 'High', description: 'Shoulder erosion on eastern side.', status: 'Assigned', reportedByName: 'Priya Mehta', createdDate: '2026-09-12', sla: '21 days', slaDaysRemaining: 7, district: 'Ahmedabad' },
  { id: 'DEF-003', assetId: 'GB-018', assetName: 'Government District Hospital', severity: 'Critical', description: 'Fire suppression system completely non-functional on floors 3 and 4.', status: 'Reported', reportedByName: 'Amit Shah', workOrderId: 'WO-2026-00491', createdDate: '2026-08-20', sla: '7 days', slaDaysRemaining: -32, district: 'Ahmedabad' },
  { id: 'DEF-004', assetId: 'GB-018', severity: 'Critical', description: 'Exposed and deteriorated electrical wiring in 2nd floor corridors.', status: 'Assigned', reportedByName: 'Amit Shah', createdDate: '2026-08-20', sla: '14 days', slaDaysRemaining: -25, district: 'Ahmedabad' },
  { id: 'DEF-005', assetId: 'BR-GJ-042', assetName: 'Sabarmati River Bridge', severity: 'Critical', description: 'Deep structural cracks in pier 3. Risk of progressive failure.', status: 'Reported', reportedByName: 'Amit Shah', workOrderId: 'WO-2026-00503', createdDate: '2026-07-05', sla: '7 days', slaDaysRemaining: -78, district: 'Ahmedabad' },
  { id: 'DEF-006', assetId: 'BR-GJ-042', severity: 'Critical', description: 'Exposed and corroded rebar at beam joints.', status: 'Assigned', reportedByName: 'Amit Shah', createdDate: '2026-07-05', sla: '14 days', slaDaysRemaining: -71, district: 'Ahmedabad' },
  { id: 'DEF-007', assetId: 'BR-GJ-042', severity: 'High', description: 'Foundation scouring at pier 7.', status: 'Reviewed', reportedByName: 'Amit Shah', createdDate: '2026-07-05', sla: '30 days', slaDaysRemaining: -54, district: 'Ahmedabad' },
  { id: 'DEF-008', assetId: 'RD-GJ-0912', severity: 'Medium', description: 'Pavement fatigue cracking on 3 high-traffic sections.', status: 'Reviewed', reportedByName: 'Seema Sharma', createdDate: '2026-08-10', sla: '30 days', slaDaysRemaining: 12, district: 'Gandhinagar' },
  { id: 'DEF-009', assetId: 'GB-024', severity: 'High', description: 'Roof waterproofing failure causing leakage into 4 classrooms.', status: 'Assigned', reportedByName: 'Seema Sharma', createdDate: '2026-07-15', sla: '30 days', slaDaysRemaining: -43, district: 'Gandhinagar' },
];

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-2026-00482', assetId: 'RD-GJ-1024',
    problem: 'Severe pavement deterioration - immediate repair required',
    description: 'Emergency corrective maintenance for 340m stretch of severely deteriorated road surface.',
    priority: 'High', status: 'InProgress', type: 'Corrective',
    assignedEngineerName: 'Priya Mehta', contractorName: 'ABC Infrastructure Pvt Ltd',
    estimatedCost: 1850000, approvedCost: 1850000, spentSoFar: 820000,
    startDate: '2026-09-14', expectedCompletion: '2026-10-30',
    createdDate: '2026-09-13', approvalStatus: 'Approved',
    approvalChain: [
      { role: 'Assistant Engineer', user: 'Priya Mehta', status: 'Approved', date: '2026-09-13', remarks: 'Urgent repair needed' },
      { role: 'Executive Engineer', user: 'Amit Shah', status: 'Approved', date: '2026-09-14', remarks: 'Approved for immediate action' },
      { role: 'Chief Engineer', user: 'Rajesh Patel', status: 'Approved', date: '2026-09-14', remarks: 'High priority - proceed immediately' },
    ],
    district: 'Ahmedabad',
  },
  {
    id: 'WO-2026-00491', assetId: 'GB-018',
    problem: 'Critical fire safety system failure - hospital floors 3 & 4',
    description: 'Emergency fire safety remediation for government district hospital.',
    priority: 'Critical', status: 'Reported', type: 'Emergency',
    assignedEngineerName: 'Amit Shah', contractorName: 'Sunrise Construction Ltd',
    estimatedCost: 820000, spentSoFar: 0,
    expectedCompletion: '2026-10-15', createdDate: '2026-08-20',
    approvalStatus: 'Pending',
    approvalChain: [
      { role: 'Assistant Engineer', user: 'Amit Shah', status: 'Approved', date: '2026-08-20', remarks: 'Emergency - safety critical' },
      { role: 'Executive Engineer', user: 'Amit Shah', status: 'Pending', date: null, remarks: null },
      { role: 'Chief Engineer', user: 'Rajesh Patel', status: 'Pending', date: null, remarks: null },
    ],
    district: 'Ahmedabad',
  },
  {
    id: 'WO-2026-00503', assetId: 'BR-GJ-042',
    problem: 'Structural cracks and rebar corrosion in bridge piers',
    description: 'Emergency structural repair for Sabarmati River Bridge.',
    priority: 'Critical', status: 'Assigned', type: 'Emergency',
    assignedEngineerName: 'Amit Shah', contractorName: 'Param Bridge Builders',
    estimatedCost: 4200000, approvedCost: 4200000, spentSoFar: 850000,
    startDate: '2026-09-20', expectedCompletion: '2026-11-30',
    createdDate: '2026-07-06', approvalStatus: 'Approved',
    approvalChain: [
      { role: 'Assistant Engineer', user: 'Amit Shah', status: 'Approved', date: '2026-07-06', remarks: 'Critical structural issue' },
      { role: 'Executive Engineer', user: 'Amit Shah', status: 'Approved', date: '2026-07-07', remarks: 'Approved' },
      { role: 'Chief Engineer', user: 'Rajesh Patel', status: 'Approved', date: '2026-07-08', remarks: 'High priority bridge safety work' },
      { role: 'Finance', user: 'Neha Joshi', status: 'Approved', date: '2026-07-09', remarks: 'Budget allocated from emergency fund' },
    ],
    district: 'Ahmedabad',
  },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Rajesh Patel', designation: 'Chief Engineer', district: 'ALL', division: 'ALL', workload: 45, status: 'Available', skills: ['Project Management', 'Quality Control', 'Contract Administration'] },
  { id: 'EMP-002', name: 'Amit Shah', designation: 'Executive Engineer', district: 'Ahmedabad', division: 'Central', workload: 82, status: 'Assigned', skills: ['Bridge Engineering', 'Structural Assessment'], currentAssignment: 'WO-2026-00503' },
  { id: 'EMP-003', name: 'Priya Mehta', designation: 'Assistant Engineer', district: 'Ahmedabad', division: 'Central', workload: 80, status: 'Assigned', skills: ['Road Construction', 'Bituminous Pavement'], currentAssignment: 'WO-2026-00482' },
  { id: 'EMP-004', name: 'Kiran Desai', designation: 'Junior Engineer', district: 'Ahmedabad', division: 'Central', workload: 60, status: 'Assigned', skills: ['Survey', 'GIS Mapping'] },
  { id: 'EMP-005', name: 'Mihir Trivedi', designation: 'Executive Engineer', district: 'Gandhinagar', division: 'North', workload: 75, status: 'Assigned', skills: ['Building Construction', 'Electrical Systems'] },
  { id: 'EMP-006', name: 'Seema Sharma', designation: 'Assistant Engineer', district: 'Gandhinagar', division: 'North', workload: 65, status: 'Assigned', skills: ['Building Construction', 'Fire Safety'] },
  { id: 'EMP-007', name: 'Ravi Nair', designation: 'Executive Engineer', district: 'Vadodara', division: 'East', workload: 70, status: 'Assigned', skills: ['Road Construction', 'Bridge Engineering'] },
  { id: 'EMP-010', name: 'Kavita Iyer', designation: 'Executive Engineer', district: 'Surat', division: 'South', workload: 85, status: 'Overloaded', skills: ['Highway Engineering', 'Project Management'] },
];

export const MOCK_CONTRACTORS: Contractor[] = [
  { id: 'CONT-001', name: 'ABC Infrastructure Pvt Ltd', regNo: 'GJCONT-2019-0421', activeContracts: 3, totalContractValue: 854000000, projectsCompleted: 12, delayedProjects: 1, defectsRecorded: 5, inspectionPassRate: 94, status: 'Active', paymentStatus: 'Current' },
  { id: 'CONT-002', name: 'Bharat Road Construction Ltd', regNo: 'GJCONT-2020-0111', activeContracts: 2, totalContractValue: 420000000, projectsCompleted: 8, delayedProjects: 0, defectsRecorded: 2, inspectionPassRate: 97, status: 'Active', paymentStatus: 'Current' },
  { id: 'CONT-003', name: 'Gujarat Civil Works Co.', regNo: 'GJCONT-2018-0334', activeContracts: 4, totalContractValue: 1100000000, projectsCompleted: 18, delayedProjects: 3, defectsRecorded: 8, inspectionPassRate: 89, status: 'Active', paymentStatus: 'Current' },
  { id: 'CONT-008', name: 'Param Bridge Builders', regNo: 'GJCONT-2020-0445', activeContracts: 1, totalContractValue: 950000000, projectsCompleted: 6, delayedProjects: 0, defectsRecorded: 3, inspectionPassRate: 95, status: 'Active', paymentStatus: 'Current' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'AUD-001', timestamp: '2026-09-28T10:42:00Z', userName: 'Priya Mehta', userRole: 'Assistant Engineer', action: 'UPDATE', entity: 'Asset', entityId: 'RD-GJ-1024', description: 'Condition updated after inspection', oldValue: { condition: 52, conditionLabel: 'Fair' }, newValue: { condition: 38, conditionLabel: 'Poor' }, reason: 'Routine Inspection INS-001', ipAddress: '192.168.1.10' },
  { id: 'AUD-002', timestamp: '2026-09-28T10:45:00Z', userName: 'Priya Mehta', userRole: 'Assistant Engineer', action: 'CREATE', entity: 'WorkOrder', entityId: 'WO-2026-00482', description: 'Work order created for RD-GJ-1024', newValue: { priority: 'High', estimatedCost: 1850000 }, reason: 'Critical inspection finding', ipAddress: '192.168.1.10' },
  { id: 'AUD-003', timestamp: '2026-09-28T11:00:00Z', userName: 'Amit Shah', userRole: 'Executive Engineer', action: 'APPROVE', entity: 'WorkOrder', entityId: 'WO-2026-00482', description: 'Work order approved', oldValue: { status: 'Pending' }, newValue: { status: 'Approved' }, reason: 'Urgent corrective maintenance', ipAddress: '192.168.1.20' },
  { id: 'AUD-004', timestamp: '2026-09-28T11:15:00Z', userName: 'Rajesh Patel', userRole: 'Chief Engineer', action: 'APPROVE', entity: 'WorkOrder', entityId: 'WO-2026-00482', description: 'Work order approved by Chief Engineer', oldValue: { status: 'Pending CE' }, newValue: { status: 'Fully Approved' }, reason: 'High priority road repair', ipAddress: '10.0.0.1' },
  { id: 'AUD-005', timestamp: '2026-08-20T14:30:00Z', userName: 'Amit Shah', userRole: 'Executive Engineer', action: 'CREATE', entity: 'Inspection', entityId: 'INS-002', description: 'Fire safety inspection conducted for GB-018', newValue: { severityRating: 'Critical' }, reason: 'Scheduled fire safety inspection', ipAddress: '192.168.1.20' },
  { id: 'AUD-006', timestamp: '2026-08-20T15:00:00Z', userName: 'Amit Shah', userRole: 'Executive Engineer', action: 'UPDATE', entity: 'Asset', entityId: 'GB-018', description: 'Condition updated after fire safety inspection', oldValue: { condition: 58 }, newValue: { condition: 45 }, reason: 'Critical fire safety defects found', ipAddress: '192.168.1.20' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'NOTIF-001', type: 'warning', title: 'Road inspection overdue', message: 'RD-GJ-1024 inspection was due on 10 Sep 2026. Please schedule immediately.', entityId: 'RD-GJ-1024', entityType: 'Asset', read: false, createdAt: '2026-09-15T09:00:00Z' },
  { id: 'NOTIF-002', type: 'critical', title: 'Critical defect reported', message: 'Bridge BR-GJ-042 has a critical structural defect. Immediate action required.', entityId: 'BR-GJ-042', entityType: 'Asset', read: false, createdAt: '2026-09-10T11:00:00Z' },
  { id: 'NOTIF-003', type: 'warning', title: 'Project completion deadline approaching', message: 'PRJ-2026-001 is due on 30 Nov 2026. Current progress: 72%.', entityId: 'PRJ-2026-001', entityType: 'Project', read: false, createdAt: '2026-09-20T08:00:00Z' },
  { id: 'NOTIF-004', type: 'warning', title: 'Budget utilization above 85%', message: 'Division Central has utilized 86% of annual maintenance allocation.', read: true, createdAt: '2026-09-18T10:00:00Z' },
  { id: 'NOTIF-005', type: 'critical', title: 'Fire safety inspection overdue', message: 'GB-018 fire safety work order SLA breached by 32 days.', entityId: 'GB-018', entityType: 'Asset', read: false, createdAt: '2026-09-22T09:00:00Z' },
  { id: 'NOTIF-006', type: 'success', title: 'Work order completed', message: 'WO-2026-00471 has been completed and verified.', read: true, createdAt: '2026-09-25T15:00:00Z' },
];

export const MOCK_KPIS = {
  totalAssets: 195,
  activeProjects: 12,
  annualBudget: 24500000000,
  budgetUtilization: 68.4,
  criticalAssets: 127,
  openDefects: 342,
  openWorkOrders: 89,
  overdueInspections: 23,
  poorConditionAssets: 45,
  budgetSpent: 16750000000,
  budgetRemaining: 6300000000,
};

export const MOCK_CHARTS = {
  conditionDist: { Excellent: 42, Good: 68, Fair: 55, Poor: 22, Critical: 8 },
  projectStatus: { OnTrack: 8, Delayed: 3, Completed: 7, AtRisk: 2, Proposed: 4 },
  budgetData: { allocated: 2450, committed: 1820, spent: 1675, remaining: 630 },
  maintenanceTypes: { Preventive: 28, Corrective: 45, Emergency: 16 },
  assetsByDistrict: [
    { district: 'Ahmedabad', count: 52, critical: 38 },
    { district: 'Gandhinagar', count: 35, critical: 22 },
    { district: 'Vadodara', count: 41, critical: 28 },
    { district: 'Surat', count: 38, critical: 24 },
    { district: 'Rajkot', count: 29, critical: 15 },
  ],
  monthlyExpenditure: [
    { month: 'Apr 2026', budget: 2041, spent: 1240 },
    { month: 'May 2026', budget: 2041, spent: 1580 },
    { month: 'Jun 2026', budget: 2041, spent: 1320 },
    { month: 'Jul 2026', budget: 2041, spent: 1650 },
    { month: 'Aug 2026', budget: 2041, spent: 1890 },
    { month: 'Sep 2026', budget: 2041, spent: 1540 },
    { month: 'Oct 2026', budget: 2041, spent: 0 },
    { month: 'Nov 2026', budget: 2041, spent: 0 },
    { month: 'Dec 2026', budget: 2041, spent: 0 },
    { month: 'Jan 2027', budget: 2041, spent: 0 },
    { month: 'Feb 2027', budget: 2041, spent: 0 },
    { month: 'Mar 2027', budget: 2049, spent: 0 },
  ],
};
