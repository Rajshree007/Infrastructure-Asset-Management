export interface PriorityFactors {
  conditionScore: number;
  defectSeverity: number;     // 0=none, 1=low, 2=medium, 3=high, 4=critical
  overdueMaintenanceDays: number;
  publicImpact: number;       // 0=none, 1=low, 2=medium, 3=high
  assetCriticality: number;   // 0=low, 1=medium, 2=high, 3=critical
  safetyRisk: number;         // 0=none, 1=low, 2=medium, 3=high
  openDefectsCount: number;
}

export interface PriorityExplanationItem {
  factor: string;
  value: string;
  contribution: number;
  status: 'critical' | 'warning' | 'good' | 'neutral';
}

export interface PriorityResult {
  score: number;
  label: 'Critical' | 'High' | 'Medium' | 'Low';
  explanation: PriorityExplanationItem[];
  recommendedAction: string;
  reasons: string[];
}

const RECOMMENDED_ACTIONS: Record<string, string> = {
  Critical: 'Immediate Corrective Maintenance',
  High: 'Schedule Urgent Maintenance',
  Medium: 'Plan Preventive Maintenance',
  Low: 'Monitor — No Immediate Action Required',
};

export function calculatePriority(asset: any, factors: PriorityFactors): PriorityResult {
  const {
    conditionScore, defectSeverity, overdueMaintenanceDays,
    publicImpact, assetCriticality, safetyRisk, openDefectsCount,
  } = factors;

  // Weighted contributions (max total > 100, clamped at end)
  const conditionContrib  = (100 - conditionScore) * 0.30;   // weight 30%, max 30
  const defectContrib     = defectSeverity * 11;              // max 44
  const overdueContrib    = Math.min(overdueMaintenanceDays / 3, 15); // max 15
  const impactContrib     = publicImpact * 4;                 // max 12
  const critContrib       = assetCriticality * 4;             // max 12
  const safetyContrib     = safetyRisk * 3;                   // max 9
  const defectCountContrib = Math.min(openDefectsCount * 2, 8); // max 8

  const raw = conditionContrib + defectContrib + overdueContrib + impactContrib + critContrib + safetyContrib + defectCountContrib;
  const score = Math.min(100, Math.max(0, Math.round(raw)));

  let label: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (score >= 80) label = 'Critical';
  else if (score >= 60) label = 'High';
  else if (score >= 40) label = 'Medium';

  const condStatus = conditionScore < 40 ? 'critical' : conditionScore < 60 ? 'warning' : 'good';
  const defStatus  = defectSeverity >= 3 ? 'critical' : defectSeverity >= 2 ? 'warning' : 'good';
  const ovrStatus  = overdueMaintenanceDays > 30 ? 'critical' : overdueMaintenanceDays > 14 ? 'warning' : 'good';
  const impStatus  = publicImpact >= 2 ? 'warning' : 'neutral';
  const critStatus = assetCriticality >= 3 ? 'critical' : assetCriticality >= 2 ? 'warning' : 'neutral';
  const safStatus  = safetyRisk >= 2 ? 'critical' : safetyRisk >= 1 ? 'warning' : 'good';

  const condLabel = conditionScore < 40 ? 'Critical' : conditionScore < 60 ? 'Poor' : conditionScore < 75 ? 'Fair' : 'Good';
  const defLabel = ['None', 'Low', 'Medium', 'High', 'Critical'][defectSeverity];
  const impLabel = ['None', 'Low', 'Medium', 'High'][publicImpact];
  const critLabel = ['Low', 'Medium', 'High', 'Critical'][assetCriticality];
  const safLabel = ['None', 'Low', 'Medium', 'High'][safetyRisk];

  const explanation: PriorityExplanationItem[] = [
    { factor: 'Condition Score', value: `${conditionScore}/100 (${condLabel})`, contribution: Math.round(conditionContrib), status: condStatus },
    { factor: 'Defect Severity', value: defLabel, contribution: Math.round(defectContrib), status: defStatus },
    { factor: 'Maintenance Overdue', value: overdueMaintenanceDays > 0 ? `${overdueMaintenanceDays} days` : 'None', contribution: Math.round(overdueContrib), status: ovrStatus },
    { factor: 'Public Impact', value: impLabel, contribution: Math.round(impactContrib), status: impStatus },
    { factor: 'Asset Criticality', value: critLabel, contribution: Math.round(critContrib), status: critStatus },
    { factor: 'Safety Risk', value: safLabel, contribution: Math.round(safetyContrib), status: safStatus },
    { factor: 'Open Defects', value: `${openDefectsCount} open defects`, contribution: Math.round(defectCountContrib), status: openDefectsCount >= 3 ? 'warning' : 'neutral' },
  ];

  const reasons: string[] = [];
  if (conditionScore < 40) reasons.push(`Condition score ${conditionScore}/100 — requires immediate intervention`);
  if (defectSeverity >= 3) reasons.push(`${defLabel}-severity defects recorded`);
  if (overdueMaintenanceDays > 30) reasons.push(`Maintenance overdue by ${overdueMaintenanceDays} days`);
  if (assetCriticality >= 3) reasons.push(`Asset criticality rated Critical`);
  if (safetyRisk >= 2) reasons.push(`High safety risk to public`);
  if (publicImpact >= 2) reasons.push(`High public impact — serves large population`);
  if (openDefectsCount >= 3) reasons.push(`${openDefectsCount} open defects unresolved`);

  return {
    score,
    label,
    explanation,
    recommendedAction: RECOMMENDED_ACTIONS[label],
    reasons,
  };
}
