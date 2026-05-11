export type PipelineStage = "lead" | "contact" | "proposal" | "negotiation" | "closed"

export interface Deal {
  id: string
  title: string
  value: number
  company: string
  contact: string
  email: string
  stage: PipelineStage
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

export const PIPELINE_STAGES = [
  { id: "lead", label: "Lead" },
  { id: "contact", label: "Contact Made" },
  { id: "proposal", label: "Proposal" },
  { id: "negotiation", label: "Negotiation" },
  { id: "closed", label: "Closed Won" }
] as const
