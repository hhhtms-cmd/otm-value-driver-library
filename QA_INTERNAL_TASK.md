# QA — Internal Task-first Runway

## Verified task path

The Decision Archive workbench now exposes three task previews. The Freight Audit path states the immediate task, its minimum inputs, and the resulting output before the user opens it.

The Freight Audit task was exercised end to end in the browser: select a concrete issue, confirm the minimum evidence pack, confirm the meeting roles, and generate the **Freight Audit Exploration Brief**. The resulting page contains a customer-facing meeting focus, requested materials, invitee roles, a 45-minute agenda, and both copy and download actions. Detailed Discovery is offered only as an optional follow-up.

## Language behavior

The task copy was checked in Spanish and Chinese. The task stores selections using language-neutral indices, so the selected issue can be rendered in the current language rather than retaining a stale phrase from the previously selected locale.

## Boundary verified

The first task does not ask the user to make an Evidence Gate or ROI decision. Those activities remain accessible later in the Decision Archive, after the initial customer work session has been prepared.

## Default entry routing

The root URL now loads the Decision Archive / Internal Workbench by default. The workbench retains a visible “客户探索入口” link to `/client-brief`, where the customer-oriented six-signal exploration flow remains available as a separate experience.

## Customer self-service correction

The Decision Archive is now narrated for the person assessing their own transport operation. Visible workbench language uses **your question**, **your information**, **your colleagues**, and **your discussion brief** rather than referring to the user as a customer or assuming a presales/consulting role.

The Freight Audit task now produces a **Freight Audit Discussion Brief** for the user’s own internal team. Its three steps ask the user to select the issue they want to clarify, identify information inside their team, and involve colleagues who know the process, payments, or systems trail. Browser verification confirmed the task opens after the user selects the Freight Audit path and re-renders correctly in Chinese.

## Responsive visual check

Desktop and 390px-wide mobile screenshots were reviewed after the language change. The Decision Archive hero, customer-first headline, primary exploration action, and the first path starter remain legible without text overlap. The mobile composition preserves the archive style while placing the customer’s next action within the first screen.

## Shipment Optimization priority correction

Shipment Optimization now appears first in the hero starter and in the Assessment Runway, ahead of Freight Audit, Visibility, and broader library exploration. Its Driver mapping is OTM / 01, so the selected library record is **Planning & Cost-to-Serve** rather than the former Freight Audit default.

The Shipment Optimization task was exercised end to end in Chinese. The user can choose a live planning constraint, retain a minimum planning-information pack, choose colleagues, and generate a **Shipment Optimization Discussion Brief**. The completion state contains the expected brief and no Freight Audit heading, confirming the primary route does not fall back to the audit task.
