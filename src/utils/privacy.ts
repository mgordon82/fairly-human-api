// src/utils/privacy.ts

export interface StoryAuditMetadata {
  storyLength: number;
  receivedAt: string;
  unfairnessScore?: number;
  model?: string;
}

/**
 * Scrub obvious PII like email addresses and phone numbers before
 * sending to the model. We intentionally do NOT try to strip all
 * names, as that would harm usefulness and is hard to do reliably.
 */
export function scrubStoryText(raw: string): string {
  let scrubbed = raw;

  // Remove email addresses
  scrubbed = scrubbed.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    '[EMAIL]'
  );

  // Remove US-style phone numbers (simple pattern)
  scrubbed = scrubbed.replace(
    /\b(?:\+1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g,
    '[PHONE]'
  );

  return scrubbed;
}

const PRIVACY_MODE = process.env.FH_PRIVACY_MODE || 'strict';
// 'strict' | 'debug'

export function logStoryAudit(meta: StoryAuditMetadata) {
  if (PRIVACY_MODE === 'strict') {
    // In strict mode, do nothing (no audits at all).
    return;
  }

  // In debug mode, log minimal metadata (still no story text or IP).
  const { storyLength, receivedAt, unfairnessScore, model } = meta;

  console.log(
    '[FairlyHuman Audit]',
    JSON.stringify(
      {
        storyLength,
        receivedAt,
        unfairnessScore,
        model
      },
      null,
      2
    )
  );
}
