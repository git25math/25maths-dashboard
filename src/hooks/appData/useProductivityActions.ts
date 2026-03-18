import { Dispatch, SetStateAction } from 'react';
import { Idea, SOP, WorkLog, Goal, Bookmark, SchoolEvent, MeetingRecord, Task, EmailDigest, Project, ToastApi } from '../../types';
import { ProjectMilestone, DevLogEntry, DevLogThread } from '../../types/chronicle';
import { useIdeaActions } from './useIdeaActions';
import { useSOPActions } from './useSOPActions';
import { useWorkLogActions } from './useWorkLogActions';
import { useGoalActions } from './useGoalActions';
import { useBookmarkActions } from './useBookmarkActions';
import { useSchoolEventActions } from './useSchoolEventActions';
import { useMeetingActions } from './useMeetingActions';
import { useEmailDigestActions } from './useEmailDigestActions';
import { useTaskActions } from './useTaskActions';
import { useProjectActions } from './useProjectActions';
import { useMilestoneActions } from './useMilestoneActions';
import { useDevlogActions } from './useDevlogActions';
import { useThreadActions } from './useThreadActions';

interface UseProductivityActionsParams {
  ideas: Idea[];
  setIdeas: Dispatch<SetStateAction<Idea[]>>;
  sops: SOP[];
  setSops: Dispatch<SetStateAction<SOP[]>>;
  workLogs: WorkLog[];
  setWorkLogs: Dispatch<SetStateAction<WorkLog[]>>;
  goals: Goal[];
  setGoals: Dispatch<SetStateAction<Goal[]>>;
  bookmarks: Bookmark[];
  setBookmarks: Dispatch<SetStateAction<Bookmark[]>>;
  schoolEvents: SchoolEvent[];
  setSchoolEvents: Dispatch<SetStateAction<SchoolEvent[]>>;
  meetings: MeetingRecord[];
  setMeetings: Dispatch<SetStateAction<MeetingRecord[]>>;
  emailDigests: EmailDigest[];
  setEmailDigests: Dispatch<SetStateAction<EmailDigest[]>>;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  milestones: ProjectMilestone[];
  setMilestones: Dispatch<SetStateAction<ProjectMilestone[]>>;
  devlogs: DevLogEntry[];
  setDevlogs: Dispatch<SetStateAction<DevLogEntry[]>>;
  threads: DevLogThread[];
  setThreads: Dispatch<SetStateAction<DevLogThread[]>>;
  toast: ToastApi;
}

export function useProductivityActions({
  ideas,
  setIdeas,
  sops,
  setSops,
  workLogs,
  setWorkLogs,
  goals,
  setGoals,
  bookmarks,
  setBookmarks,
  schoolEvents,
  setSchoolEvents,
  meetings,
  setMeetings,
  emailDigests,
  setEmailDigests,
  tasks,
  setTasks,
  projects,
  setProjects,
  milestones,
  setMilestones,
  devlogs,
  setDevlogs,
  threads,
  setThreads,
  toast,
}: UseProductivityActionsParams) {
  const ideaActions = useIdeaActions({ ideas, setIdeas, toast });
  const sopActions = useSOPActions({ sops, setSops, toast });
  const workLogActions = useWorkLogActions({ workLogs, setWorkLogs, toast });
  const goalActions = useGoalActions({ goals, setGoals, toast });
  const bookmarkActions = useBookmarkActions({ bookmarks, setBookmarks, toast });
  const schoolEventActions = useSchoolEventActions({ schoolEvents, setSchoolEvents, setTasks, toast });
  const meetingActions = useMeetingActions({ setMeetings, toast });
  const emailDigestActions = useEmailDigestActions({ emailDigests, setEmailDigests, toast });
  const taskActions = useTaskActions({ tasks, setTasks, toast });
  const projectActions = useProjectActions({ projects, setProjects, toast });
  const milestoneActions = useMilestoneActions({ milestones, setMilestones, toast });
  const devlogActions = useDevlogActions({ devlogs, setDevlogs, toast });
  const threadActions = useThreadActions({ threads, setThreads, toast });

  return {
    ...ideaActions,
    ...sopActions,
    ...workLogActions,
    ...goalActions,
    ...bookmarkActions,
    ...schoolEventActions,
    ...meetingActions,
    ...emailDigestActions,
    ...taskActions,
    ...projectActions,
    ...milestoneActions,
    ...devlogActions,
    ...threadActions,
  };
}
