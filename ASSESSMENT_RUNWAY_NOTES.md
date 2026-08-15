# Assessment Runway — Product Notes

## Current-state finding

The existing Dashboard already contains the core assessment capabilities: a 15-domain library, selected-driver detail, Discovery questions, customer evidence collection, E0–E3 evidence gates, ROI calculations, scenario comparison and export. The usability break is not a missing calculation; it is the absence of an explicit task sequence connecting these capabilities.

## Design decision

Assessment Runway will become the primary working entry on the main Dashboard. It will make one short path visible:

1. **Name the customer problem** — Freight cost and invoice control, visibility and exceptions, or an adjacent One Oracle issue.
2. **Choose the starting driver** — The application identifies a focused Driver instead of asking users to interpret all 15 domains.
3. **Run Discovery** — The user moves to the question and customer-evidence workspace for the selected Phase 1 track.
4. **Review the evidence gate** — E0/E1 remain opportunity-only; only E2/E3 unlock Base ROI.
5. **Calculate and export** — The ROI workspace becomes available only as the next step after evidence has been reviewed.

The Runway will not delete the library, workflow, ROI workspace or export features. It will provide an always-legible status, a single next action and direct links into each existing work area. It also preserves the IBM TLS Phase 1 focus on Freight Audit and Visibility, while routing other needs to the wider One Oracle library rather than pretending that one generic discovery file fits every capability.
