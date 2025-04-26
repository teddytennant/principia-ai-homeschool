import { Injectable } from '@nestjs/common';
import axios from 'axios';

const MGPD_THRESHOLDS = {
  HINTS: 0.30,
  EXAMPLES: 0.60,
  SOLUTIONS: 0.90,
};

function getTier(score: number): number {
  if (score < MGPD_THRESHOLDS.HINTS) return 0;
  if (score < MGPD_THRESHOLDS.EXAMPLES) return 1;
  if (score < MGPD_THRESHOLDS.SOLUTIONS) return 2;
  return 3;
}

@Injectable()
export class MasteryService {
  async evaluate(body: any) {
    // Call Python microservice
    const { data } = await axios.post('http://localhost:5005/infer', {
      correct: body.correct ? 1 : 0,
      time_ms: body.time_ms,
      hint_count: body.hint_count,
    });
    const score = data.score;
    const tier = getTier(score);
    return { score, tier };
  }
}
