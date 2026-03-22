import { FiguresQaHub } from './FiguresQaHub';
import { EDX4MA1_FIGURES_ROOT, EDX4MA1_REMOTE_BASE_URL } from '../../services/figuresService';
import { figureReviewService4MA1 } from '../../services/figureReviewService';

export function FiguresQa4MA1() {
  return (
    <FiguresQaHub
      title="Figures QA — Edexcel 4MA1"
      initialFiguresRoot={EDX4MA1_FIGURES_ROOT}
      initialRemoteBaseUrl={EDX4MA1_REMOTE_BASE_URL}
      reviewService={figureReviewService4MA1}
    />
  );
}
