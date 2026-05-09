import type { CommandPlan } from "./types.js";

export function requiresExplicitExecution(plans: CommandPlan[]): boolean {
  return plans.some((plan) => plan.risk === "local-write" || plan.risk === "remote-interactive");
}

export function summarizeRisks(plans: CommandPlan[]): string[] {
  return [...new Set(plans.map((plan) => plan.risk))].sort();
}
