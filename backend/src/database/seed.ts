import bcrypt from 'bcryptjs';
import { db } from './store';
import { calculatePriority } from '../services/priority.service';

const districts = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'];
const districtCoords: Record<string, [number, number]> = {
  Ahmedabad: [23.0225, 72.5714],
  Gandhinagar: [23.2156, 72.6369],
  Vadodara: [22.3072, 73.1812],
  Surat: [21.1702, 72.8311],
  Rajkot: [22.3039, 70.8022],
};

const divisions = ['Central', 'North', 'South', 'East', 'West'];

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rndF(min: number, max: number, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function jitter(base: number, range: number) {
  return base + (Math.random() - 0.5) * range;
}

export default async function seedDb() {
  const passwordHash = bcrypt.hashSync('Demo@1234', 10);

  // ── USERS ────────────────────────────────────────────────────────────────
  const users = [
    { id: 'u1', email: 'admin@rbinfragov.demo', name: 'Suresh Kumar', password: passwordHash, role: 'Super Admin', orgScope: 'ALL', department: 'Administration', district: 'ALL', division: 'ALL' },
    { id: 'u2', email: 'chief@rbinfragov.demo', name: 'Rajesh Patel', password: passwordHash, role: 'Chief Engineer', orgScope: 'ALL', department: 'Engineering', district: 'ALL', division: 'ALL' },
    { id: 'u3', email: 'executive@rbinfragov.demo', name: 'Amit Shah', password: passwordHash, role: 'Executive Engineer', orgScope: 'DISTRICT', department: 'Engineering', district: 'Ahmedabad', division: 'Central' },
    { id: 'u4', email: 'engineer@rbinfragov.demo', name: 'Priya Mehta', password: passwordHash, role: 'Assistant Engineer', orgScope: 'DIVISION', department: 'Engineering', district: 'Ahmedabad', division: 'Central' },
    { id: 'u5', email: 'finance@rbinfragov.demo', name: 'Neha Joshi', password: passwordHash, role: 'Finance Officer', orgScope: 'ALL', department: 'Finance', district: 'ALL', division: 'ALL' },
    { id: 'u6', email: 'auditor@rbinfragov.demo', name: 'Vikram Rao', password: passwordHash, role: 'Auditor', orgScope: 'ALL', department: 'Audit', district: 'ALL', division: 'ALL' },
    { id: 'u7', email: 'contractor@rbinfragov.demo', name: 'Hitesh Contractor', password: passwordHash, role: 'Contractor', orgScope: 'SELF', department: 'External', district: 'ALL', division: 'ALL' },
  ];
  users.forEach(u => db.users.set(u.id, u));

  // ── EMPLOYEES ─────────────────────────────────────────────────────────────
  const empNames = [
    ['EMP-001', 'Rajesh Patel', 'Chief Engineer', 'ALL', 'ALL', 0, 'chief@rbinfragov.demo'],
    ['EMP-002', 'Amit Shah', 'Executive Engineer', 'Ahmedabad', 'Central', 82, 'executive@rbinfragov.demo'],
    ['EMP-003', 'Priya Mehta', 'Assistant Engineer', 'Ahmedabad', 'Central', 80, 'engineer@rbinfragov.demo'],
    ['EMP-004', 'Kiran Desai', 'Junior Engineer', 'Ahmedabad', 'Central', 60, 'kiran@rbinfragov.demo'],
    ['EMP-005', 'Mihir Trivedi', 'Executive Engineer', 'Gandhinagar', 'North', 75, 'mihir@rbinfragov.demo'],
    ['EMP-006', 'Seema Sharma', 'Assistant Engineer', 'Gandhinagar', 'North', 65, 'seema@rbinfragov.demo'],
    ['EMP-007', 'Ravi Nair', 'Executive Engineer', 'Vadodara', 'East', 70, 'ravi@rbinfragov.demo'],
    ['EMP-008', 'Anita Patel', 'Assistant Engineer', 'Vadodara', 'East', 55, 'anita@rbinfragov.demo'],
    ['EMP-009', 'Dhruv Shah', 'Junior Engineer', 'Vadodara', 'East', 40, 'dhruv@rbinfragov.demo'],
    ['EMP-010', 'Kavita Iyer', 'Executive Engineer', 'Surat', 'South', 85, 'kavita@rbinfragov.demo'],
    ['EMP-011', 'Nikhil Joshi', 'Assistant Engineer', 'Surat', 'South', 90, 'nikhil@rbinfragov.demo'],
    ['EMP-012', 'Pooja Desai', 'Junior Engineer', 'Surat', 'South', 50, 'pooja@rbinfragov.demo'],
    ['EMP-013', 'Sunil Mehta', 'Executive Engineer', 'Rajkot', 'West', 60, 'sunil@rbinfragov.demo'],
    ['EMP-014', 'Rekha Gandhi', 'Assistant Engineer', 'Rajkot', 'West', 45, 'rekha@rbinfragov.demo'],
    ['EMP-015', 'Arjun Sharma', 'Junior Engineer', 'Ahmedabad', 'Central', 30, 'arjun@rbinfragov.demo'],
    ['EMP-016', 'Nisha Patel', 'Assistant Engineer', 'Ahmedabad', 'North', 70, 'nisha@rbinfragov.demo'],
    ['EMP-017', 'Prakash Rao', 'Executive Engineer', 'Ahmedabad', 'South', 65, 'prakash@rbinfragov.demo'],
    ['EMP-018', 'Lalita Verma', 'Junior Engineer', 'Gandhinagar', 'North', 35, 'lalita@rbinfragov.demo'],
    ['EMP-019', 'Manish Gupta', 'Assistant Engineer', 'Vadodara', 'West', 55, 'manish@rbinfragov.demo'],
    ['EMP-020', 'Swati Jain', 'Junior Engineer', 'Surat', 'East', 40, 'swati@rbinfragov.demo'],
  ];

  const empSkillSets = [
    ['Road Construction', 'Bituminous Pavement', 'Drainage Design'],
    ['Bridge Engineering', 'Structural Assessment', 'Load Analysis'],
    ['Building Construction', 'Fire Safety', 'Electrical Systems'],
    ['GIS Mapping', 'Survey', 'Traffic Engineering'],
    ['Project Management', 'Contract Administration', 'Quality Control'],
  ];

  empNames.forEach(([id, name, designation, district, division, workload, email], idx) => {
    db.employees.set(id as string, {
      id, name, designation, district, division,
      workload: Number(workload),
      email,
      phone: `+91-9${rnd(700000000, 999999999)}`,
      department: 'Engineering',
      status: Number(workload) > 85 ? 'Overloaded' : Number(workload) > 50 ? 'Assigned' : 'Available',
      skills: empSkillSets[idx % empSkillSets.length],
      joinDate: `${rnd(2010, 2020)}-${String(rnd(1, 12)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
      currentAssignment: id === 'EMP-003' ? 'WO-2026-00482' : id === 'EMP-010' ? 'WO-2026-00491' : null,
    });
  });

  // ── CONTRACTORS ───────────────────────────────────────────────────────────
  const contractorData = [
    { id: 'CONT-001', name: 'ABC Infrastructure Pvt Ltd', regNo: 'GJCONT-2019-0421', activeContracts: 3, totalContractValue: 854000000, projectsCompleted: 12, delayedProjects: 1, defectsRecorded: 5, inspectionPassRate: 94, status: 'Active', district: 'Ahmedabad', paymentStatus: 'Current' },
    { id: 'CONT-002', name: 'Bharat Road Construction Ltd', regNo: 'GJCONT-2020-0111', activeContracts: 2, totalContractValue: 420000000, projectsCompleted: 8, delayedProjects: 0, defectsRecorded: 2, inspectionPassRate: 97, status: 'Active', district: 'Gandhinagar', paymentStatus: 'Current' },
    { id: 'CONT-003', name: 'Gujarat Civil Works Co.', regNo: 'GJCONT-2018-0334', activeContracts: 4, totalContractValue: 1100000000, projectsCompleted: 18, delayedProjects: 3, defectsRecorded: 8, inspectionPassRate: 89, status: 'Active', district: 'Vadodara', paymentStatus: 'Current' },
    { id: 'CONT-004', name: 'Saurashtra Builders Pvt Ltd', regNo: 'GJCONT-2021-0502', activeContracts: 1, totalContractValue: 280000000, projectsCompleted: 5, delayedProjects: 0, defectsRecorded: 1, inspectionPassRate: 99, status: 'Active', district: 'Rajkot', paymentStatus: 'Current' },
    { id: 'CONT-005', name: 'National Infra Developers', regNo: 'GJCONT-2017-0087', activeContracts: 5, totalContractValue: 2300000000, projectsCompleted: 24, delayedProjects: 4, defectsRecorded: 12, inspectionPassRate: 86, status: 'Active', district: 'Surat', paymentStatus: 'Pending' },
    { id: 'CONT-006', name: 'Sunrise Construction Ltd', regNo: 'GJCONT-2022-0611', activeContracts: 2, totalContractValue: 185000000, projectsCompleted: 3, delayedProjects: 0, defectsRecorded: 0, inspectionPassRate: 100, status: 'Active', district: 'Ahmedabad', paymentStatus: 'Current' },
    { id: 'CONT-007', name: 'Meridian Highway Solutions', regNo: 'GJCONT-2019-0298', activeContracts: 3, totalContractValue: 670000000, projectsCompleted: 11, delayedProjects: 2, defectsRecorded: 6, inspectionPassRate: 91, status: 'Active', district: 'Vadodara', paymentStatus: 'Current' },
    { id: 'CONT-008', name: 'Param Bridge Builders', regNo: 'GJCONT-2020-0445', activeContracts: 1, totalContractValue: 950000000, projectsCompleted: 6, delayedProjects: 0, defectsRecorded: 3, inspectionPassRate: 95, status: 'Active', district: 'Ahmedabad', paymentStatus: 'Current' },
    { id: 'CONT-009', name: 'TechBuild Infrastructure', regNo: 'GJCONT-2023-0712', activeContracts: 1, totalContractValue: 95000000, projectsCompleted: 1, delayedProjects: 0, defectsRecorded: 0, inspectionPassRate: 100, status: 'Active', district: 'Gandhinagar', paymentStatus: 'Current' },
    { id: 'CONT-010', name: 'Flagship Construction Co.', regNo: 'GJCONT-2016-0023', activeContracts: 2, totalContractValue: 1450000000, projectsCompleted: 29, delayedProjects: 5, defectsRecorded: 15, inspectionPassRate: 83, status: 'Active', district: 'Surat', paymentStatus: 'Current' },
  ];
  contractorData.forEach(c => db.contractors.set(c.id, c));

  // ── ASSETS ────────────────────────────────────────────────────────────────

  const conditionLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 35) return 'Poor';
    return 'Critical';
  };

  const criticalityLabel = (val: number) => {
    if (val >= 3) return 'Critical';
    if (val >= 2) return 'High';
    if (val >= 1) return 'Medium';
    return 'Low';
  };

  const roadSurfaces = ['Bituminous', 'Concrete', 'WBM', 'Gravel', 'Cobblestone'];
  const trafficCategories = ['Very High', 'High', 'Medium', 'Low'];
  const roadTypes = ['Highway', 'State Road', 'District Road', 'Urban Road', 'Rural Road'];

  const assets: any[] = [];

  // Key assets - fixed data
  assets.push({
    id: 'RD-GJ-1024', assetId: 'RD-GJ-1024',
    name: 'Ahmedabad Ring Road Section 4', type: 'Road', subtype: 'Highway',
    district: 'Ahmedabad', division: 'Central',
    condition: 38, conditionLabel: 'Poor', criticality: 3, criticalityLabel: 'High',
    lifecycleStatus: 'Operational',
    lat: 23.0225, lng: 72.5714,
    length: 12.4, width: 7.3, lanes: 4, surfaceType: 'Bituminous', trafficCategory: 'High',
    roadType: 'Highway', roadNumber: 'GJ-SH-17',
    constructionYear: 2018, commissionedDate: '2018-12-15',
    currentValue: 48000000,
    assignedEngineer: 'EMP-003', assignedEngineerName: 'Priya Mehta',
    lastInspection: '2026-09-12', nextInspection: '2026-10-12',
    department: 'Roads & Buildings Department',
    owner: 'State Government of Gujarat',
    description: 'Critical arterial road connecting Ahmedabad ring road network. High traffic volume corridor serving industrial and residential zones.',
  });

  assets.push({
    id: 'RD-GJ-0912', assetId: 'RD-GJ-0912',
    name: 'Gandhinagar-Ahmedabad Highway Connector', type: 'Road', subtype: 'State Road',
    district: 'Gandhinagar', division: 'North',
    condition: 52, conditionLabel: 'Fair', criticality: 3, criticalityLabel: 'High',
    lifecycleStatus: 'Operational',
    lat: 23.1111, lng: 72.5800,
    length: 8.5, width: 9.0, lanes: 6, surfaceType: 'Bituminous', trafficCategory: 'Very High',
    roadType: 'State Road', roadNumber: 'GJ-NH-8C',
    constructionYear: 2020, commissionedDate: '2020-06-20',
    currentValue: 38000000,
    assignedEngineer: 'EMP-005', assignedEngineerName: 'Mihir Trivedi',
    lastInspection: '2026-08-10', nextInspection: '2026-09-10',
    department: 'Roads & Buildings Department',
    owner: 'State Government of Gujarat',
    description: 'Major state highway connecting state capital Gandhinagar to Ahmedabad. High strategic importance.',
  });

  assets.push({
    id: 'GB-018', assetId: 'GB-018',
    name: 'Government District Hospital Ahmedabad', type: 'Building', subtype: 'Hospital',
    district: 'Ahmedabad', division: 'Central',
    condition: 45, conditionLabel: 'Poor', criticality: 3, criticalityLabel: 'Critical',
    lifecycleStatus: 'Operational',
    lat: 23.0369, lng: 72.5596,
    buildingType: 'Hospital', floors: 5, builtUpArea: 8500, capacity: 450,
    occupancy: 'High', constructionYear: 1998, commissionedDate: '1999-03-01',
    currentValue: 125000000,
    assignedEngineer: 'EMP-002', assignedEngineerName: 'Amit Shah',
    lastInspection: '2026-08-20', nextInspection: '2026-10-01',
    department: 'Health & Roads Department',
    owner: 'State Government of Gujarat',
    description: 'Major government district hospital serving central Ahmedabad. High occupancy public health facility.',
  });

  assets.push({
    id: 'GB-024', assetId: 'GB-024',
    name: 'Government Primary School Gandhinagar', type: 'Building', subtype: 'School',
    district: 'Gandhinagar', division: 'North',
    condition: 55, conditionLabel: 'Fair', criticality: 2, criticalityLabel: 'High',
    lifecycleStatus: 'Operational',
    lat: 23.2156, lng: 72.6369,
    buildingType: 'School', floors: 2, builtUpArea: 2200, capacity: 600,
    occupancy: 'High', constructionYear: 2005, commissionedDate: '2005-06-01',
    currentValue: 22000000,
    assignedEngineer: 'EMP-006', assignedEngineerName: 'Seema Sharma',
    lastInspection: '2026-07-15', nextInspection: '2026-10-15',
    department: 'Roads & Buildings Department',
    owner: 'State Government of Gujarat',
    description: 'Government primary school serving Gandhinagar residential sector. Requires roof and electrical maintenance.',
  });

  assets.push({
    id: 'BR-GJ-042', assetId: 'BR-GJ-042',
    name: 'Sabarmati River Major Bridge Ahmedabad', type: 'Bridge', subtype: 'Major Bridge',
    district: 'Ahmedabad', division: 'Central',
    condition: 35, conditionLabel: 'Poor', criticality: 3, criticalityLabel: 'Critical',
    lifecycleStatus: 'Operational',
    lat: 23.0435, lng: 72.5777,
    length: 320, width: 12.5, lanes: 4, trafficCategory: 'Very High',
    bridgeType: 'Major Bridge', constructionYear: 1985, commissionedDate: '1985-11-10',
    currentValue: 220000000,
    assignedEngineer: 'EMP-002', assignedEngineerName: 'Amit Shah',
    lastInspection: '2026-07-05', nextInspection: '2026-10-05',
    department: 'Roads & Buildings Department',
    owner: 'State Government of Gujarat',
    description: 'Critical bridge over Sabarmati River. Structural cracks identified in recent inspection. Urgent rehabilitation required.',
  });

  // ── More Roads (95 additional) ────────────────────────────────────────────
  const roadNames = [
    'Ring Road', 'Bypass Road', 'Highway', 'District Road', 'State Highway',
    'National Highway Link', 'Outer Ring Road', 'Industrial Road', 'Rural Road', 'Urban Road'
  ];

  let rdCount = 1;
  for (const dist of districts) {
    const [baseLat, baseLng] = districtCoords[dist];
    const division = pick(divisions);
    for (let i = 0; i < 20; i++) {
      const id = `RD-GJ-${String(rdCount + 100).padStart(4, '0')}`;
      const cond = rnd(22, 95);
      const crit = cond < 40 ? 3 : cond < 60 ? 2 : 1;
      assets.push({
        id, assetId: id,
        name: `${dist} ${pick(roadNames)} Section ${i + 1}`,
        type: 'Road', subtype: pick(roadTypes),
        district: dist, division: pick(divisions),
        condition: cond, conditionLabel: conditionLabel(cond),
        criticality: crit, criticalityLabel: criticalityLabel(crit),
        lifecycleStatus: pick(['Operational', 'Operational', 'Operational', 'Under Maintenance', 'Decommissioned']),
        lat: jitter(baseLat, 0.3), lng: jitter(baseLng, 0.3),
        length: rndF(1.5, 25), width: rndF(5, 12), lanes: pick([2, 2, 4, 4, 6]),
        surfaceType: pick(roadSurfaces), trafficCategory: pick(trafficCategories),
        roadType: pick(roadTypes),
        constructionYear: rnd(1990, 2023), commissionedDate: `${rnd(1990, 2023)}-06-01`,
        currentValue: rnd(5000000, 80000000),
        assignedEngineer: `EMP-0${String(rnd(2, 14)).padStart(2, '0')}`,
        lastInspection: `2026-${String(rnd(1, 9)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
        nextInspection: `2026-${String(rnd(10, 12)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
        department: 'Roads & Buildings Department',
        owner: 'State Government of Gujarat',
      });
      rdCount++;
    }
  }

  // ── More Buildings (25 additional) ───────────────────────────────────────
  const buildingTypes = ['Government Office', 'Hospital', 'School', 'Administrative Building', 'Public Facility', 'Residential Building'];
  const buildingNames = [
    'District Collectorate', 'Civil Hospital', 'Government High School', 'Taluka Panchayat Office',
    'Sub-Divisional Office', 'Public Works Department Office', 'Revenue Office', 'Community Health Centre',
    'Government ITI', 'Police Headquarters', 'District Court Complex', 'Municipal Office',
    'Agriculture Department Office', 'Veterinary Hospital', 'Government Warehouse',
  ];

  let gbCount = 1;
  for (const dist of districts) {
    const [baseLat, baseLng] = districtCoords[dist];
    for (let i = 0; i < 5; i++) {
      const id = `GB-${String(gbCount + 30).padStart(3, '0')}`;
      const cond = rnd(30, 90);
      const crit = cond < 45 ? 3 : cond < 60 ? 2 : 1;
      const btype = pick(buildingTypes);
      assets.push({
        id, assetId: id,
        name: `${pick(buildingNames)} - ${dist}`,
        type: 'Building', subtype: btype,
        district: dist, division: pick(divisions),
        condition: cond, conditionLabel: conditionLabel(cond),
        criticality: crit, criticalityLabel: criticalityLabel(crit),
        lifecycleStatus: pick(['Operational', 'Operational', 'Under Maintenance']),
        lat: jitter(baseLat, 0.25), lng: jitter(baseLng, 0.25),
        buildingType: btype,
        floors: rnd(1, 8), builtUpArea: rnd(500, 12000), capacity: rnd(50, 800),
        occupancy: pick(['Low', 'Medium', 'High']),
        constructionYear: rnd(1975, 2020), commissionedDate: `${rnd(1975, 2020)}-01-01`,
        currentValue: rnd(10000000, 200000000),
        assignedEngineer: `EMP-0${String(rnd(2, 14)).padStart(2, '0')}`,
        lastInspection: `2026-${String(rnd(1, 9)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
        nextInspection: `2026-${String(rnd(10, 12)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
        department: 'Roads & Buildings Department',
        owner: 'State Government of Gujarat',
      });
      gbCount++;
    }
  }

  // ── More Bridges (10 additional) ─────────────────────────────────────────
  const bridgeTypes = ['Major Bridge', 'Minor Bridge', 'Flyover', 'Culvert'];
  const riverNames = ['Sabarmati', 'Narmada', 'Tapi', 'Mahi', 'Vishwamitri'];

  let brCount = 1;
  for (const dist of districts) {
    const [baseLat, baseLng] = districtCoords[dist];
    for (let i = 0; i < 3; i++) {
      const id = `BR-GJ-${String(brCount + 50).padStart(3, '0')}`;
      const cond = rnd(28, 88);
      const crit = cond < 45 ? 3 : cond < 60 ? 2 : 1;
      assets.push({
        id, assetId: id,
        name: `${pick(riverNames)} River Bridge - ${dist} ${i + 1}`,
        type: 'Bridge', subtype: pick(bridgeTypes),
        district: dist, division: pick(divisions),
        condition: cond, conditionLabel: conditionLabel(cond),
        criticality: crit, criticalityLabel: criticalityLabel(crit),
        lifecycleStatus: pick(['Operational', 'Operational', 'Under Maintenance']),
        lat: jitter(baseLat, 0.2), lng: jitter(baseLng, 0.2),
        length: rnd(50, 800), width: rndF(6, 16), lanes: pick([2, 4]),
        trafficCategory: pick(trafficCategories),
        constructionYear: rnd(1980, 2020),
        currentValue: rnd(50000000, 500000000),
        assignedEngineer: `EMP-0${String(rnd(2, 14)).padStart(2, '0')}`,
        lastInspection: `2026-${String(rnd(1, 9)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
        nextInspection: `2026-${String(rnd(10, 12)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
        department: 'Roads & Buildings Department',
        owner: 'State Government of Gujarat',
      });
      brCount++;
    }
  }

  // ── Components (50) ───────────────────────────────────────────────────────
  const componentTypes = ['Drainage', 'Streetlight', 'Footpath', 'Safety Barrier', 'Signage'];
  for (let i = 0; i < 50; i++) {
    const dist = pick(districts);
    const [baseLat, baseLng] = districtCoords[dist];
    const id = `COMP-${String(i + 1).padStart(4, '0')}`;
    const cond = rnd(30, 95);
    assets.push({
      id, assetId: id,
      name: `${pick(componentTypes)} - ${dist} Zone ${i + 1}`,
      type: 'Component', subtype: pick(componentTypes),
      district: dist, division: pick(divisions),
      condition: cond, conditionLabel: conditionLabel(cond),
      criticality: 1, criticalityLabel: 'Low',
      lifecycleStatus: 'Operational',
      lat: jitter(baseLat, 0.3), lng: jitter(baseLng, 0.3),
      constructionYear: rnd(2005, 2023),
      currentValue: rnd(100000, 2000000),
      assignedEngineer: `EMP-0${String(rnd(2, 14)).padStart(2, '0')}`,
      lastInspection: `2026-${String(rnd(1, 9)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
      department: 'Roads & Buildings Department',
      owner: 'State Government of Gujarat',
    });
  }

  // Calculate priority scores for all assets
  assets.forEach(a => {
    const cond = a.condition || 50;
    const crit = a.criticality || 1;
    const isKeyAsset = ['RD-GJ-1024', 'GB-018', 'BR-GJ-042'].includes(a.id);
    const overdueMaintenanceDays = isKeyAsset ? rnd(30, 60) : (cond < 40 ? rnd(20, 45) : rnd(0, 15));
    const priority = calculatePriority(a, {
      conditionScore: cond,
      defectSeverity: cond < 40 ? 4 : cond < 55 ? 2 : 1,
      overdueMaintenanceDays,
      publicImpact: Math.min(3, crit),
      assetCriticality: crit,
      safetyRisk: cond < 40 ? 3 : cond < 60 ? 1 : 0,
      openDefectsCount: cond < 40 ? rnd(2, 5) : cond < 60 ? rnd(0, 2) : 0,
    });
    // Override key assets
    if (a.id === 'RD-GJ-1024') { priority.score = 91; priority.label = 'Critical'; }
    if (a.id === 'GB-018') { priority.score = 94; priority.label = 'Critical'; }
    if (a.id === 'BR-GJ-042') { priority.score = 97; priority.label = 'Critical'; }
    if (a.id === 'GB-024') { priority.score = 86; priority.label = 'Critical'; }
    if (a.id === 'RD-GJ-0912') { priority.score = 82; priority.label = 'Critical'; }

    a.priorityScore = priority.score;
    a.riskScore = Math.max(10, Math.min(99, priority.score - rnd(-5, 8)));
    a.priorityLabel = priority.label;
    a.overdueMaintenanceDays = overdueMaintenanceDays;
    db.assets.set(a.id, a);
  });

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  const projectData = [
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
      description: 'Complete rehabilitation of 12.4 km Ring Road Section 4 including sub-base repair, bituminous overlay, drainage restoration, road markings and safety barriers.',
      engineer: 'EMP-003', engineerName: 'Priya Mehta',
    },
    {
      id: 'PRJ-2026-002', name: 'Gandhinagar Government Complex Renovation', assetId: 'GB-031',
      district: 'Gandhinagar', division: 'North', contractor: 'CONT-002', contractorName: 'Bharat Road Construction Ltd',
      budget: 95000000, spent: 42000000, committed: 70000000, progress: 44, status: 'UnderConstruction',
      startDate: '2026-03-01', endDate: '2026-12-31',
      milestones: [
        { name: 'Structural Assessment', progress: 100, completedDate: '2026-03-20' },
        { name: 'Electrical Rewiring', progress: 85, expectedDate: '2026-09-30' },
        { name: 'Plumbing Upgrade', progress: 60, expectedDate: '2026-10-15' },
        { name: 'Interior Renovation', progress: 20, expectedDate: '2026-11-30' },
        { name: 'Fire Safety Installation', progress: 10, expectedDate: '2026-12-15' },
        { name: 'Final Inspection', progress: 0, expectedDate: '2026-12-31' },
      ],
      description: 'Complete renovation of Gandhinagar Government Administrative Complex including electrical, plumbing, fire safety systems and interior works.',
      engineer: 'EMP-005', engineerName: 'Mihir Trivedi',
    },
    {
      id: 'PRJ-2026-003', name: 'District Road Strengthening Program - Vadodara', assetId: 'RD-GJ-0201',
      district: 'Vadodara', division: 'East', contractor: 'CONT-003', contractorName: 'Gujarat Civil Works Co.',
      budget: 220000000, spent: 185000000, committed: 210000000, progress: 84, status: 'UnderConstruction',
      startDate: '2025-10-01', endDate: '2026-09-30',
      milestones: [
        { name: 'Survey & Design', progress: 100, completedDate: '2025-11-01' },
        { name: 'Earthwork & Subgrade', progress: 100, completedDate: '2026-01-15' },
        { name: 'Sub-base Construction', progress: 100, completedDate: '2026-04-01' },
        { name: 'Base Course', progress: 95, expectedDate: '2026-09-15' },
        { name: 'Surface Course', progress: 65, expectedDate: '2026-09-25' },
        { name: 'Drainage & Safety', progress: 50, expectedDate: '2026-09-30' },
      ],
      description: 'Strengthening of 45km district road network in Vadodara rural areas.',
      engineer: 'EMP-007', engineerName: 'Ravi Nair',
    },
    {
      id: 'PRJ-2026-004', name: 'Sabarmati Bridge Maintenance Program', assetId: 'BR-GJ-042',
      district: 'Ahmedabad', division: 'Central', contractor: 'CONT-008', contractorName: 'Param Bridge Builders',
      budget: 420000000, spent: 85000000, committed: 180000000, progress: 20, status: 'Delayed',
      startDate: '2026-04-01', endDate: '2026-12-31',
      milestones: [
        { name: 'Detailed Structural Inspection', progress: 100, completedDate: '2026-04-20' },
        { name: 'Design & Engineering', progress: 75, expectedDate: '2026-08-31' },
        { name: 'Crack Sealing & Grouting', progress: 25, expectedDate: '2026-10-31' },
        { name: 'Steel Reinforcement Repair', progress: 0, expectedDate: '2026-11-30' },
        { name: 'Deck Resurfacing', progress: 0, expectedDate: '2026-12-20' },
        { name: 'Load Testing & Handover', progress: 0, expectedDate: '2026-12-31' },
      ],
      description: 'Comprehensive structural rehabilitation of Sabarmati River Bridge. Currently delayed due to design revision.',
      engineer: 'EMP-002', engineerName: 'Amit Shah',
    },
    {
      id: 'PRJ-2026-005', name: 'Government School Infrastructure Upgrade', assetId: 'GB-024',
      district: 'Gandhinagar', division: 'North', contractor: 'CONT-009', contractorName: 'TechBuild Infrastructure',
      budget: 45000000, spent: 18000000, committed: 32000000, progress: 40, status: 'UnderConstruction',
      startDate: '2026-05-01', endDate: '2026-10-31',
      milestones: [
        { name: 'Roof Repair', progress: 75, expectedDate: '2026-08-31' },
        { name: 'Electrical Upgrade', progress: 50, expectedDate: '2026-09-30' },
        { name: 'Sanitation Works', progress: 30, expectedDate: '2026-10-15' },
        { name: 'Furniture & Fixtures', progress: 10, expectedDate: '2026-10-25' },
        { name: 'Handover', progress: 0, expectedDate: '2026-10-31' },
      ],
      description: 'Upgrade of Gandhinagar Government Primary School infrastructure including roof, electrical, and sanitation systems.',
      engineer: 'EMP-006', engineerName: 'Seema Sharma',
    },
    {
      id: 'PRJ-2025-048', name: 'Surat Coastal Highway Extension', assetId: 'RD-GJ-0301',
      district: 'Surat', division: 'South', contractor: 'CONT-005', contractorName: 'National Infra Developers',
      budget: 850000000, spent: 680000000, committed: 800000000, progress: 80, status: 'Delayed',
      startDate: '2025-01-01', endDate: '2026-06-30',
      milestones: [
        { name: 'Land Acquisition & Survey', progress: 100, completedDate: '2025-03-01' },
        { name: 'Earthwork', progress: 100, completedDate: '2025-08-01' },
        { name: 'Bridge Construction', progress: 95, expectedDate: '2026-07-31' },
        { name: 'Road Pavement', progress: 75, expectedDate: '2026-08-31' },
        { name: 'Utility Relocation', progress: 60, expectedDate: '2026-09-30' },
        { name: 'Completion & Handover', progress: 0, expectedDate: '2026-10-31' },
      ],
      description: 'Extension of coastal highway by 18km. Currently 23 days behind schedule due to monsoon delays.',
      engineer: 'EMP-010', engineerName: 'Kavita Iyer',
    },
    {
      id: 'PRJ-2026-006', name: 'Rajkot Urban Road Network Development', assetId: 'RD-GJ-0401',
      district: 'Rajkot', division: 'West', contractor: 'CONT-004', contractorName: 'Saurashtra Builders Pvt Ltd',
      budget: 280000000, spent: 145000000, committed: 210000000, progress: 52, status: 'UnderConstruction',
      startDate: '2026-02-15', endDate: '2027-01-31',
      milestones: [
        { name: 'Survey & DPR', progress: 100, completedDate: '2026-03-01' },
        { name: 'Utility Shifting', progress: 80, expectedDate: '2026-09-30' },
        { name: 'Road Widening - Phase 1', progress: 55, expectedDate: '2026-11-30' },
        { name: 'Road Widening - Phase 2', progress: 20, expectedDate: '2026-12-31' },
        { name: 'Beautification & Signage', progress: 0, expectedDate: '2027-01-15' },
        { name: 'Handover', progress: 0, expectedDate: '2027-01-31' },
      ],
      description: 'Development and widening of urban road network in Rajkot city.',
      engineer: 'EMP-013', engineerName: 'Sunil Mehta',
    },
    {
      id: 'PRJ-2026-007', name: 'Vadodara District Hospital Renovation', assetId: 'GB-045',
      district: 'Vadodara', division: 'East', contractor: 'CONT-007', contractorName: 'Meridian Highway Solutions',
      budget: 125000000, spent: 48000000, committed: 90000000, progress: 38, status: 'UnderConstruction',
      startDate: '2026-04-01', endDate: '2026-12-15',
      milestones: [
        { name: 'Structural Assessment', progress: 100, completedDate: '2026-04-15' },
        { name: 'Electrical System Upgrade', progress: 60, expectedDate: '2026-09-30' },
        { name: 'Plumbing & Water Supply', progress: 40, expectedDate: '2026-10-31' },
        { name: 'HVAC Installation', progress: 15, expectedDate: '2026-11-30' },
        { name: 'Fire Safety Systems', progress: 5, expectedDate: '2026-12-10' },
        { name: 'Final Commissioning', progress: 0, expectedDate: '2026-12-15' },
      ],
      description: 'Comprehensive renovation of Vadodara District Hospital including all MEP systems.',
      engineer: 'EMP-007', engineerName: 'Ravi Nair',
    },
  ];

  // Add more generic projects
  for (let i = 8; i <= 20; i++) {
    const dist = pick(districts);
    const status = pick(['Proposed', 'Approved', 'Tendering', 'UnderConstruction', 'Completed', 'Delayed']);
    const budget = rnd(50, 500) * 1000000;
    const progress = status === 'Completed' ? 100 : status === 'Proposed' ? 0 : rnd(10, 90);
    const spent = Math.floor(budget * progress / 100 * rndF(0.8, 1.1));
    projectData.push({
      id: `PRJ-2026-0${String(i).padStart(2, '0')}`,
      name: `${dist} Infrastructure Development Project ${i}`,
      assetId: `RD-GJ-${String(100 + i).padStart(4, '0')}`,
      district: dist, division: pick(divisions),
      contractor: pick(['CONT-001', 'CONT-002', 'CONT-003', 'CONT-004', 'CONT-005']),
      contractorName: 'Various Contractors',
      budget, spent, committed: Math.floor(budget * 0.85), progress, status,
      startDate: `2026-${String(rnd(1, 6)).padStart(2, '0')}-01`,
      endDate: `2026-${String(rnd(10, 12)).padStart(2, '0')}-31`,
      milestones: [
        { name: 'Planning & Design', progress: progress > 10 ? 100 : progress, expectedDate: '2026-04-01' },
        { name: 'Procurement', progress: progress > 30 ? 100 : Math.max(0, progress - 20), expectedDate: '2026-06-01' },
        { name: 'Construction', progress: Math.max(0, progress - 40), expectedDate: '2026-10-01' },
        { name: 'Completion', progress: status === 'Completed' ? 100 : 0, expectedDate: '2026-12-31' },
      ],
      description: `Infrastructure development project for ${dist} district.`,
      engineer: `EMP-0${String(rnd(2, 14)).padStart(2, '0')}`,
      engineerName: 'Assigned Engineer',
    } as any);
  }

  projectData.forEach(p => db.projects.set(p.id, p));

  // ── INSPECTIONS ───────────────────────────────────────────────────────────
  const inspectionData = [
    {
      id: 'INS-001', assetId: 'RD-GJ-1024', date: '2026-09-12', inspector: 'EMP-003', inspectorName: 'Priya Mehta',
      type: 'Routine', status: 'Completed',
      conditionScoreBefore: 52, conditionScoreAfter: 38, severityRating: 'Critical',
      findings: 'Severe pavement cracking over 340m stretch. Multiple pothole clusters. Drainage failure on eastern shoulder. Edge deterioration.',
      recommendations: 'Immediate corrective maintenance required. Road section is classified as Poor condition. Work order to be raised.',
      defectsFound: ['DEF-001', 'DEF-002'],
      items: [
        { category: 'Surface Condition', rating: 1, severity: 'Critical', remarks: 'Severe cracking and deformation' },
        { category: 'Potholes', rating: 1, severity: 'Critical', remarks: '23 potholes identified over 340m' },
        { category: 'Cracks', rating: 2, severity: 'High', remarks: 'Longitudinal and alligator cracking' },
        { category: 'Drainage', rating: 2, severity: 'High', remarks: 'Drainage blocked on eastern shoulder' },
        { category: 'Shoulder', rating: 2, severity: 'High', remarks: 'Edge deterioration on both sides' },
        { category: 'Signage', rating: 3, severity: 'Medium', remarks: '3 signs faded/missing' },
        { category: 'Lighting', rating: 4, severity: 'Low', remarks: 'Adequate' },
        { category: 'Safety Barriers', rating: 3, severity: 'Medium', remarks: 'Some barriers damaged' },
      ],
    },
    {
      id: 'INS-002', assetId: 'GB-018', date: '2026-08-20', inspector: 'EMP-002', inspectorName: 'Amit Shah',
      type: 'Fire Safety', status: 'Completed',
      conditionScoreBefore: 58, conditionScoreAfter: 45, severityRating: 'Critical',
      findings: 'Fire suppression system non-functional in 3rd and 4th floors. Electrical wiring deterioration. Emergency exits partially blocked.',
      recommendations: 'Immediate fire safety remediation required. Electrical audit to be conducted. Emergency exits to be cleared.',
      defectsFound: ['DEF-003', 'DEF-004'],
      items: [
        { category: 'Structural Condition', rating: 3, severity: 'Medium', remarks: 'Minor cracks in exterior walls' },
        { category: 'Electrical', rating: 1, severity: 'Critical', remarks: 'Exposed wiring in corridors, old switchgear' },
        { category: 'Plumbing', rating: 3, severity: 'Medium', remarks: 'Some leakage in 2nd floor bathrooms' },
        { category: 'Fire Safety', rating: 1, severity: 'Critical', remarks: 'Suppression system non-functional' },
        { category: 'HVAC', rating: 2, severity: 'High', remarks: 'AC units in ICU require maintenance' },
        { category: 'Roof', rating: 2, severity: 'High', remarks: 'Water seepage observed' },
        { category: 'Elevator', rating: 3, severity: 'Medium', remarks: 'Last serviced 8 months ago' },
        { category: 'Accessibility', rating: 2, severity: 'High', remarks: 'Ramps need repair' },
      ],
    },
    {
      id: 'INS-003', assetId: 'BR-GJ-042', date: '2026-07-05', inspector: 'EMP-002', inspectorName: 'Amit Shah',
      type: 'Structural', status: 'Completed',
      conditionScoreBefore: 48, conditionScoreAfter: 35, severityRating: 'Critical',
      findings: 'Deep structural cracks in pier 3 and pier 7. Spalling concrete on deck. Corroded rebar exposed at beam joints. Scouring at pier foundations.',
      recommendations: 'Urgent structural rehabilitation. Bridge load limit to be reviewed. Engineering assessment required.',
      defectsFound: ['DEF-005', 'DEF-006', 'DEF-007'],
      items: [
        { category: 'Deck Condition', rating: 2, severity: 'High', remarks: 'Spalling and surface deterioration' },
        { category: 'Piers', rating: 1, severity: 'Critical', remarks: 'Deep cracks in pier 3 and pier 7' },
        { category: 'Bearings', rating: 2, severity: 'High', remarks: 'Bearing pads showing wear' },
        { category: 'Rebar Condition', rating: 1, severity: 'Critical', remarks: 'Exposed corroded rebar at joints' },
        { category: 'Foundation Scouring', rating: 1, severity: 'Critical', remarks: 'Scouring detected at pier foundations' },
        { category: 'Expansion Joints', rating: 3, severity: 'Medium', remarks: 'Some joints need sealing' },
        { category: 'Railing', rating: 3, severity: 'Medium', remarks: 'Minor corrosion' },
        { category: 'Drainage', rating: 3, severity: 'Medium', remarks: 'Deck drains partially blocked' },
      ],
    },
    {
      id: 'INS-004', assetId: 'RD-GJ-0912', date: '2026-08-10', inspector: 'EMP-006', inspectorName: 'Seema Sharma',
      type: 'Routine', status: 'Completed',
      conditionScoreBefore: 62, conditionScoreAfter: 52, severityRating: 'High',
      findings: 'Pavement fatigue cracking on high-traffic stretches. Some pothole formation. Median lane markings faded.',
      recommendations: 'Preventive maintenance recommended. Schedule resurfacing within 3 months.',
      defectsFound: ['DEF-008'],
      items: [
        { category: 'Surface Condition', rating: 2, severity: 'High', remarks: 'Fatigue cracking on 3 sections' },
        { category: 'Potholes', rating: 2, severity: 'High', remarks: 'Pothole formation beginning' },
        { category: 'Lane Markings', rating: 2, severity: 'High', remarks: 'Markings faded on median lanes' },
        { category: 'Drainage', rating: 3, severity: 'Medium', remarks: 'Mostly functional' },
        { category: 'Signage', rating: 3, severity: 'Medium', remarks: 'Adequate' },
        { category: 'Safety Barriers', rating: 4, severity: 'Low', remarks: 'Good condition' },
      ],
    },
    {
      id: 'INS-005', assetId: 'GB-024', date: '2026-07-15', inspector: 'EMP-006', inspectorName: 'Seema Sharma',
      type: 'Routine', status: 'Completed',
      conditionScoreBefore: 62, conditionScoreAfter: 55, severityRating: 'High',
      findings: 'Roof waterproofing failure. Electrical panels outdated. Toilets in poor condition.',
      recommendations: 'Roof repair urgent. Electrical upgrade needed before monsoon. Sanitation works to be included in annual plan.',
      defectsFound: ['DEF-009'],
      items: [
        { category: 'Structural', rating: 3, severity: 'Medium', remarks: 'Generally sound' },
        { category: 'Roof', rating: 2, severity: 'High', remarks: 'Waterproofing failure - leakage in 4 classrooms' },
        { category: 'Electrical', rating: 2, severity: 'High', remarks: 'Old switchgear, no MCBs in some rooms' },
        { category: 'Plumbing', rating: 2, severity: 'High', remarks: 'Toilet blocks need renovation' },
        { category: 'Accessibility', rating: 3, severity: 'Medium', remarks: 'Ramps available but damaged' },
        { category: 'Fire Safety', rating: 3, severity: 'Medium', remarks: 'Fire extinguishers present, no sprinklers' },
      ],
    },
  ];

  // Add more generic inspections
  const assetIds = Array.from(db.assets.keys()).slice(0, 50);
  for (let i = 6; i <= 120; i++) {
    const assetId = pick(assetIds);
    const asset = db.assets.get(assetId);
    if (!asset) continue;
    const condBefore = rnd(35, 90);
    const condAfter = condBefore - rnd(0, 15);
    const sev = condAfter < 40 ? 'Critical' : condAfter < 55 ? 'High' : condAfter < 70 ? 'Medium' : 'Low';
    inspectionData.push({
      id: `INS-${String(i).padStart(3, '0')}`,
      assetId,
      date: `2026-${String(rnd(1, 9)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
      inspector: pick(['EMP-002', 'EMP-003', 'EMP-006', 'EMP-008']),
      inspectorName: pick(['Amit Shah', 'Priya Mehta', 'Seema Sharma', 'Anita Patel']),
      type: pick(['Routine', 'Structural', 'Fire Safety', 'Electrical', 'Annual']),
      status: pick(['Completed', 'Completed', 'InProgress']),
      conditionScoreBefore: condBefore,
      conditionScoreAfter: condAfter,
      severityRating: sev,
      findings: `${sev} condition issues identified during inspection of ${asset.name}.`,
      recommendations: condAfter < 50 ? 'Immediate maintenance required.' : 'Schedule preventive maintenance.',
      defectsFound: [],
      items: [],
    } as any);
  }

  inspectionData.forEach(i => db.inspections.set(i.id, i));

  // ── DEFECTS ───────────────────────────────────────────────────────────────
  const defectStatuses = ['Reported', 'Reviewed', 'Assigned', 'InProgress', 'Resolved', 'Verified', 'Closed'];
  const defectData = [
    { id: 'DEF-001', assetId: 'RD-GJ-1024', inspectionId: 'INS-001', severity: 'Critical', description: 'Severe pavement cracking and pothole formation over 340m stretch. Alligator cracking with depression up to 8cm.', status: 'InProgress', reportedBy: 'EMP-003', reportedByName: 'Priya Mehta', assignedTo: 'EMP-003', assignedToName: 'Priya Mehta', workOrderId: 'WO-2026-00482', createdDate: '2026-09-12', dueDate: '2026-09-30', sla: '14 days', slaDaysRemaining: -5, district: 'Ahmedabad' },
    { id: 'DEF-002', assetId: 'RD-GJ-1024', inspectionId: 'INS-001', severity: 'High', description: 'Shoulder erosion on eastern side. Edge deterioration affecting road stability for 200m.', status: 'Assigned', reportedBy: 'EMP-003', reportedByName: 'Priya Mehta', assignedTo: 'EMP-004', assignedToName: 'Kiran Desai', workOrderId: 'WO-2026-00482', createdDate: '2026-09-12', dueDate: '2026-10-05', sla: '21 days', slaDaysRemaining: 7, district: 'Ahmedabad' },
    { id: 'DEF-003', assetId: 'GB-018', inspectionId: 'INS-002', severity: 'Critical', description: 'Fire suppression system completely non-functional on floors 3 and 4. Immediate safety hazard for patients.', status: 'Reported', reportedBy: 'EMP-002', reportedByName: 'Amit Shah', assignedTo: null, assignedToName: null, workOrderId: 'WO-2026-00491', createdDate: '2026-08-20', dueDate: '2026-08-27', sla: '7 days', slaDaysRemaining: -32, district: 'Ahmedabad' },
    { id: 'DEF-004', assetId: 'GB-018', inspectionId: 'INS-002', severity: 'Critical', description: 'Exposed and deteriorated electrical wiring in 2nd floor corridors. Shock hazard.', status: 'Assigned', reportedBy: 'EMP-002', reportedByName: 'Amit Shah', assignedTo: 'EMP-011', assignedToName: 'Nikhil Joshi', workOrderId: 'WO-2026-00491', createdDate: '2026-08-20', dueDate: '2026-09-03', sla: '14 days', slaDaysRemaining: -25, district: 'Ahmedabad' },
    { id: 'DEF-005', assetId: 'BR-GJ-042', inspectionId: 'INS-003', severity: 'Critical', description: 'Deep structural cracks in pier 3. Width 4mm, depth unknown. Risk of progressive failure.', status: 'Reported', reportedBy: 'EMP-002', reportedByName: 'Amit Shah', assignedTo: null, workOrderId: 'WO-2026-00503', createdDate: '2026-07-05', dueDate: '2026-07-12', sla: '7 days', slaDaysRemaining: -78, district: 'Ahmedabad' },
    { id: 'DEF-006', assetId: 'BR-GJ-042', inspectionId: 'INS-003', severity: 'Critical', description: 'Exposed and corroded rebar at beam joints. Section loss observed in multiple locations.', status: 'Assigned', reportedBy: 'EMP-002', reportedByName: 'Amit Shah', assignedTo: 'EMP-002', workOrderId: 'WO-2026-00503', createdDate: '2026-07-05', dueDate: '2026-07-19', sla: '14 days', slaDaysRemaining: -71, district: 'Ahmedabad' },
    { id: 'DEF-007', assetId: 'BR-GJ-042', inspectionId: 'INS-003', severity: 'High', description: 'Foundation scouring at pier 7. Scour depth 1.2m. Monsoon risk high.', status: 'Reviewed', reportedBy: 'EMP-002', reportedByName: 'Amit Shah', assignedTo: null, workOrderId: null, createdDate: '2026-07-05', dueDate: '2026-08-05', sla: '30 days', slaDaysRemaining: -54, district: 'Ahmedabad' },
    { id: 'DEF-008', assetId: 'RD-GJ-0912', inspectionId: 'INS-004', severity: 'Medium', description: 'Pavement fatigue cracking on 3 high-traffic sections totaling 1.2km. Early stage.', status: 'Reviewed', reportedBy: 'EMP-006', reportedByName: 'Seema Sharma', assignedTo: null, workOrderId: null, createdDate: '2026-08-10', dueDate: '2026-09-10', sla: '30 days', slaDaysRemaining: 12, district: 'Gandhinagar' },
    { id: 'DEF-009', assetId: 'GB-024', inspectionId: 'INS-005', severity: 'High', description: 'Roof waterproofing failure causing leakage into 4 classrooms. Fungal growth on walls.', status: 'Assigned', reportedBy: 'EMP-006', reportedByName: 'Seema Sharma', assignedTo: 'EMP-006', workOrderId: null, createdDate: '2026-07-15', dueDate: '2026-08-15', sla: '30 days', slaDaysRemaining: -43, district: 'Gandhinagar' },
  ];

  // More generic defects
  for (let i = 10; i <= 100; i++) {
    const assetId = pick(assetIds);
    const asset = db.assets.get(assetId);
    if (!asset) continue;
    const sev = pick(['Low', 'Medium', 'High', 'Critical']);
    const status = pick(defectStatuses);
    defectData.push({
      id: `DEF-${String(i).padStart(3, '0')}`,
      assetId,
      inspectionId: `INS-${String(rnd(1, 30)).padStart(3, '0')}`,
      severity: sev,
      description: `${sev} defect identified in ${asset.name} requiring ${sev === 'Critical' ? 'immediate' : 'scheduled'} maintenance.`,
      status,
      reportedBy: pick(['EMP-002', 'EMP-003', 'EMP-006', 'EMP-008']),
      reportedByName: pick(['Amit Shah', 'Priya Mehta', 'Seema Sharma', 'Anita Patel']),
      assignedTo: status !== 'Reported' ? pick(['EMP-003', 'EMP-004', 'EMP-006', 'EMP-008']) : null,
      assignedToName: status !== 'Reported' ? pick(['Priya Mehta', 'Kiran Desai', 'Seema Sharma', 'Anita Patel']) : null,
      workOrderId: null,
      createdDate: `2026-${String(rnd(1, 9)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
      dueDate: `2026-${String(rnd(9, 12)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
      sla: pick(['7 days', '14 days', '30 days', '60 days']),
      slaDaysRemaining: rnd(-30, 45),
      district: asset.district,
    } as any);
  }
  defectData.forEach(d => db.defects.set(d.id, d));

  // ── WORK ORDERS ───────────────────────────────────────────────────────────
  const workOrderData = [
    {
      id: 'WO-2026-00482', assetId: 'RD-GJ-1024', projectId: 'PRJ-2026-001',
      problem: 'Severe pavement deterioration - immediate repair required',
      description: 'Emergency corrective maintenance for 340m stretch of severely deteriorated road surface. Includes pothole patching, crack sealing, shoulder repair and drainage clearing.',
      priority: 'High', status: 'InProgress',
      assignedEngineer: 'EMP-003', assignedEngineerName: 'Priya Mehta',
      contractor: 'CONT-001', contractorName: 'ABC Infrastructure Pvt Ltd',
      estimatedCost: 1850000, approvedCost: 1850000, spentSoFar: 820000,
      startDate: '2026-09-14', expectedCompletion: '2026-10-30',
      createdDate: '2026-09-13', createdBy: 'EMP-003',
      defectIds: ['DEF-001', 'DEF-002'],
      type: 'Corrective',
      district: 'Ahmedabad', division: 'Central',
      approvalStatus: 'Approved',
      approvalChain: [
        { role: 'Assistant Engineer', user: 'Priya Mehta', status: 'Approved', date: '2026-09-13', remarks: 'Urgent repair needed' },
        { role: 'Executive Engineer', user: 'Amit Shah', status: 'Approved', date: '2026-09-14', remarks: 'Approved for immediate action' },
        { role: 'Chief Engineer', user: 'Rajesh Patel', status: 'Approved', date: '2026-09-14', remarks: 'High priority - proceed immediately' },
      ],
    },
    {
      id: 'WO-2026-00491', assetId: 'GB-018', projectId: null,
      problem: 'Critical fire safety system failure - hospital floors 3 & 4',
      description: 'Emergency fire safety remediation for government district hospital. Complete replacement of suppression system on floors 3 and 4, electrical panel upgrade, emergency exit clearance.',
      priority: 'Critical', status: 'Reported',
      assignedEngineer: 'EMP-002', assignedEngineerName: 'Amit Shah',
      contractor: 'CONT-006', contractorName: 'Sunrise Construction Ltd',
      estimatedCost: 820000, approvedCost: null, spentSoFar: 0,
      startDate: null, expectedCompletion: '2026-10-15',
      createdDate: '2026-08-20', createdBy: 'EMP-002',
      defectIds: ['DEF-003', 'DEF-004'],
      type: 'Emergency',
      district: 'Ahmedabad', division: 'Central',
      approvalStatus: 'Pending',
      approvalChain: [
        { role: 'Assistant Engineer', user: 'Amit Shah', status: 'Approved', date: '2026-08-20', remarks: 'Emergency - safety critical' },
        { role: 'Executive Engineer', user: 'Amit Shah', status: 'Pending', date: null, remarks: null },
        { role: 'Chief Engineer', user: 'Rajesh Patel', status: 'Pending', date: null, remarks: null },
      ],
    },
    {
      id: 'WO-2026-00503', assetId: 'BR-GJ-042', projectId: 'PRJ-2026-004',
      problem: 'Structural cracks and rebar corrosion in bridge piers',
      description: 'Emergency structural repair for Sabarmati River Bridge. Crack injection grouting, rebar treatment, concrete restoration and protective coating on piers 3 and 7.',
      priority: 'Critical', status: 'Assigned',
      assignedEngineer: 'EMP-002', assignedEngineerName: 'Amit Shah',
      contractor: 'CONT-008', contractorName: 'Param Bridge Builders',
      estimatedCost: 4200000, approvedCost: 4200000, spentSoFar: 850000,
      startDate: '2026-09-20', expectedCompletion: '2026-11-30',
      createdDate: '2026-07-06', createdBy: 'EMP-002',
      defectIds: ['DEF-005', 'DEF-006', 'DEF-007'],
      type: 'Emergency',
      district: 'Ahmedabad', division: 'Central',
      approvalStatus: 'Approved',
      approvalChain: [
        { role: 'Assistant Engineer', user: 'Amit Shah', status: 'Approved', date: '2026-07-06', remarks: 'Critical structural issue' },
        { role: 'Executive Engineer', user: 'Amit Shah', status: 'Approved', date: '2026-07-07', remarks: 'Approved' },
        { role: 'Chief Engineer', user: 'Rajesh Patel', status: 'Approved', date: '2026-07-08', remarks: 'High priority bridge safety work' },
        { role: 'Finance', user: 'Neha Joshi', status: 'Approved', date: '2026-07-09', remarks: 'Budget allocated from emergency maintenance fund' },
      ],
    },
  ];

  // More generic work orders
  for (let i = 4; i <= 55; i++) {
    const assetId = pick(assetIds);
    const asset = db.assets.get(assetId);
    if (!asset) continue;
    const type = pick(['Preventive', 'Corrective', 'Emergency']);
    const status = pick(['Reported', 'Assigned', 'InProgress', 'Completed', 'Verified']);
    const cost = rnd(50, 5000) * 10000;
    workOrderData.push({
      id: `WO-2026-${String(i + 480).padStart(5, '0')}`,
      assetId,
      projectId: null,
      problem: `${type} maintenance required for ${asset.name}`,
      description: `${type} maintenance work order for ${asset.type.toLowerCase()} asset.`,
      priority: pick(['Low', 'Medium', 'High', 'Critical']),
      status,
      assignedEngineer: pick(['EMP-002', 'EMP-003', 'EMP-006', 'EMP-008', 'EMP-010']),
      assignedEngineerName: pick(['Amit Shah', 'Priya Mehta', 'Seema Sharma', 'Anita Patel', 'Kavita Iyer']),
      contractor: pick(['CONT-001', 'CONT-002', 'CONT-003', 'CONT-004']),
      contractorName: 'Assigned Contractor',
      estimatedCost: cost, approvedCost: status !== 'Reported' ? cost : null, spentSoFar: status === 'Completed' ? cost : Math.floor(cost * rndF(0.3, 0.8)),
      startDate: `2026-${String(rnd(7, 9)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
      expectedCompletion: `2026-${String(rnd(10, 12)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
      createdDate: `2026-${String(rnd(6, 9)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`,
      createdBy: pick(['EMP-002', 'EMP-003', 'EMP-006']),
      defectIds: [],
      type,
      district: asset.district, division: asset.division || 'Central',
      approvalStatus: status === 'Reported' ? 'Pending' : 'Approved',
      approvalChain: [],
    } as any);
  }
  workOrderData.forEach(w => db.workOrders.set(w.id, w));

  // ── BUDGETS ───────────────────────────────────────────────────────────────
  const budgetData = [
    {
      id: 'B-2026', name: 'Annual Budget 2026-27', financialYear: '2026-27',
      allocated: 24500000000, committed: 18200000000, spent: 16750000000,
      remaining: 6300000000, utilization: 68.4,
      heads: [
        { id: 'BH-001', name: 'Roads Infrastructure', district: 'ALL', allocated: 12000000000, committed: 9200000000, spent: 8400000000, remaining: 3600000000 },
        { id: 'BH-002', name: 'Buildings & Facilities', district: 'ALL', allocated: 6500000000, committed: 5100000000, spent: 4800000000, remaining: 1700000000 },
        { id: 'BH-003', name: 'Bridge Maintenance', district: 'ALL', allocated: 3500000000, committed: 2200000000, spent: 2050000000, remaining: 1450000000 },
        { id: 'BH-004', name: 'Emergency Maintenance', district: 'ALL', allocated: 1500000000, committed: 900000000, spent: 800000000, remaining: 700000000 },
        { id: 'BH-005', name: 'New Projects - Ahmedabad', district: 'Ahmedabad', allocated: 2800000000, committed: 2100000000, spent: 1900000000, remaining: 900000000 },
        { id: 'BH-006', name: 'New Projects - Gandhinagar', district: 'Gandhinagar', allocated: 1800000000, committed: 1400000000, spent: 1200000000, remaining: 600000000 },
        { id: 'BH-007', name: 'New Projects - Vadodara', district: 'Vadodara', allocated: 2200000000, committed: 1800000000, spent: 1600000000, remaining: 600000000 },
        { id: 'BH-008', name: 'New Projects - Surat', district: 'Surat', allocated: 3100000000, committed: 2400000000, spent: 2200000000, remaining: 900000000 },
        { id: 'BH-009', name: 'New Projects - Rajkot', district: 'Rajkot', allocated: 1400000000, committed: 1050000000, spent: 950000000, remaining: 450000000 },
      ],
    },
    {
      id: 'B-2025', name: 'Annual Budget 2025-26', financialYear: '2025-26',
      allocated: 21800000000, committed: 21800000000, spent: 20950000000,
      remaining: 850000000, utilization: 96.1,
      heads: [],
    },
  ];
  budgetData.forEach(b => db.budgets.set(b.id, b));

  // ── MONTHLY EXPENDITURE CHART DATA ────────────────────────────────────────
  db.monthlyExpenditure = [
    { month: 'Apr 2026', budget: 2041, spent: 1240, cumBudget: 2041, cumSpent: 1240 },
    { month: 'May 2026', budget: 2041, spent: 1580, cumBudget: 4082, cumSpent: 2820 },
    { month: 'Jun 2026', budget: 2041, spent: 1320, cumBudget: 6123, cumSpent: 4140 },
    { month: 'Jul 2026', budget: 2041, spent: 1650, cumBudget: 8164, cumSpent: 5790 },
    { month: 'Aug 2026', budget: 2041, spent: 1890, cumBudget: 10205, cumSpent: 7680 },
    { month: 'Sep 2026', budget: 2041, spent: 1540, cumBudget: 12246, cumSpent: 9220 },
    { month: 'Oct 2026', budget: 2041, spent: 0, cumBudget: 14287, cumSpent: 9220 },
    { month: 'Nov 2026', budget: 2041, spent: 0, cumBudget: 16328, cumSpent: 9220 },
    { month: 'Dec 2026', budget: 2041, spent: 0, cumBudget: 18369, cumSpent: 9220 },
    { month: 'Jan 2027', budget: 2041, spent: 0, cumBudget: 20410, cumSpent: 9220 },
    { month: 'Feb 2027', budget: 2041, spent: 0, cumBudget: 22451, cumSpent: 9220 },
    { month: 'Mar 2027', budget: 2049, spent: 0, cumBudget: 24500, cumSpent: 9220 },
  ];

  // ── MAINTENANCE RECORDS ───────────────────────────────────────────────────
  const maintenanceData = [
    { id: 'MNT-001', assetId: 'RD-GJ-1024', type: 'Preventive', description: 'Crack sealing and pothole patching', status: 'Completed', scheduledDate: '2022-11-15', completedDate: '2022-11-22', cost: 420000, contractor: 'CONT-001', engineer: 'EMP-003' },
    { id: 'MNT-002', assetId: 'RD-GJ-1024', type: 'Corrective', description: 'Shoulder repair and drainage clearing', status: 'Completed', scheduledDate: '2024-08-01', completedDate: '2024-08-15', cost: 680000, contractor: 'CONT-001', engineer: 'EMP-003' },
    { id: 'MNT-003', assetId: 'GB-018', type: 'Preventive', description: 'Elevator servicing and fire extinguisher recharge', status: 'Completed', scheduledDate: '2026-03-01', completedDate: '2026-03-05', cost: 85000, contractor: 'CONT-006', engineer: 'EMP-002' },
    { id: 'MNT-004', assetId: 'BR-GJ-042', type: 'Preventive', description: 'Bridge deck joint sealing and railing painting', status: 'Completed', scheduledDate: '2024-12-01', completedDate: '2024-12-20', cost: 1200000, contractor: 'CONT-008', engineer: 'EMP-002' },
    { id: 'MNT-005', assetId: 'RD-GJ-0912', type: 'Preventive', description: 'Road marking renewal and signage replacement', status: 'Overdue', scheduledDate: '2026-07-01', completedDate: null as unknown as string, cost: 320000, contractor: null as unknown as string, engineer: 'EMP-005' },
    { id: 'MNT-006', assetId: 'GB-024', type: 'Preventive', description: 'Annual building condition check and minor repairs', status: 'Overdue', scheduledDate: '2026-06-01', completedDate: null as unknown as string, cost: 180000, contractor: null as unknown as string, engineer: 'EMP-006' },
  ];

  for (let i = 7; i <= 60; i++) {
    const assetId = pick(assetIds);
    maintenanceData.push({
      id: `MNT-${String(i).padStart(3, '0')}`,
      assetId,
      type: pick(['Preventive', 'Corrective', 'Emergency']),
      description: 'Routine maintenance and repair work',
      status: pick(['Completed', 'Completed', 'InProgress', 'Overdue', 'Scheduled']),
      scheduledDate: `2026-${String(rnd(1, 9)).padStart(2, '0')}-01`,
      completedDate: null as unknown as string,
      cost: rnd(50, 2000) * 10000,
      contractor: pick([null, 'CONT-001', 'CONT-002', 'CONT-003']) as string,
      engineer: pick(['EMP-002', 'EMP-003', 'EMP-006', 'EMP-008']),
    });
  }
  maintenanceData.forEach(m => db.maintenance.set(m.id, m));

  // ── LIFECYCLE EVENTS ──────────────────────────────────────────────────────
  const lifecycleEvents = [
    { assetId: 'RD-GJ-1024', date: '2017-04-01', event: 'Project Approved', type: 'milestone', description: 'Ahmedabad Ring Road Section 4 construction project approved by State Cabinet. Budget: ₹4.8 Cr.', user: 'Rajesh Patel', role: 'Chief Engineer' },
    { assetId: 'RD-GJ-1024', date: '2017-08-15', event: 'Tender Issued', type: 'procurement', description: 'Tender floated for construction. 8 bidders responded.', user: 'Neha Joshi', role: 'Finance Officer' },
    { assetId: 'RD-GJ-1024', date: '2017-11-01', event: 'Contract Awarded', type: 'procurement', description: 'Contract awarded to ABC Infrastructure Pvt Ltd for ₹4.62 Cr.', user: 'Rajesh Patel', role: 'Chief Engineer' },
    { assetId: 'RD-GJ-1024', date: '2018-01-10', event: 'Construction Started', type: 'construction', description: 'Site mobilization and construction commenced.', user: 'Priya Mehta', role: 'Assistant Engineer' },
    { assetId: 'RD-GJ-1024', date: '2018-11-28', event: 'Construction Completed', type: 'construction', description: 'Construction completed within budget. Final inspection passed.', user: 'Amit Shah', role: 'Executive Engineer' },
    { assetId: 'RD-GJ-1024', date: '2018-12-15', event: 'Asset Commissioned', type: 'commissioning', description: 'Road officially commissioned and opened to traffic.', user: 'Rajesh Patel', role: 'Chief Engineer' },
    { assetId: 'RD-GJ-1024', date: '2020-05-10', event: 'Routine Inspection', type: 'inspection', description: 'Annual routine inspection completed. Condition: 82/100 (Excellent). No major defects.', user: 'Priya Mehta', role: 'Assistant Engineer' },
    { assetId: 'RD-GJ-1024', date: '2022-11-15', event: 'Preventive Maintenance', type: 'maintenance', description: 'Crack sealing and pothole patching completed. Cost: ₹4.2L.', user: 'Priya Mehta', role: 'Assistant Engineer' },
    { assetId: 'RD-GJ-1024', date: '2024-03-20', event: 'Routine Inspection', type: 'inspection', description: 'Condition assessment: 68/100 (Good). Minor surface wear observed.', user: 'Priya Mehta', role: 'Assistant Engineer' },
    { assetId: 'RD-GJ-1024', date: '2024-08-15', event: 'Corrective Maintenance', type: 'maintenance', description: 'Shoulder repair and drainage clearing. Cost: ₹6.8L.', user: 'Priya Mehta', role: 'Assistant Engineer' },
    { assetId: 'RD-GJ-1024', date: '2026-06-05', event: 'Routine Inspection', type: 'inspection', description: 'Condition deteriorated to 52/100 (Fair). Pavement fatigue observed. Early monitoring recommended.', user: 'Priya Mehta', role: 'Assistant Engineer' },
    { assetId: 'RD-GJ-1024', date: '2026-09-12', event: 'Critical Inspection Finding', type: 'inspection', description: 'CRITICAL: Condition dropped to 38/100 (Poor). Severe pavement deterioration. 4 defects reported. Immediate work order raised.', user: 'Priya Mehta', role: 'Assistant Engineer' },
    { assetId: 'RD-GJ-1024', date: '2026-09-13', event: 'Work Order Created', type: 'workorder', description: 'WO-2026-00482 created for immediate corrective maintenance. Estimated cost: ₹18.5L.', user: 'Priya Mehta', role: 'Assistant Engineer' },
    { assetId: 'RD-GJ-1024', date: '2026-09-14', event: 'Work Order Approved', type: 'approval', description: 'WO-2026-00482 approved by Chief Engineer. ABC Infrastructure assigned.', user: 'Rajesh Patel', role: 'Chief Engineer' },
    { assetId: 'RD-GJ-1024', date: '2026-09-14', event: 'Maintenance Started', type: 'maintenance', description: 'Corrective maintenance commenced by ABC Infrastructure Pvt Ltd.', user: 'Priya Mehta', role: 'Assistant Engineer' },
  ];

  lifecycleEvents.forEach((e, i) => {
    const id = `LCE-${String(i + 1).padStart(4, '0')}`;
    db.lifecycleEvents.set(id, { id, ...e });
  });

  // ── DOCUMENTS ─────────────────────────────────────────────────────────────
  const docData = [
    { id: 'DOC-001', entityType: 'Asset', entityId: 'RD-GJ-1024', name: 'Original Construction DPR', type: 'Technical Report', size: '4.2MB', uploadedBy: 'EMP-003', uploadedDate: '2018-12-15', version: '1.0' },
    { id: 'DOC-002', entityType: 'Asset', entityId: 'RD-GJ-1024', name: 'Inspection Report Sep 2026', type: 'Inspection Report', size: '2.8MB', uploadedBy: 'EMP-003', uploadedDate: '2026-09-12', version: '1.0' },
    { id: 'DOC-003', entityType: 'WorkOrder', entityId: 'WO-2026-00482', name: 'Work Order Approval Letter', type: 'Government Order', size: '0.5MB', uploadedBy: 'EMP-002', uploadedDate: '2026-09-14', version: '1.0' },
    { id: 'DOC-004', entityType: 'Asset', entityId: 'GB-018', name: 'Fire Safety Inspection Report', type: 'Inspection Report', size: '1.8MB', uploadedBy: 'EMP-002', uploadedDate: '2026-08-20', version: '1.0' },
    { id: 'DOC-005', entityType: 'Asset', entityId: 'BR-GJ-042', name: 'Structural Assessment Report', type: 'Technical Report', size: '8.5MB', uploadedBy: 'EMP-002', uploadedDate: '2026-07-05', version: '1.0' },
    { id: 'DOC-006', entityType: 'Project', entityId: 'PRJ-2026-001', name: 'Contract Agreement - ABC Infrastructure', type: 'Contract', size: '1.2MB', uploadedBy: 'EMP-005', uploadedDate: '2026-01-12', version: '1.0' },
    { id: 'DOC-007', entityType: 'Project', entityId: 'PRJ-2026-001', name: 'Tender Document', type: 'Tender Document', size: '3.4MB', uploadedBy: 'EMP-005', uploadedDate: '2025-11-01', version: '1.0' },
  ];
  docData.forEach(d => db.documents.set(d.id, d));

  // ── AUDIT LOGS ────────────────────────────────────────────────────────────
  const auditData = [
    { id: 'AUD-001', timestamp: '2026-09-28T10:42:00Z', userId: 'u4', userName: 'Priya Mehta', userRole: 'Assistant Engineer', action: 'UPDATE', entity: 'Asset', entityId: 'RD-GJ-1024', description: 'Condition updated after inspection', oldValue: { condition: 52, conditionLabel: 'Fair' }, newValue: { condition: 38, conditionLabel: 'Poor' }, reason: 'Routine Inspection INS-001', ipAddress: '192.168.1.10' },
    { id: 'AUD-002', timestamp: '2026-09-28T10:45:00Z', userId: 'u4', userName: 'Priya Mehta', userRole: 'Assistant Engineer', action: 'CREATE', entity: 'WorkOrder', entityId: 'WO-2026-00482', description: 'Work order created for RD-GJ-1024', oldValue: null, newValue: { priority: 'High', estimatedCost: 1850000 }, reason: 'Critical inspection finding', ipAddress: '192.168.1.10' },
    { id: 'AUD-003', timestamp: '2026-09-28T11:00:00Z', userId: 'u3', userName: 'Amit Shah', userRole: 'Executive Engineer', action: 'APPROVE', entity: 'WorkOrder', entityId: 'WO-2026-00482', description: 'Work order approved by Executive Engineer', oldValue: { status: 'Pending' }, newValue: { status: 'Approved' }, reason: 'Urgent corrective maintenance', ipAddress: '192.168.1.20' },
    { id: 'AUD-004', timestamp: '2026-09-28T11:15:00Z', userId: 'u2', userName: 'Rajesh Patel', userRole: 'Chief Engineer', action: 'APPROVE', entity: 'WorkOrder', entityId: 'WO-2026-00482', description: 'Work order approved by Chief Engineer', oldValue: { status: 'Pending CE' }, newValue: { status: 'Fully Approved' }, reason: 'High priority road repair', ipAddress: '10.0.0.1' },
    { id: 'AUD-005', timestamp: '2026-08-20T14:30:00Z', userId: 'u3', userName: 'Amit Shah', userRole: 'Executive Engineer', action: 'CREATE', entity: 'Inspection', entityId: 'INS-002', description: 'Fire safety inspection conducted for GB-018', oldValue: null, newValue: { severityRating: 'Critical' }, reason: 'Scheduled fire safety inspection', ipAddress: '192.168.1.20' },
    { id: 'AUD-006', timestamp: '2026-08-20T15:00:00Z', userId: 'u3', userName: 'Amit Shah', userRole: 'Executive Engineer', action: 'UPDATE', entity: 'Asset', entityId: 'GB-018', description: 'Condition updated after fire safety inspection', oldValue: { condition: 58 }, newValue: { condition: 45 }, reason: 'Critical fire safety defects found', ipAddress: '192.168.1.20' },
    { id: 'AUD-007', timestamp: '2026-07-05T09:20:00Z', userId: 'u3', userName: 'Amit Shah', userRole: 'Executive Engineer', action: 'CREATE', entity: 'Inspection', entityId: 'INS-003', description: 'Structural inspection of BR-GJ-042', oldValue: null, newValue: { severityRating: 'Critical' }, reason: 'Annual structural inspection', ipAddress: '192.168.1.20' },
    { id: 'AUD-008', timestamp: '2026-07-06T10:00:00Z', userId: 'u3', userName: 'Amit Shah', userRole: 'Executive Engineer', action: 'CREATE', entity: 'WorkOrder', entityId: 'WO-2026-00503', description: 'Emergency work order for bridge structural repair', oldValue: null, newValue: { priority: 'Critical', estimatedCost: 4200000 }, reason: 'Critical structural defects in bridge', ipAddress: '192.168.1.20' },
    { id: 'AUD-009', timestamp: '2026-09-14T09:30:00Z', userId: 'u4', userName: 'Priya Mehta', userRole: 'Assistant Engineer', action: 'UPDATE', entity: 'WorkOrder', entityId: 'WO-2026-00482', description: 'Contractor assigned to work order', oldValue: { contractor: null }, newValue: { contractor: 'CONT-001' }, reason: 'Contractor mobilization', ipAddress: '192.168.1.10' },
    { id: 'AUD-010', timestamp: '2026-09-15T08:00:00Z', userId: 'u4', userName: 'Priya Mehta', userRole: 'Assistant Engineer', action: 'UPDATE', entity: 'WorkOrder', entityId: 'WO-2026-00482', description: 'Work order status changed to In Progress', oldValue: { status: 'Assigned' }, newValue: { status: 'InProgress' }, reason: 'Maintenance work commenced on site', ipAddress: '192.168.1.10' },
  ];

  for (let i = 11; i <= 60; i++) {
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'COMPLETE', 'ASSIGN'];
    const entities = ['Asset', 'Inspection', 'WorkOrder', 'Defect', 'Project', 'Budget'];
    const users = [
      { id: 'u1', name: 'Suresh Kumar', role: 'Super Admin' },
      { id: 'u2', name: 'Rajesh Patel', role: 'Chief Engineer' },
      { id: 'u3', name: 'Amit Shah', role: 'Executive Engineer' },
      { id: 'u4', name: 'Priya Mehta', role: 'Assistant Engineer' },
      { id: 'u5', name: 'Neha Joshi', role: 'Finance Officer' },
    ];
    const user = pick(users);
    const entity = pick(entities);
    const action = pick(actions);
    const hour = String(rnd(8, 18)).padStart(2, '0');
    const min = String(rnd(0, 59)).padStart(2, '0');
    const day = String(rnd(1, 28)).padStart(2, '0');
    const month = String(rnd(6, 9)).padStart(2, '0');
    auditData.push({
      id: `AUD-${String(i).padStart(3, '0')}`,
      timestamp: `2026-${month}-${day}T${hour}:${min}:00Z`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      entity,
      entityId: `${entity.toUpperCase().slice(0, 3)}-${rnd(1000, 9999)}`,
      description: `${action} performed on ${entity} record`,
      oldValue: {} as any,
      newValue: {} as any,
      reason: 'Routine update',
      ipAddress: `192.168.${rnd(1, 10)}.${rnd(1, 255)}`,
    });
  }
  auditData.forEach(a => db.auditLogs.set(a.id, a));

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  const notifications = [
    { id: 'NOTIF-001', type: 'warning', title: 'Road inspection overdue', message: 'RD-GJ-1024 inspection was due on 10 Sep 2026. Please schedule immediately.', entityId: 'RD-GJ-1024', entityType: 'Asset', read: false, createdAt: '2026-09-15T09:00:00Z' },
    { id: 'NOTIF-002', type: 'critical', title: 'Critical defect reported', message: 'Bridge BR-GJ-042 has a critical structural defect. Immediate action required.', entityId: 'BR-GJ-042', entityType: 'Asset', read: false, createdAt: '2026-09-10T11:00:00Z' },
    { id: 'NOTIF-003', type: 'warning', title: 'Project completion deadline approaching', message: 'PRJ-2026-001 is due on 30 Nov 2026. Current progress: 72%.', entityId: 'PRJ-2026-001', entityType: 'Project', read: false, createdAt: '2026-09-20T08:00:00Z' },
    { id: 'NOTIF-004', type: 'warning', title: 'Budget utilization above 85%', message: 'Division Central has utilized 86% of annual maintenance allocation.', entityId: null, entityType: 'Budget', read: true, createdAt: '2026-09-18T10:00:00Z' },
    { id: 'NOTIF-005', type: 'critical', title: 'Fire safety inspection overdue', message: 'GB-018 fire safety work order WO-2026-00491 SLA breached by 32 days.', entityId: 'GB-018', entityType: 'Asset', read: false, createdAt: '2026-09-22T09:00:00Z' },
    { id: 'NOTIF-006', type: 'success', title: 'Work order completed', message: 'WO-2026-00471 for COMP-0012 has been completed and verified.', entityId: 'WO-2026-00471', entityType: 'WorkOrder', read: true, createdAt: '2026-09-25T15:00:00Z' },
    { id: 'NOTIF-007', type: 'warning', title: 'Contract document expiring', message: 'Contract for CONT-003 expires in 15 days. Renewal required.', entityId: 'CONT-003', entityType: 'Contractor', read: false, createdAt: '2026-09-26T09:00:00Z' },
    { id: 'NOTIF-008', type: 'info', title: 'System Insight: Condition trend', message: 'Road RD-GJ-1024 condition declined from 68 to 42 over last 2 inspections.', entityId: 'RD-GJ-1024', entityType: 'Asset', read: false, createdAt: '2026-09-27T08:00:00Z' },
  ];
  notifications.forEach(n => db.notifications.set(n.id, n));

  console.log('✅ Database seeded successfully.');
  console.log(`   Assets: ${db.assets.size}`);
  console.log(`   Projects: ${db.projects.size}`);
  console.log(`   Inspections: ${db.inspections.size}`);
  console.log(`   Defects: ${db.defects.size}`);
  console.log(`   Work Orders: ${db.workOrders.size}`);
  console.log(`   Employees: ${db.employees.size}`);
  console.log(`   Contractors: ${db.contractors.size}`);
  console.log(`   Audit Logs: ${db.auditLogs.size}`);
}
