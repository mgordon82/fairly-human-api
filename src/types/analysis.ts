export interface FairlyHumanAnalysis {
  analysisSummary: string;
  unfairnessScore: number; // 0–100
  factors: {
    label: string;
    description: string;
    weight: number; // 0–1
  }[];
  suggestions: string[];
  resourceLinks: {
    label: string;
    url: string;
  }[];
  reframes: string[];
  safetyNotes?: string[];
  metadata: {
    storyLength: number;
    receivedAt: string;
    context?: any;
    model?: string;
  };
}
