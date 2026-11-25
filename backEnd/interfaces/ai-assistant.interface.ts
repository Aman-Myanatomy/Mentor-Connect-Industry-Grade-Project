export interface ITraceStep {
  step: string;
  ms: number;
  detail: unknown;
}

export interface IRagChunk {
  id: string;
  type: string;
  title: string;
  text: string;
  mentorId?: string;
  score: number;
}
