import { useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { useSeedData } from './useSeedData';
import { TimetableEntry, Student, TeachingUnit, ClassProfile, Idea, SOP, WorkLog, Goal, Bookmark, SchoolEvent, MeetingRecord, LessonRecord, HPAwardLog, Task, EmailDigest, Project, KahootItem, PayhipItem, VideoScript } from '../types';
import { ProjectMilestone, DevLogEntry, DevLogThread } from '../types/chronicle';
import { studentService } from '../services/studentService';
import { teachingService } from '../services/teachingService';
import { classService } from '../services/classService';
import { ideaService } from '../services/ideaService';
import { sopService } from '../services/sopService';
import { workLogService } from '../services/workLogService';
import { goalService } from '../services/goalService';
import { bookmarkService } from '../services/bookmarkService';
import { schoolEventService } from '../services/schoolEventService';
import { timetableService } from '../services/timetableService';
import { meetingService } from '../services/meetingService';
import { lessonRecordService } from '../services/lessonRecordService';
import { taskService } from '../services/taskService';
import { hpAwardService } from '../services/hpAwardService';
import { emailDigestService } from '../services/emailDigestService';
import { projectService } from '../services/projectService';
import { milestoneService } from '../services/milestoneService';
import { devlogService } from '../services/devlogService';
import { threadService } from '../services/threadService';
import { kahootService } from '../services/kahootService';
import { payhipService } from '../services/payhipService';
import { videoService } from '../services/videoService';
import { isSupabaseConfigured, syncToSupabase } from '../lib/supabase';
import { normalizeTeachingUnit } from '../lib/teachingAdapter';
import { sortTeachingUnits } from '../lib/teachingUnitOrder';
import { useKahootActions } from './appData/useKahootActions';
import { usePayhipActions } from './appData/usePayhipActions';
import { useVideoActions } from './appData/useVideoActions';
import { useProductivityActions } from './appData/useProductivityActions';
import { useStudentActions } from './appData/useStudentActions';
import { useTeachingActions } from './appData/useTeachingActions';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from './useToast';

const normalizeKahootLookupValue = (value?: string) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const url = new URL(raw);
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return raw.toLowerCase().replace(/\s+/g, ' ').trim();
  }
};

