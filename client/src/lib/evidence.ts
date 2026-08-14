/* Design reminder: evidence gates are financial controls, not decorative status labels. */
export type EvidenceGate = "E0" | "E1" | "E2" | "E3";

export const DEFAULT_EVIDENCE_GATES: Record<string, EvidenceGate> = {
  "01": "E1", "02": "E1", "03": "E1", "04": "E1", "05": "E1", "06": "E0", "07": "E0", "08": "E0",
  "GTM-01": "E2", "GTM-02": "E1", "GTM-03": "E2", "GTM-04": "E1", "GTM-05": "E1", "GTM-06": "E0", "GTM-07": "E0",
};

export const isHardRoiGate = (gate: EvidenceGate | undefined) => gate === "E2" || gate === "E3";

export const gateDescription: Record<EvidenceGate, string> = {
  E0: "Directional — value path only",
  E1: "Assessable — baseline still pending",
  E2: "Validated — eligible for Base ROI",
  E3: "Realized — operating evidence confirmed",
};
