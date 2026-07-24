export type AuthorizationRiskInput = {
  diagnosticNotes: string;
  lineItemDescription: string;
  customerExplanation: string;
  partsEstimate: number;
  laborEstimate: number;
};

export type AuthorizationRiskResult = {
  score: number;
  decision: "ready" | "needs_revision" | "blocked";
  reasons: string[];
  missingEvidence: string[];
  customerQuestions: string[];
  lineItemRewrite: string;
  model: string;
};

const schema = {
  type: "object",
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    decision: { type: "string", enum: ["ready", "needs_revision", "blocked"] },
    reasons: { type: "array", items: { type: "string" } },
    missingEvidence: { type: "array", items: { type: "string" } },
    customerQuestions: { type: "array", items: { type: "string" } },
    lineItemRewrite: { type: "string" },
  },
  required: ["score", "decision", "reasons", "missingEvidence", "customerQuestions", "lineItemRewrite"],
  additionalProperties: false,
};

function stringList(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean).slice(0, 8) : [];
}

function parseResult(value: unknown, model: string): AuthorizationRiskResult {
  if (!value || typeof value !== "object") throw new Error("Authorization agent returned an invalid response.");
  const result = value as Record<string, unknown>;
  const score = Math.max(0, Math.min(100, Math.round(Number(result.score))));
  const decision = result.decision;
  if (!Number.isFinite(score) || !["ready", "needs_revision", "blocked"].includes(String(decision))) {
    throw new Error("Authorization agent returned an invalid decision.");
  }
  return {
    score,
    decision: decision as AuthorizationRiskResult["decision"],
    reasons: stringList(result.reasons),
    missingEvidence: stringList(result.missingEvidence),
    customerQuestions: stringList(result.customerQuestions),
    lineItemRewrite: String(result.lineItemRewrite || "").trim(),
    model,
  };
}

export function validateAuthorizationRiskInput(input: AuthorizationRiskInput) {
  const normalized = {
    diagnosticNotes: input.diagnosticNotes.trim(),
    lineItemDescription: input.lineItemDescription.trim(),
    customerExplanation: input.customerExplanation.trim(),
    partsEstimate: Number(input.partsEstimate),
    laborEstimate: Number(input.laborEstimate),
  };
  if (normalized.diagnosticNotes.length < 12) throw new Error("Add specific measured diagnostic evidence.");
  if (normalized.lineItemDescription.length < 8) throw new Error("Add a specific repair line-item description.");
  if (normalized.customerExplanation.length < 12) throw new Error("Add a customer-facing explanation.");
  if (![normalized.partsEstimate, normalized.laborEstimate].every(Number.isFinite)) throw new Error("Estimates must be valid numbers.");
  if (normalized.partsEstimate < 0 || normalized.laborEstimate < 0) throw new Error("Estimates cannot be negative.");
  if (normalized.partsEstimate + normalized.laborEstimate <= 0) throw new Error("At least one estimate category must be greater than zero.");
  return normalized;
}

export async function runAuthorizationRiskAgent(input: AuthorizationRiskInput): Promise<AuthorizationRiskResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");
  const normalized = validateAuthorizationRiskInput(input);
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_schema", json_schema: { name: "authorization_risk", strict: true, schema } },
      messages: [
        {
          role: "system",
          content: "You are AutoRepairOS Authorization Risk Agent. Audit whether a repair line item is specific, attributable only to supplied measured evidence, understandable to a customer, and safe to present for an independent approval decision. Never diagnose, infer urgency or safety, invent facts, add parts, or expand repair scope. Block when scope is vague or unsupported. Mark needs_revision when evidence exists but wording or price categorization needs clarification. The rewrite may only reorganize facts already supplied.",
        },
        { role: "user", content: JSON.stringify(normalized) },
      ],
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Authorization agent request failed with status ${response.status}.`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Authorization agent returned no structured content.");
  return parseResult(JSON.parse(content), model);
}
