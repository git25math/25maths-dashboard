export const DEFAULT_PDF_SINGLEQUESTIONS_RAW_ROOT =
  '/Users/zhuxingzhe/Project/ExamBoard/25maths-cie0580-pdf-singlequestions-raw';

export function buildPdfSingleQuestionsRawDir(pdfRoot: string, paperKey: string): string {
  const root = pdfRoot.replace(/\/$/, '');
  return `${root}/${paperKey}/raw`;
}