const normalizeKahootTitle = (value?: string) => {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

const isCanonicalCreatorUrl = (value?: string) => {
  return normalizeKahootLookupValue(value).startsWith('https://create.kahoot.it/creator/');
};

const isCanonicalCoverUrl = (value?: string) => {
  return normalizeKahootLookupValue(value).startsWith('https://www.25maths.com/projects/kahoot-channel/');
};

function buildKahootSeedLookup(seedItems: KahootItem[]) {
  const byId = new Map<string, KahootItem>();
  const byWebsiteLinkId = new Map<string, KahootItem>();
  const byChallengeUrl = new Map<string, KahootItem>();
  const byCompositeKey = new Map<string, KahootItem>();
  const byTitle = new Map<string, KahootItem>();

  for (const item of seedItems) {
    byId.set(item.id, item);

    const websiteLinkId = normalizeKahootLookupValue(item.website_link_id);
    if (websiteLinkId) byWebsiteLinkId.set(websiteLinkId, item);

    const challengeUrl = normalizeKahootLookupValue(item.challenge_url);
    if (challengeUrl) byChallengeUrl.set(challengeUrl, item);

    const compositeKey = `${item.board}|${item.track}|${normalizeKahootLookupValue(item.topic_code)}`;
    byCompositeKey.set(compositeKey, item);

    const title = normalizeKahootTitle(item.title);
    if (title) byTitle.set(title, item);
  }

  return { byId, byWebsiteLinkId, byChallengeUrl, byCompositeKey, byTitle };
}

type KahootSeedLookup = ReturnType<typeof buildKahootSeedLookup>;

const matchKahootSeedItem = (item: KahootItem, lookup: KahootSeedLookup) => {
  return (
    lookup.byId.get(item.id) ||
    lookup.byWebsiteLinkId.get(normalizeKahootLookupValue(item.website_link_id)) ||
    lookup.byChallengeUrl.get(normalizeKahootLookupValue(item.challenge_url)) ||
    lookup.byCompositeKey.get(`${item.board}|${item.track}|${normalizeKahootLookupValue(item.topic_code)}`) ||
    lookup.byTitle.get(normalizeKahootTitle(item.title))
  );
};

const backfillKahootSeedFields = (items: KahootItem[], lookup: KahootSeedLookup) => {
  const changedItems: KahootItem[] = [];

  const mergedItems = items.map(item => {
    const seed = matchKahootSeedItem(item, lookup);
    if (!seed) return item;

    const currentCreatorUrl = normalizeKahootLookupValue(item.creator_url);
    const seedCreatorUrl = normalizeKahootLookupValue(seed.creator_url);
    const currentCoverUrl = normalizeKahootLookupValue(item.cover_url);
    const seedCoverUrl = normalizeKahootLookupValue(seed.cover_url);
    const currentQuestions = Array.isArray(item.questions) ? item.questions : [];
    const seedQuestions = Array.isArray(seed.questions) ? seed.questions : [];
    const shouldUpdateCreator = Boolean(
      seed.creator_url &&
      (currentCreatorUrl !== seedCreatorUrl || !isCanonicalCreatorUrl(item.creator_url))
    );
    const shouldUpdateCover = Boolean(
      seed.cover_url &&
      (currentCoverUrl !== seedCoverUrl || !isCanonicalCoverUrl(item.cover_url))
    );
    const shouldUpdateQuestions = currentQuestions.length === 0 && seedQuestions.length > 0;
    const shouldUpdatePipeline = !item.pipeline && seed.pipeline;

    if (!shouldUpdateCreator && !shouldUpdateCover && !shouldUpdateQuestions && !shouldUpdatePipeline) {
      return item;
    }

    const nextItem = {
      ...item,
      creator_url: shouldUpdateCreator ? seed.creator_url : item.creator_url,
      cover_url: shouldUpdateCover ? seed.cover_url : item.cover_url,
      questions: shouldUpdateQuestions ? seed.questions : item.questions,
      pipeline: item.pipeline || seed.pipeline,
    };
    changedItems.push(nextItem);
    return nextItem;
  });

  return { mergedItems, changedItems };
};

const PAYHIP_PIPELINE_KEYS = ['matrix_ready', 'copy_ready', 'payhip_created', 'url_backfilled', 'qa_verified', 'site_synced'] as const;

function buildPayhipSeedLookup(seedItems: PayhipItem[]) {
  const byId = new Map<string, PayhipItem>();
  for (const item of seedItems) {
    byId.set(item.id, item);
  }
  return { byId };
}

type PayhipSeedLookup = ReturnType<typeof buildPayhipSeedLookup>;

const hasSamePayhipPipeline = (left?: PayhipItem['pipeline'], right?: PayhipItem['pipeline']) => {
  if (!left || !right) return false;

  return PAYHIP_PIPELINE_KEYS.every(key => Boolean(left[key]) === Boolean(right[key]));
};

const isPristinePayhipSeedItem = (item: PayhipItem) => {
  return item.created_at === item.updated_at && String(item.sync_source || '').startsWith('website:');
};

const backfillPayhipSeedFields = (items: PayhipItem[], lookup: PayhipSeedLookup) => {
  const changedItems: PayhipItem[] = [];

  const mergedItems = items.map(item => {
    const seed = lookup.byId.get(item.id);
    if (!seed?.pipeline) return item;

    const shouldUpdatePipeline = !item.pipeline || (isPristinePayhipSeedItem(item) && !hasSamePayhipPipeline(item.pipeline, seed.pipeline));
    if (!shouldUpdatePipeline) return item;

    const nextItem = {
      ...item,
      pipeline: seed.pipeline,
    };
    changedItems.push(nextItem);
    return nextItem;
  });

  return { mergedItems, changedItems };
};

export function useAppData() {
  const { toasts, toast } = useToast();
  const seed = useSeedData();

  const kahootSeedLookup = useMemo(
    () => seed.loaded ? buildKahootSeedLookup(seed.kahootSeed) : null,
    [seed.loaded, seed.kahootSeed],
  );
  const payhipSeedLookup = useMemo(
    () => seed.loaded ? buildPayhipSeedLookup(seed.payhipSeed) : null,
    [seed.loaded, seed.payhipSeed],
  );

  const normalizeAndSortUnits = useCallback((units: TeachingUnit[]) => {
    return sortTeachingUnits(units.map(normalizeTeachingUnit));
  }, []);

  // --- State ---
  const [timetable, setTimetable] = useLocalStorage<TimetableEntry[]>('dashboard-timetable', []);
  const [students, setStudents] = useLocalStorage<Student[]>('dashboard-students', []);
  const [teachingUnits, setTeachingUnits] = useLocalStorage<TeachingUnit[]>(
    'dashboard-teaching-units',
    [],
    { debounceMs: 1500, idleTimeoutMs: 5000 },
  );
  const [classes, setClasses] = useLocalStorage<ClassProfile[]>('dashboard-classes', []);
  const [ideas, setIdeas] = useLocalStorage<Idea[]>('dashboard-ideas', []);
  const [sops, setSops] = useLocalStorage<SOP[]>('dashboard-sops', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('dashboard-goals', []);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('dashboard-bookmarks', []);
  const [schoolEvents, setSchoolEvents] = useLocalStorage<SchoolEvent[]>('dashboard-school-events', []);
  const [workLogs, setWorkLogs] = useLocalStorage<WorkLog[]>('dashboard-work-logs', []);
  const [meetings, setMeetings] = useLocalStorage<MeetingRecord[]>('dashboard-meetings', []);
  const [lessonRecords, setLessonRecords] = useLocalStorage<LessonRecord[]>('dashboard-lesson-records', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('dashboard-tasks', []);
  const [hpAwardLogs, setHpAwardLogs] = useLocalStorage<HPAwardLog[]>('dashboard-hp-award-logs', []);
  const [emailDigests, setEmailDigests] = useLocalStorage<EmailDigest[]>('dashboard-email-digests', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('dashboard-projects', []);
  const [milestones, setMilestones] = useLocalStorage<ProjectMilestone[]>('dashboard-milestones', []);
  const [devlogs, setDevlogs] = useLocalStorage<DevLogEntry[]>('dashboard-devlogs', []);
  const [threads, setThreads] = useLocalStorage<DevLogThread[]>('dashboard-threads', []);
  const [kahootItems, setKahootItems] = useLocalStorage<KahootItem[]>(
    'dashboard-kahoot-items',
    [],
    { debounceMs: 1500, idleTimeoutMs: 5000 },
  );
  const [payhipItems, setPayhipItems] = useLocalStorage<PayhipItem[]>(
    'dashboard-payhip-items',
    [],
    { debounceMs: 1500, idleTimeoutMs: 5000 },
  );
  const [videoScripts, setVideoScripts] = useLocalStorage<VideoScript[]>(
    'dashboard-video-scripts',
    [],
    { debounceMs: 1500, idleTimeoutMs: 5000 },
  );

  // Lazy-seed mock data for first-time users (no localStorage, no Supabase)
  useEffect(() => {
    if (isSupabaseConfigured) return;
    if (timetable.length > 0 || students.length > 0) return;
    import('../constants-mock').then(mocks => {
      setTimetable(prev => prev.length === 0 ? mocks.MOCK_TIMETABLE : prev);
      setStudents(prev => prev.length === 0 ? mocks.MOCK_STUDENTS : prev);
      setTeachingUnits(prev => prev.length === 0 ? normalizeAndSortUnits(mocks.MOCK_TEACHING_UNITS) : prev);
      setClasses(prev => prev.length === 0 ? mocks.MOCK_CLASSES : prev);
      setIdeas(prev => prev.length === 0 ? mocks.MOCK_IDEAS : prev);
      setSops(prev => prev.length === 0 ? mocks.MOCK_SOPS : prev);
      setGoals(prev => prev.length === 0 ? mocks.MOCK_GOALS : prev);
      setSchoolEvents(prev => prev.length === 0 ? mocks.MOCK_SCHOOL_EVENTS : prev);
      setWorkLogs(prev => prev.length === 0 ? mocks.MOCK_WORK_LOGS : prev);
      setLessonRecords(prev => prev.length === 0 ? mocks.MOCK_LESSON_RECORDS : prev);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Populate from seed data once loaded (replaces stale or empty cache)
  useEffect(() => {
    if (!seed.loaded) return;
    if (kahootItems.length >= seed.kahootSeed.length) return;
    setKahootItems(seed.kahootSeed);
  }, [seed.loaded, seed.kahootSeed, kahootItems.length, setKahootItems]);

  useEffect(() => {
    if (!seed.loaded) return;
    if (payhipItems.length >= seed.payhipSeed.length) return;
    setPayhipItems(seed.payhipSeed);
  }, [seed.loaded, seed.payhipSeed, payhipItems.length, setPayhipItems]);

  // Fill in canonical creator and cover links from the seed without disturbing other fields.
  useEffect(() => {
    if (!kahootSeedLookup) return;
    const { mergedItems, changedItems } = backfillKahootSeedFields(kahootItems, kahootSeedLookup);
    if (changedItems.length === 0) return;

    setKahootItems(mergedItems);

    if (isSupabaseConfigured) {
      void syncToSupabase('kahoot_items', changedItems);
    }
  }, [kahootItems, setKahootItems, kahootSeedLookup]);

  // Reset untouched seed-derived Payhip pipeline flags so QA/site sync start from explicit operator actions.
  useEffect(() => {
    if (!payhipSeedLookup) return;
    const { mergedItems, changedItems } = backfillPayhipSeedFields(payhipItems, payhipSeedLookup);
    if (changedItems.length === 0) return;

    setPayhipItems(mergedItems);

    if (isSupabaseConfigured) {
      void syncToSupabase('payhip_items', changedItems);
    }
  }, [payhipItems, setPayhipItems, payhipSeedLookup]);

  // --- Normalize localStorage data ---
  useEffect(() => {
    setTeachingUnits(prev => normalizeAndSortUnits(prev));
    // Migrate is_prepared → prep_status
    setTimetable(prev => prev.map(entry => {
      if (entry.prep_status) return entry;
      if (entry.is_prepared !== undefined) {
        return { ...entry, prep_status: entry.is_prepared ? 'prepared' : 'not_prepared' };
      }
      return entry;
    }));
  }, [normalizeAndSortUnits]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Data Fetching ---

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    // Fetch from Supabase; if empty, sync localStorage data up first.
    async function fetchOrSync<T extends { id: string }>(
      fetchFn: () => Promise<T[]>,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      localData: T[],
      table: string,
    ) {
      try {
        const remote = await fetchFn();
        if (cancelled) return;
        if (remote.length > 0) {
          setter(remote);
        } else if (localData.length > 0) {
          await syncToSupabase(table, localData);
        }
      } catch {
        // fallback to localStorage data
      }
    }

    const fetchAll = async () => {
      const normalizeAndSetUnits: React.Dispatch<React.SetStateAction<TeachingUnit[]>> = (val) => {
        setTeachingUnits(prev => {
          const next = typeof val === 'function' ? val(prev) : val;
          return normalizeAndSortUnits(next);
        });
      };

      // Collect resolved data for post-fetch backfill
      let resolvedStudents: Student[] = [];
      let resolvedLogs: HPAwardLog[] = [];
      let resolvedRecords: LessonRecord[] = [];

      const setStudentsAndCapture: React.Dispatch<React.SetStateAction<Student[]>> = (val) => {
        setStudents(prev => {
          const next = typeof val === 'function' ? val(prev) : val;
          resolvedStudents = next;
          return next;
        });
      };
      const setLogsAndCapture: React.Dispatch<React.SetStateAction<HPAwardLog[]>> = (val) => {
        setHpAwardLogs(prev => {
          const next = typeof val === 'function' ? val(prev) : val;
          resolvedLogs = next;
          return next;
        });
      };
      const setRecordsAndCapture: React.Dispatch<React.SetStateAction<LessonRecord[]>> = (val) => {
        setLessonRecords(prev => {
          const next = typeof val === 'function' ? val(prev) : val;
          resolvedRecords = next;
          return next;
        });
      };

      await Promise.all([
        fetchOrSync(studentService.getAllStudents, setStudentsAndCapture, students, 'students'),
        fetchOrSync(teachingService.getAllUnits, normalizeAndSetUnits, teachingUnits, 'teaching_units'),
        fetchOrSync(classService.getAllClasses, setClasses, classes, 'classes'),
        fetchOrSync(ideaService.getAll, setIdeas, ideas, 'ideas'),
        fetchOrSync(sopService.getAll, setSops, sops, 'sops'),
        fetchOrSync(workLogService.getAll, setWorkLogs, workLogs, 'work_logs'),
        fetchOrSync(goalService.getAll, setGoals, goals, 'goals'),
        fetchOrSync(bookmarkService.getAll, setBookmarks, bookmarks, 'bookmarks'),
        fetchOrSync(schoolEventService.getAll, setSchoolEvents, schoolEvents, 'school_events'),
        fetchOrSync(timetableService.getAll, setTimetable, timetable, 'timetable_entries'),
        fetchOrSync(meetingService.getAll, setMeetings, meetings, 'meeting_records'),
        fetchOrSync(lessonRecordService.getAll, setRecordsAndCapture, lessonRecords, 'lesson_records'),
        fetchOrSync(taskService.getAll, setTasks, tasks, 'tasks'),
        fetchOrSync(hpAwardService.getAll, setLogsAndCapture, hpAwardLogs, 'hp_award_logs'),
        fetchOrSync(emailDigestService.getAll, setEmailDigests, emailDigests, 'email_digests'),
        fetchOrSync(projectService.getAll, setProjects, projects, 'projects'),
        fetchOrSync(milestoneService.getAll, setMilestones, milestones, 'milestones'),
        fetchOrSync(devlogService.getAll, setDevlogs, devlogs, 'devlogs'),
        fetchOrSync(threadService.getAll, setThreads, threads, 'devlog_threads'),
        fetchOrSync(kahootService.getAll, setKahootItems, kahootItems, 'kahoot_items'),
        fetchOrSync(payhipService.getAll, setPayhipItems, payhipItems, 'payhip_items'),
        fetchOrSync(videoService.getAll, setVideoScripts, videoScripts, 'video_scripts'),
      ]);

      if (cancelled) return;

      // --- One-time backfill: create HPAwardLogs for existing data ---
      if (resolvedLogs.length === 0) {
        const backfillLogs: Omit<HPAwardLog, 'id'>[] = [];
        const today = format(new Date(), 'yyyy-MM-dd');

        // 1) Backfill from lesson records with house_point_awards
        for (const record of resolvedRecords) {
          const awards = record.house_point_awards || [];
          for (const a of awards) {
            backfillLogs.push({
              date: record.date,
              student_id: a.student_id,
              student_name: a.student_name,
              class_name: record.class_name,
              points: a.points,
              reason: a.reason || 'Lesson HP Award',
              source: 'lesson',
              source_id: record.id,
            });
          }
        }

        // 2) Backfill from students with house_points > 0 (batch awards with no other source)
        const lessonLogStudentPoints = new Map<string, number>();
        for (const log of backfillLogs) {
          lessonLogStudentPoints.set(log.student_id, (lessonLogStudentPoints.get(log.student_id) || 0) + log.points);
        }
        for (const student of resolvedStudents) {
          if (student.house_points > 0) {
            const fromLessons = lessonLogStudentPoints.get(student.id) || 0;
            const remainder = student.house_points - fromLessons;
            if (remainder > 0) {
              backfillLogs.push({
                date: today,
                student_id: student.id,
                student_name: student.name,
                class_name: student.class_name,
                points: remainder,
                reason: 'Historical HP (backfilled)',
                source: 'batch',
              });
            }
          }
        }

        if (backfillLogs.length > 0) {
          try {
            const created = await hpAwardService.createBatch(backfillLogs);
            setHpAwardLogs(created);
          } catch {
            // silent fallback
          }
        }
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Sub-hooks ---

  const {
    saveStudent,
    deleteStudent,
    addStatusRecord,
    updateStatusRecord,
    deleteStatusRecord,
    addWeakness,
    updateWeakness,
    deleteWeakness,
    addStudentRequest,
    updateStudentRequest,
    updateRequestDate,
    deleteStudentRequest,
    toggleRequestStatus,
    addParentCommunication,
    updateParentCommunication,
    addParentCommFollowUp,
    updateParentCommDate,
    deleteParentCommunication,
    toggleParentCommunicationStatus,
    addExamRecord,
    applyHousePointDeltas,
    batchAwardHP,
    deleteHPAwardLog,
  } = useStudentActions({
    students,
    setStudents,
    hpAwardLogs,
    setHpAwardLogs,
    setTasks,
    toast,
  });

  const {
    saveTeachingUnit,
    deleteTeachingUnit,
    saveClass,
    deleteClass,
    updateTimetableEntry,
    addTimetableEntry,
    deleteTimetableEntry,
    addLessonRecord,
    updateLessonRecord,
    deleteLessonRecord,
  } = useTeachingActions({
    setTeachingUnits,
    setClasses,
    setTimetable,
    meetings,
    setMeetings,
    lessonRecords,
    setLessonRecords,
    setHpAwardLogs,
    normalizeAndSortUnits,
    applyHousePointDeltas,
    toast,
  });

  const {
    addProject,
    updateProject,
    deleteProject,
    addIdea,
    updateIdea,
    deleteIdea,
    toggleIdeaStatus,
    toggleIdeaDashboard,
    consolidateIdeas,
    addSOP,
    updateSOP,
    deleteSOP,
    consolidateSOPs,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    consolidateWorkLogs,
    addGoal,
    updateGoal,
    deleteGoal,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    toggleBookmarkPin,
    addSchoolEvent,
    updateSchoolEvent,
    deleteSchoolEvent,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    addEmailDigest,
    updateEmailDigest,
    deleteEmailDigest,
    addTask,
    updateTask,
    deleteTask,
    cycleTaskStatus,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    cycleMilestoneStatus,
    saveMilestoneReview,
    reorderMilestones,
    addDevLog,
    updateDevLog,
    deleteDevLog,
    addThread,
    updateThread,
    deleteThread,
  } = useProductivityActions({
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
  });

  const {
    addKahoot,
    updateKahoot,
    deleteKahoot,
    duplicateKahoot,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
  } = useKahootActions({
    kahootItems,
    setKahootItems,
    toast,
  });

  const {
    updateVideoScript,
    deleteVideoScript,
    toggleVideoPipeline,
    bulkSetVideoPipeline,
  } = useVideoActions({
    videoScripts,
    setVideoScripts,
    toast,
  });

  const {
    updatePayhip,
    setPayhipStatus,
    togglePayhipPipelineStage,
    bulkSetPayhipPipeline,
  } = usePayhipActions({
    payhipItems,
    setPayhipItems,
    toast,
  });

  // --- QuickCapture ---

  const quickCapture = useCallback((text: string, category: 'work' | 'student' | 'startup' | 'task') => {
    if (category === 'task') {
      addTask({ title: text.slice(0, 100), description: text.length > 100 ? text : undefined, status: 'inbox', priority: 'medium' });
    } else if (category === 'startup') {
      addIdea({ title: text.slice(0, 50), content: text, category: 'startup', priority: 'medium' });
    } else {
      addWorkLog({ content: text, category: category === 'student' ? 'tutor' : 'teaching', tags: [category] });
    }
  }, [addIdea, addWorkLog, addTask]);

  // --- Bulk Import ---

  const bulkImport = useCallback((imported: Record<string, unknown>) => {
    const keyMap: Record<string, (val: unknown) => void> = {
      students: (v) => setStudents(v as Student[]),
      teachingUnits: (v) => setTeachingUnits(normalizeAndSortUnits(v as TeachingUnit[])),
      classes: (v) => setClasses(v as ClassProfile[]),
      timetable: (v) => setTimetable(v as TimetableEntry[]),
      ideas: (v) => setIdeas(v as Idea[]),
      sops: (v) => setSops(v as SOP[]),
      goals: (v) => setGoals(v as Goal[]),
      bookmarks: (v) => setBookmarks(v as Bookmark[]),
      schoolEvents: (v) => setSchoolEvents(v as SchoolEvent[]),
      workLogs: (v) => setWorkLogs(v as WorkLog[]),
      meetings: (v) => setMeetings(v as MeetingRecord[]),
      lessonRecords: (v) => setLessonRecords(v as LessonRecord[]),
      tasks: (v) => setTasks(v as Task[]),
      hpAwardLogs: (v) => setHpAwardLogs(v as HPAwardLog[]),
      emailDigests: (v) => setEmailDigests(v as EmailDigest[]),
      projects: (v) => setProjects(v as Project[]),
      milestones: (v) => setMilestones(v as ProjectMilestone[]),
      devlogs: (v) => setDevlogs(v as DevLogEntry[]),
      threads: (v) => setThreads(v as DevLogThread[]),
      kahootItems: (v) => setKahootItems(v as KahootItem[]),
      payhipItems: (v) => setPayhipItems(v as PayhipItem[]),
      videoScripts: (v) => setVideoScripts(v as VideoScript[]),
    };
    let count = 0;
    for (const [key, setter] of Object.entries(keyMap)) {
      if (key in imported && Array.isArray(imported[key])) {
        setter(imported[key]);
        count++;
      }
    }
    if (count > 0) {
      toast.success(`Imported ${count} data categor${count === 1 ? 'y' : 'ies'} successfully`);
    }
  }, [normalizeAndSortUnits, setStudents, setTeachingUnits, setClasses, setTimetable, setIdeas, setSops, setGoals, setBookmarks, setSchoolEvents, setWorkLogs, setMeetings, setLessonRecords, setTasks, setHpAwardLogs, setEmailDigests, setProjects, setKahootItems, setPayhipItems, setVideoScripts, toast]);

  return {
    // State
    timetable, students, teachingUnits, classes,
    ideas, sops, goals, bookmarks, schoolEvents, workLogs, meetings, lessonRecords, tasks, hpAwardLogs, emailDigests, projects, milestones, devlogs, threads, kahootItems, payhipItems, videoScripts,
    toasts,

    // Student
    saveStudent, deleteStudent, addStatusRecord, updateStatusRecord, deleteStatusRecord, addWeakness, updateWeakness, deleteWeakness,
    addStudentRequest, updateStudentRequest, updateRequestDate, deleteStudentRequest, toggleRequestStatus,
    addParentCommunication, updateParentCommunication, addParentCommFollowUp, updateParentCommDate, deleteParentCommunication, toggleParentCommunicationStatus,
    addExamRecord, batchAwardHP,

    // Teaching
    saveTeachingUnit, deleteTeachingUnit,

    // Class
    saveClass, deleteClass,

    // Timetable
    updateTimetableEntry, addTimetableEntry, deleteTimetableEntry,

    // Ideas / SOPs / WorkLogs
    addIdea, updateIdea, deleteIdea, toggleIdeaStatus, toggleIdeaDashboard, consolidateIdeas,
    addSOP, updateSOP, deleteSOP, consolidateSOPs,
    addWorkLog, updateWorkLog, deleteWorkLog, consolidateWorkLogs,

    // Goals
    addGoal, updateGoal, deleteGoal,

    // Bookmarks
    addBookmark, updateBookmark, deleteBookmark, toggleBookmarkPin,

    // School Events
    addSchoolEvent, updateSchoolEvent, deleteSchoolEvent,

    // Meetings
    addMeeting, updateMeeting, deleteMeeting,

    // Email Digests
    addEmailDigest, updateEmailDigest, deleteEmailDigest,

    // Lesson Records
    addLessonRecord, updateLessonRecord, deleteLessonRecord,

    // HP Award Logs
    deleteHPAwardLog,

    // Projects
    addProject, updateProject, deleteProject,

    // Chronicle (Milestones + DevLogs)
    addMilestone, updateMilestone, deleteMilestone, cycleMilestoneStatus, saveMilestoneReview, reorderMilestones,
    addDevLog, updateDevLog, deleteDevLog,
    addThread, updateThread, deleteThread,

    // Kahoot Upload
    addKahoot, updateKahoot, deleteKahoot, duplicateKahoot,
    addQuestion, updateQuestion, deleteQuestion, moveQuestion,

    // Payhip Upload
    updatePayhip, setPayhipStatus, togglePayhipPipelineStage, bulkSetPayhipPipeline,

    // Video Hub
    setVideoScripts,
    updateVideoScript, deleteVideoScript, toggleVideoPipeline, bulkSetVideoPipeline,

    // Tasks (GTD)
    addTask, updateTask, deleteTask, cycleTaskStatus,

    // QuickCapture
    quickCapture,

    // Bulk Import
    bulkImport,

    // Toast
    toast,
  };
}
