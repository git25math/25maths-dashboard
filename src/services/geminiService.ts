export type {
  LessonPlanContext,
  UnitPlanningSubUnit,
  UnitPlanningContext,
  ObjectivePrepContext,
  CategorizationResult,
  ConsolidatedIdea,
  ConsolidatedWorkLog,
  ConsolidatedSOP,
  WeaknessInput,
  SmartTasksInput,
  EmailDigestResult,
  SubjectReportInput,
  ParentMeetingNotesInput,
  ActionPlanInput,
} from './gemini/shared';

import { meetingAiService } from './gemini/meetingAiService';
import { studentAiService } from './gemini/studentAiService';
import { teachingAiService } from './gemini/teachingAiService';
import { productivityAiService } from './gemini/productivityAiService';
import { paperAiService } from './gemini/paperAiService';

export const geminiService = {
  ...meetingAiService,
  ...studentAiService,
  ...teachingAiService,
  ...productivityAiService,
  ...paperAiService,
};
