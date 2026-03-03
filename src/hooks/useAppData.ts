import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { MOCK_TIMETABLE, MOCK_STUDENTS, MOCK_IDEAS, MOCK_SOPS, MOCK_TEACHING_UNITS, MOCK_SCHOOL_EVENTS, MOCK_GOALS, MOCK_WORK_LOGS, MOCK_CLASSES, MOCK_LESSON_RECORDS } from '../constants';
import { TimetableEntry, Student, TeachingUnit, ClassProfile, StudentStatusRecord, StudentRequest, ParentCommunication, ParentCommMethod, ParentCommFollowUp, StudentWeakness, ExamRecord, Idea, SOP, WorkLog, Goal, SchoolEvent, MeetingRecord, LessonRecord, HousePointAward, HPAwardLog, Task, PrepStatus, EmailDigest } from '../types';
import { studentService } from '../services/studentService';
import { teachingService } from '../services/teachingService';
import { classService } from '../services/classService';
import { ideaService } from '../services/ideaService';
import { sopService } from '../services/sopService';
import { workLogService } from '../services/workLogService';
import { goalService } from '../services/goalService';
import { schoolEventService } from '../services/schoolEventService';
import { timetableService } from '../services/timetableService';
import { meetingService } from '../services/meetingService';
import { lessonRecordService } from '../services/lessonRecordService';
import { taskService } from '../services/taskService';
import { hpAwardService } from '../services/hpAwardService';
import { emailDigestService } from '../services/emailDigestService';
import { isSupabaseConfigured, syncToSupabase } from '../lib/supabase';
import { normalizeTeachingUnit } from '../lib/teachingAdapter';
import { useLocalStorage } from './useLocalStorage';
import { useToast, Toast } from './useToast';

export function useAppData() {
  const { toasts, toast } = useToast();

  // --- State ---
  const [timetable, setTimetable] = useLocalStorage<TimetableEntry[]>('dashboard-timetable', MOCK_TIMETABLE);
  const [students, setStudents] = useLocalStorage<Student[]>('dashboard-students', MOCK_STUDENTS);
  const [teachingUnits, setTeachingUnits] = useLocalStorage<TeachingUnit[]>('dashboard-teaching-units', MOCK_TEACHING_UNITS);
  const [classes, setClasses] = useLocalStorage<ClassProfile[]>('dashboard-classes', MOCK_CLASSES);
  const [ideas, setIdeas] = useLocalStorage<Idea[]>('dashboard-ideas', MOCK_IDEAS);
  const [sops, setSops] = useLocalStorage<SOP[]>('dashboard-sops', MOCK_SOPS);
  const [goals, setGoals] = useLocalStorage<Goal[]>('dashboard-goals', MOCK_GOALS);
  const [schoolEvents, setSchoolEvents] = useLocalStorage<SchoolEvent[]>('dashboard-school-events', MOCK_SCHOOL_EVENTS);
  const [workLogs, setWorkLogs] = useLocalStorage<WorkLog[]>('dashboard-work-logs', MOCK_WORK_LOGS);
  const [meetings, setMeetings] = useLocalStorage<MeetingRecord[]>('dashboard-meetings', []);
  const [lessonRecords, setLessonRecords] = useLocalStorage<LessonRecord[]>('dashboard-lesson-records', MOCK_LESSON_RECORDS);
  const [tasks, setTasks] = useLocalStorage<Task[]>('dashboard-tasks', []);
  const [hpAwardLogs, setHpAwardLogs] = useLocalStorage<HPAwardLog[]>('dashboard-hp-award-logs', []);
  const [emailDigests, setEmailDigests] = useLocalStorage<EmailDigest[]>('dashboard-email-digests', []);

  // --- Normalize localStorage data ---
  useEffect(() => {
    setTeachingUnits(prev => prev.map(normalizeTeachingUnit));
    // Migrate is_prepared → prep_status
    setTimetable(prev => prev.map(entry => {
      if (entry.prep_status) return entry;
      if (entry.is_prepared !== undefined) {
        return { ...entry, prep_status: entry.is_prepared ? 'prepared' : 'not_prepared' };
      }
      return entry;
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Data Fetching ---

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Fetch from Supabase; if empty, sync localStorage data up first.
    async function fetchOrSync<T extends { id: string }>(
      fetchFn: () => Promise<T[]>,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      localData: T[],
      table: string,
    ) {
      try {
        const remote = await fetchFn();
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
          return next.map(normalizeTeachingUnit);
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
        fetchOrSync(schoolEventService.getAll, setSchoolEvents, schoolEvents, 'school_events'),
        fetchOrSync(timetableService.getAll, setTimetable, timetable, 'timetable_entries'),
        fetchOrSync(meetingService.getAll, setMeetings, meetings, 'meeting_records'),
        fetchOrSync(lessonRecordService.getAll, setRecordsAndCapture, lessonRecords, 'lesson_records'),
        fetchOrSync(taskService.getAll, setTasks, tasks, 'tasks'),
        fetchOrSync(hpAwardService.getAll, setLogsAndCapture, hpAwardLogs, 'hp_award_logs'),
        fetchOrSync(emailDigestService.getAll, setEmailDigests, emailDigests, 'email_digests'),
      ]);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Student CRUD ---

  const saveStudent = useCallback(async (studentData: Omit<Student, 'id'> | Student) => {
    try {
      if ('id' in studentData) {
        // Detect direct HP edit → auto-create award log
        const oldStudent = students.find(s => s.id === studentData.id);
        const hpDelta = oldStudent ? studentData.house_points - oldStudent.house_points : 0;

        const updated = await studentService.updateStudent(studentData.id, studentData);
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));

        if (hpDelta !== 0 && oldStudent) {
          try {
            const logEntry = await hpAwardService.create({
              date: format(new Date(), 'yyyy-MM-dd'),
              student_id: updated.id,
              student_name: updated.name,
              class_name: updated.class_name,
              points: hpDelta,
              reason: hpDelta > 0 ? 'Manual HP adjustment' : 'Manual HP deduction',
              source: 'batch' as const,
            });
            setHpAwardLogs(prev => [...prev, logEntry]);
          } catch {
            // silent — don't block save if log fails
          }
        }

        toast.success('Student updated');
      } else {
        const created = await studentService.createStudent(studentData);
        setStudents(prev => [...prev, created]);
        toast.success('Student added');
      }
    } catch (error) {
      toast.error('Failed to save student');
      throw error;
    }
  }, [setStudents, students, toast, setHpAwardLogs]);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      await studentService.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student deleted');
    } catch (error) {
      toast.error('Failed to delete student');
    }
  }, [setStudents, toast]);

  const addStatusRecord = useCallback(async (studentId: string, content: string, category: StudentStatusRecord['category'] = 'academic') => {
    const newRecord: StudentStatusRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      category,
      content,
    };
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        status_records: [...(student.status_records || []), newRecord],
      });
    }
  }, [students, saveStudent]);

  const updateStatusRecord = useCallback(async (studentId: string, recordId: string, content: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        status_records: (student.status_records || []).map(r => r.id === recordId ? { ...r, content } : r),
      });
    }
  }, [students, saveStudent]);

  const deleteStatusRecord = useCallback(async (studentId: string, recordId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        status_records: (student.status_records || []).filter(r => r.id !== recordId),
      });
    }
  }, [students, saveStudent]);

  // --- Weakness CRUD ---

  const addWeakness = useCallback(async (studentId: string, weakness: StudentWeakness) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        weaknesses: [...(student.weaknesses || []), weakness],
      });
    }
  }, [students, saveStudent]);

  const updateWeakness = useCallback(async (studentId: string, index: number, weakness: StudentWeakness) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        weaknesses: (student.weaknesses || []).map((w, i) => i === index ? weakness : w),
      });
    }
  }, [students, saveStudent]);

  const deleteWeakness = useCallback(async (studentId: string, index: number) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        weaknesses: (student.weaknesses || []).filter((_, i) => i !== index),
      });
    }
  }, [students, saveStudent]);

  const addStudentRequest = useCallback(async (studentId: string, content: string) => {
    const newRequest: StudentRequest = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      content,
      status: 'pending',
    };
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        requests: [...(student.requests || []), newRequest],
      });
    }
  }, [students, saveStudent]);

  const updateStudentRequest = useCallback(async (studentId: string, requestId: string, content: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        requests: (student.requests || []).map(r => r.id === requestId ? { ...r, content } : r),
      });
    }
  }, [students, saveStudent]);

  const updateRequestDate = useCallback(async (studentId: string, requestId: string, field: 'date' | 'resolved_date', value: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        requests: (student.requests || []).map(r =>
          r.id === requestId ? { ...r, [field]: value || undefined } : r
        ),
      });
    }
  }, [students, saveStudent]);

  const deleteStudentRequest = useCallback(async (studentId: string, requestId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        requests: (student.requests || []).filter(r => r.id !== requestId),
      });
    }
  }, [students, saveStudent]);

  const toggleRequestStatus = useCallback(async (studentId: string, requestId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const today = format(new Date(), 'yyyy-MM-dd');
      await saveStudent({
        ...student,
        requests: (student.requests || []).map(r =>
          r.id === requestId ? {
            ...r,
            status: r.status === 'pending' ? 'resolved' as const : 'pending' as const,
            resolved_date: r.status === 'pending' ? today : undefined,
          } : r
        ),
      });
    }
  }, [students, saveStudent]);

  // --- Parent Communication CRUD ---

  const createFollowUpTask = useCallback(async (
    student: Student, commId: string, method: ParentCommMethod, content: string, followUpPlan: string
  ) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries({
          title: `[家校沟通] ${student.name}: ${followUpPlan.slice(0, 60)}`,
          description: `学生: ${student.name} (${student.class_name})\n沟通方式: ${method}\n沟通内容: ${content}\n\n跟进计划: ${followUpPlan}`,
          status: 'next',
          priority: 'medium',
          source_type: 'parent-comm',
          source_id: `${student.id}:${commId}`,
          tags: ['家校沟通'],
        }).filter(([, v]) => v !== undefined)
      ) as Omit<Task, 'id' | 'created_at'>;
      const created = await taskService.create({ ...cleanData, created_at: new Date().toISOString() } as Omit<Task, 'id'>);
      setTasks(prev => [...prev, created]);
      return created.id;
    } catch {
      return undefined;
    }
  }, [setTasks]);

  const addParentCommunication = useCallback(async (
    studentId: string,
    data: { date: string; method: ParentCommMethod; content: string; needs_follow_up: boolean; follow_up_plan?: string }
  ) => {
    const commId = Math.random().toString(36).substr(2, 9);
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    let taskId: string | undefined;
    if (data.needs_follow_up && data.follow_up_plan) {
      taskId = await createFollowUpTask(student, commId, data.method, data.content, data.follow_up_plan);
    }

    const newComm: ParentCommunication = {
      id: commId,
      date: data.date,
      method: data.method,
      content: data.content,
      status: data.needs_follow_up ? 'pending' : 'resolved',
      needs_follow_up: data.needs_follow_up,
      follow_up_plan: data.follow_up_plan,
      follow_up_task_id: taskId,
    };
    await saveStudent({
      ...student,
      parent_communications: [...(student.parent_communications || []), newComm],
    });
    if (taskId) toast.success('已创建跟进待办事项');
  }, [students, saveStudent, createFollowUpTask, toast]);

  const updateParentCommunication = useCallback(async (
    studentId: string,
    commId: string,
    data: { date: string; method: ParentCommMethod; content: string; needs_follow_up: boolean; follow_up_plan?: string }
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const existing = (student.parent_communications || []).find(c => c.id === commId);
    if (!existing) return;

    let taskId = existing.follow_up_task_id;
    if (data.needs_follow_up && data.follow_up_plan && !taskId) {
      taskId = await createFollowUpTask(student, commId, data.method, data.content, data.follow_up_plan);
      if (taskId) toast.success('已创建跟进待办事项');
    }

    await saveStudent({
      ...student,
      parent_communications: (student.parent_communications || []).map(c =>
        c.id === commId ? {
          ...c,
          date: data.date,
          method: data.method,
          content: data.content,
          needs_follow_up: data.needs_follow_up,
          follow_up_plan: data.follow_up_plan,
          follow_up_task_id: taskId,
        } : c
      ),
    });
  }, [students, saveStudent, createFollowUpTask, toast]);

  const addParentCommFollowUp = useCallback(async (studentId: string, commId: string, followUpContent: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const newFollowUp: ParentCommFollowUp = {
      date: format(new Date(), 'yyyy-MM-dd'),
      content: followUpContent,
    };
    await saveStudent({
      ...student,
      parent_communications: (student.parent_communications || []).map(c =>
        c.id === commId ? { ...c, follow_ups: [...(c.follow_ups || []), newFollowUp] } : c
      ),
    });
  }, [students, saveStudent]);

  const updateParentCommDate = useCallback(async (studentId: string, commId: string, field: 'date' | 'resolved_date', value: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        parent_communications: (student.parent_communications || []).map(c =>
          c.id === commId ? { ...c, [field]: value || undefined } : c
        ),
      });
    }
  }, [students, saveStudent]);

  const deleteParentCommunication = useCallback(async (studentId: string, commId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        parent_communications: (student.parent_communications || []).filter(c => c.id !== commId),
      });
    }
  }, [students, saveStudent]);

  const toggleParentCommunicationStatus = useCallback(async (studentId: string, commId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const today = format(new Date(), 'yyyy-MM-dd');
      await saveStudent({
        ...student,
        parent_communications: (student.parent_communications || []).map(c =>
          c.id === commId ? {
            ...c,
            status: c.status === 'pending' ? 'resolved' as const : 'pending' as const,
            resolved_date: c.status === 'pending' ? today : undefined,
          } : c
        ),
      });
    }
  }, [students, saveStudent]);

  const addExamRecord = useCallback(async (studentId: string, record: Omit<ExamRecord, 'id'>) => {
    const newRecord: ExamRecord = {
      id: Math.random().toString(36).substr(2, 9),
      ...record,
    };
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        exam_records: [...(student.exam_records || []), newRecord],
      });
    }
  }, [students, saveStudent]);

  // --- Teaching Unit CRUD ---

  const saveTeachingUnit = useCallback(async (unitData: Omit<TeachingUnit, 'id'> | TeachingUnit) => {
    try {
      if ('id' in unitData) {
        const updated = await teachingService.updateUnit(unitData.id, unitData);
        setTeachingUnits(prev => prev.map(u => u.id === updated.id ? updated : u));
        toast.success('Unit updated');
      } else {
        const created = await teachingService.createUnit(unitData);
        setTeachingUnits(prev => [...prev, created]);
        toast.success('Unit added');
      }
    } catch (error) {
      toast.error('Failed to save teaching unit');
      throw error;
    }
  }, [setTeachingUnits, toast]);

  const deleteTeachingUnit = useCallback(async (id: string) => {
    try {
      await teachingService.deleteUnit(id);
      setTeachingUnits(prev => prev.filter(u => u.id !== id));
      toast.success('Unit deleted');
    } catch (error) {
      toast.error('Failed to delete teaching unit');
    }
  }, [setTeachingUnits, toast]);

  // --- Class CRUD ---

  const saveClass = useCallback(async (classData: Omit<ClassProfile, 'id'> | ClassProfile) => {
    try {
      if ('id' in classData) {
        const updated = await classService.updateClass(classData.id, classData);
        setClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success('Class updated');
      } else {
        const created = await classService.createClass(classData);
        setClasses(prev => [...prev, created]);
        toast.success('Class added');
      }
    } catch (error) {
      toast.error('Failed to save class');
      throw error;
    }
  }, [setClasses, toast]);

  const deleteClass = useCallback(async (id: string) => {
    try {
      await classService.deleteClass(id);
      setClasses(prev => prev.filter(c => c.id !== id));
      toast.success('Class deleted');
    } catch (error) {
      toast.error('Failed to delete class');
    }
  }, [setClasses, toast]);

  const updateClassProgress = useCallback(async (classId: string, lessonId: string, completed: boolean) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    const newCompletedIds = completed
      ? [...(cls.completed_lesson_ids || []), lessonId]
      : (cls.completed_lesson_ids || []).filter(id => id !== lessonId);
    await saveClass({ ...cls, completed_lesson_ids: newCompletedIds });
  }, [classes, saveClass]);

  // --- Timetable ---

  const updateTimetableEntry = useCallback(async (updatedEntry: TimetableEntry) => {
    try {
      // Auto-associate meeting record for meeting-type entries
      if (updatedEntry.type === 'meeting' && !updatedEntry.meeting_record_id) {
        const entryDate = updatedEntry.date || format(new Date(), 'yyyy-MM-dd');
        const match = meetings.find(m => m.date === entryDate && m.title === updatedEntry.subject);
        if (match) {
          updatedEntry = { ...updatedEntry, meeting_record_id: match.id };
        } else {
          try {
            const created = await meetingService.create({
              title: updatedEntry.subject,
              date: entryDate,
              duration: 0,
              transcript: '',
              ai_summary: null,
              category: 'other',
              participants: [],
              status: 'draft',
              created_at: new Date().toISOString(),
            });
            setMeetings(prev => [...prev, created]);
            updatedEntry = { ...updatedEntry, meeting_record_id: created.id };
          } catch {
            // silent fallback
          }
        }
      }
      await timetableService.update(updatedEntry.id, updatedEntry);
      setTimetable(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));

      // Auto-upsert LessonRecord for lesson entries with topic or notes
      if (updatedEntry.type === 'lesson' && (updatedEntry.topic || updatedEntry.notes)) {
        const recordDate = updatedEntry.date || format(new Date(), 'yyyy-MM-dd');
        const existing = lessonRecords.find(
          r => r.date === recordDate && r.class_name === updatedEntry.class_name
        );
        if (existing) {
          const updates: Partial<LessonRecord> = {};
          if (updatedEntry.topic) updates.topic = updatedEntry.topic;
          if (updatedEntry.notes) updates.notes = updatedEntry.notes;
          try {
            const updated = await lessonRecordService.update(existing.id, { ...existing, ...updates });
            setLessonRecords(prev => prev.map(r => r.id === existing.id ? { ...r, ...updated } : r));
          } catch {
            // silent fallback
          }
        } else {
          try {
            const created = await lessonRecordService.create({
              date: recordDate,
              class_name: updatedEntry.class_name,
              topic: updatedEntry.topic || '',
              notes: updatedEntry.notes || '',
              progress: '',
              homework_assigned: '',
              next_lesson_plan: '',
              timetable_entry_id: updatedEntry.id,
            });
            setLessonRecords(prev => [...prev, created]);
          } catch {
            // silent fallback
          }
        }
      }
    } catch (error) {
      toast.error('Failed to update timetable entry');
    }
  }, [setTimetable, toast, lessonRecords, setLessonRecords]);

  const addTimetableEntry = useCallback(async (newEntry: TimetableEntry) => {
    try {
      // Auto-associate meeting record for meeting-type entries
      if (newEntry.type === 'meeting' && !newEntry.meeting_record_id) {
        const entryDate = newEntry.date || format(new Date(), 'yyyy-MM-dd');
        const match = meetings.find(m => m.date === entryDate && m.title === newEntry.subject);
        if (match) {
          newEntry = { ...newEntry, meeting_record_id: match.id };
        } else {
          try {
            const mr = await meetingService.create({
              title: newEntry.subject,
              date: entryDate,
              duration: 0,
              transcript: '',
              ai_summary: null,
              category: 'other',
              participants: [],
              status: 'draft',
              created_at: new Date().toISOString(),
            });
            setMeetings(prev => [...prev, mr]);
            newEntry = { ...newEntry, meeting_record_id: mr.id };
          } catch {
            // silent fallback
          }
        }
      }
      const created = await timetableService.create(newEntry);
      setTimetable(prev => [...prev, created]);
      toast.success('Entry added to schedule');

      // Auto-create LessonRecord for lesson entries with topic or notes
      if (created.type === 'lesson' && (created.topic || created.notes)) {
        const recordDate = created.date || format(new Date(), 'yyyy-MM-dd');
        const existing = lessonRecords.find(
          r => r.date === recordDate && r.class_name === created.class_name
        );
        if (!existing) {
          try {
            const lr = await lessonRecordService.create({
              date: recordDate,
              class_name: created.class_name,
              topic: created.topic || '',
              notes: created.notes || '',
              progress: '',
              homework_assigned: '',
              next_lesson_plan: '',
              timetable_entry_id: created.id,
            });
            setLessonRecords(prev => [...prev, lr]);
          } catch {
            // silent fallback
          }
        }
      }
    } catch (error) {
      toast.error('Failed to add timetable entry');
    }
  }, [setTimetable, toast, lessonRecords, setLessonRecords]);

  const deleteTimetableEntry = useCallback(async (id: string) => {
    try {
      await timetableService.delete(id);
      setTimetable(prev => prev.filter(e => e.id !== id));
      toast.success('Entry removed from schedule');
    } catch (error) {
      toast.error('Failed to delete timetable entry');
    }
  }, [setTimetable, toast]);

  // --- Ideas ---

  const addIdea = useCallback(async (data: { title: string; content: string; category: Idea['category']; priority: Idea['priority']; show_on_dashboard?: boolean }) => {
    try {
      const created = await ideaService.create({
        status: 'pending',
        created_at: new Date().toISOString(),
        ...data,
      });
      setIdeas(prev => [...prev, created]);
      toast.success('Idea saved');
    } catch (error) {
      toast.error('Failed to save idea');
    }
  }, [setIdeas, toast]);

  const updateIdea = useCallback(async (id: string, updates: Partial<Idea>) => {
    const existing = ideas.find(i => i.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await ideaService.update(id, merged);
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
      toast.success('Idea updated');
    } catch (error) {
      toast.error('Failed to update idea');
    }
  }, [ideas, setIdeas, toast]);

  const deleteIdea = useCallback(async (id: string) => {
    try {
      await ideaService.delete(id);
      setIdeas(prev => prev.filter(i => i.id !== id));
      toast.success('Idea deleted');
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  }, [setIdeas, toast]);

  const toggleIdeaStatus = useCallback(async (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;
    const cycle: Record<string, Idea['status']> = { note: 'pending', pending: 'processed', processed: 'note' };
    const newStatus = cycle[idea.status] || 'pending';
    try {
      await ideaService.update(id, { ...idea, status: newStatus });
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
      toast.success('Idea status updated');
    } catch (error) {
      toast.error('Failed to update idea status');
    }
  }, [ideas, setIdeas, toast]);

  const toggleIdeaDashboard = useCallback(async (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;
    const newVal = !idea.show_on_dashboard;
    try {
      await ideaService.update(id, { ...idea, show_on_dashboard: newVal });
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, show_on_dashboard: newVal } : i));
      toast.success(newVal ? 'Shown on Dashboard' : 'Hidden from Dashboard');
    } catch (error) {
      toast.error('Failed to update dashboard visibility');
    }
  }, [ideas, setIdeas, toast]);

  const consolidateIdeas = useCallback(async (
    selectedIds: string[],
    consolidated: { title: string; content: string; category: Idea['category']; priority: Idea['priority'] }
  ) => {
    try {
      await Promise.all(selectedIds.map(id => ideaService.delete(id)));
      setIdeas(prev => prev.filter(i => !selectedIds.includes(i.id)));

      const created = await ideaService.create({
        status: 'pending',
        created_at: new Date().toISOString(),
        ...consolidated,
      });
      setIdeas(prev => [...prev, created]);
      toast.success(`Consolidated ${selectedIds.length} ideas into 1`);
    } catch (error) {
      toast.error('Failed to consolidate ideas');
      throw error;
    }
  }, [setIdeas, toast]);

  // --- SOPs ---

  const addSOP = useCallback(async (data: { title: string; category: string; content: string }) => {
    try {
      const created = await sopService.create(data);
      setSops(prev => [...prev, created]);
      toast.success('SOP added');
    } catch (error) {
      toast.error('Failed to add SOP');
    }
  }, [setSops, toast]);

  const updateSOP = useCallback(async (id: string, updates: Partial<SOP>) => {
    const existing = sops.find(s => s.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await sopService.update(id, merged);
      setSops(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      toast.success('SOP updated');
    } catch (error) {
      toast.error('Failed to update SOP');
    }
  }, [sops, setSops, toast]);

  const deleteSOP = useCallback(async (id: string) => {
    try {
      await sopService.delete(id);
      setSops(prev => prev.filter(s => s.id !== id));
      toast.success('SOP deleted');
    } catch (error) {
      toast.error('Failed to delete SOP');
    }
  }, [setSops, toast]);

  const consolidateSOPs = useCallback(async (
    selectedIds: string[],
    consolidated: { title: string; content: string; category: string }
  ) => {
    try {
      await Promise.all(selectedIds.map(id => sopService.delete(id)));
      setSops(prev => prev.filter(s => !selectedIds.includes(s.id)));

      const created = await sopService.create(consolidated);
      setSops(prev => [...prev, created]);
      toast.success(`Consolidated ${selectedIds.length} SOPs into 1`);
    } catch (error) {
      toast.error('Failed to consolidate SOPs');
      throw error;
    }
  }, [setSops, toast]);

  // --- Work Logs ---

  const addWorkLog = useCallback(async (data: { content: string; category: WorkLog['category']; tags?: string[] }) => {
    try {
      const created = await workLogService.create({
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
        ...data,
      });
      setWorkLogs(prev => [created, ...prev]);
      toast.success('Work log added');
    } catch (error) {
      toast.error('Failed to add work log');
    }
  }, [setWorkLogs, toast]);

  const updateWorkLog = useCallback(async (id: string, updates: Partial<WorkLog>) => {
    const existing = workLogs.find(l => l.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await workLogService.update(id, merged);
      setWorkLogs(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
      toast.success('Work log updated');
    } catch (error) {
      toast.error('Failed to update work log');
    }
  }, [workLogs, setWorkLogs, toast]);

  const deleteWorkLog = useCallback(async (id: string) => {
    try {
      await workLogService.delete(id);
      setWorkLogs(prev => prev.filter(l => l.id !== id));
      toast.success('Work log deleted');
    } catch (error) {
      toast.error('Failed to delete work log');
    }
  }, [setWorkLogs, toast]);

  const consolidateWorkLogs = useCallback(async (
    selectedIds: string[],
    consolidated: { content: string; category: WorkLog['category']; tags?: string[] }
  ) => {
    try {
      await Promise.all(selectedIds.map(id => workLogService.delete(id)));
      setWorkLogs(prev => prev.filter(l => !selectedIds.includes(l.id)));

      const created = await workLogService.create({
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
        ...consolidated,
      });
      setWorkLogs(prev => [created, ...prev]);
      toast.success(`Consolidated ${selectedIds.length} logs into 1`);
    } catch (error) {
      toast.error('Failed to consolidate work logs');
      throw error;
    }
  }, [setWorkLogs, toast]);

  // --- Goals ---

  const addGoal = useCallback(async (data: Omit<Goal, 'id'>) => {
    try {
      const created = await goalService.create(data);
      setGoals(prev => [...prev, created]);
      toast.success('Goal added');
    } catch (error) {
      toast.error('Failed to add goal');
    }
  }, [setGoals, toast]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const existing = goals.find(g => g.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await goalService.update(id, merged);
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
      toast.success('Goal updated');
    } catch (error) {
      toast.error('Failed to update goal');
    }
  }, [goals, setGoals, toast]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await goalService.delete(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  }, [setGoals, toast]);

  // --- School Events ---

  const addSchoolEvent = useCallback(async (data: Omit<SchoolEvent, 'id'>) => {
    try {
      const created = await schoolEventService.create(data);
      setSchoolEvents(prev => [...prev, created]);
      toast.success('Event added');
    } catch (error) {
      toast.error('Failed to add event');
    }
  }, [setSchoolEvents, toast]);

  const updateSchoolEvent = useCallback(async (id: string, updates: Partial<SchoolEvent>) => {
    const existing = schoolEvents.find(e => e.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await schoolEventService.update(id, merged);
      setSchoolEvents(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
      toast.success('Event updated');
    } catch (error) {
      toast.error('Failed to update event');
    }
  }, [schoolEvents, setSchoolEvents, toast]);

  const deleteSchoolEvent = useCallback(async (id: string) => {
    try {
      await schoolEventService.delete(id);
      setSchoolEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  }, [setSchoolEvents, toast]);

  // --- Meetings ---

  const addMeeting = useCallback(async (data: Omit<MeetingRecord, 'id'>) => {
    try {
      const created = await meetingService.create(data);
      setMeetings(prev => [...prev, created]);
      toast.success('Meeting created');
      return created;
    } catch (error) {
      toast.error('Failed to create meeting');
      throw error;
    }
  }, [setMeetings, toast]);

  const updateMeeting = useCallback(async (id: string, updates: Partial<MeetingRecord>) => {
    const existing = meetings.find(m => m.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await meetingService.update(id, merged);
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
      toast.success('Meeting updated');
    } catch (error) {
      toast.error('Failed to update meeting');
    }
  }, [meetings, setMeetings, toast]);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      await meetingService.delete(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      toast.success('Meeting deleted');
    } catch (error) {
      toast.error('Failed to delete meeting');
    }
  }, [setMeetings, toast]);

  // --- Email Digests ---

  const addEmailDigest = useCallback(async (data: Omit<EmailDigest, 'id'>) => {
    try {
      const created = await emailDigestService.create(data);
      setEmailDigests(prev => [...prev, created]);
      toast.success('Email digest created');
      return created;
    } catch (error) {
      toast.error('Failed to create email digest');
      throw error;
    }
  }, [setEmailDigests, toast]);

  const updateEmailDigest = useCallback(async (id: string, updates: Partial<EmailDigest>) => {
    const existing = emailDigests.find(d => d.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await emailDigestService.update(id, merged);
      setEmailDigests(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    } catch (error) {
      toast.error('Failed to update email digest');
    }
  }, [emailDigests, setEmailDigests, toast]);

  const deleteEmailDigest = useCallback(async (id: string) => {
    try {
      await emailDigestService.delete(id);
      setEmailDigests(prev => prev.filter(d => d.id !== id));
      toast.success('Email digest deleted');
    } catch (error) {
      toast.error('Failed to delete email digest');
    }
  }, [setEmailDigests, toast]);

  // --- House Point Delta Helper ---

  const computeHousePointDeltas = (
    oldAwards: HousePointAward[],
    newAwards: HousePointAward[],
  ): Map<string, number> => {
    const deltas = new Map<string, number>();
    for (const a of oldAwards) {
      deltas.set(a.student_id, (deltas.get(a.student_id) || 0) - a.points);
    }
    for (const a of newAwards) {
      deltas.set(a.student_id, (deltas.get(a.student_id) || 0) + a.points);
    }
    // Remove zero-delta entries
    for (const [id, d] of deltas) {
      if (d === 0) deltas.delete(id);
    }
    return deltas;
  };

  const applyHousePointDeltas = useCallback(async (deltas: Map<string, number>) => {
    for (const [studentId, delta] of deltas) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        await saveStudent({
          ...student,
          house_points: Math.max(0, student.house_points + delta),
        });
      }
    }
  }, [students, saveStudent]);

  const batchAwardHP = useCallback(async (
    awards: { student_id: string; points: number; reason: string }[]
  ) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      for (const award of awards) {
        const student = students.find(s => s.id === award.student_id);
        if (student) {
          await saveStudent({
            ...student,
            house_points: student.house_points + award.points,
          });
        }
      }
      // Create HP award logs
      const logEntries: Omit<HPAwardLog, 'id'>[] = awards.map(award => {
        const student = students.find(s => s.id === award.student_id);
        return {
          date: today,
          student_id: award.student_id,
          student_name: student?.name || 'Unknown',
          class_name: student?.class_name || '',
          points: award.points,
          reason: award.reason || 'House Points Award',
          source: 'batch' as const,
        };
      });
      const createdLogs = await hpAwardService.createBatch(logEntries);
      setHpAwardLogs(prev => [...prev, ...createdLogs]);

      const totalPoints = awards.reduce((sum, a) => sum + a.points, 0);
      toast.success(`Awarded ${totalPoints} HP to ${awards.length} student${awards.length !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to award house points');
    }
  }, [students, saveStudent, toast, setHpAwardLogs]);

  // --- Lesson Records ---

  const addLessonRecord = useCallback(async (data: Omit<LessonRecord, 'id'>) => {
    try {
      const created = await lessonRecordService.create(data);
      setLessonRecords(prev => [...prev, created]);
      // Sync house points for new awards
      const awards = data.house_point_awards || [];
      if (awards.length > 0) {
        const deltas = computeHousePointDeltas([], awards);
        await applyHousePointDeltas(deltas);
        // Create HP award logs
        const logEntries: Omit<HPAwardLog, 'id'>[] = awards.map(a => ({
          date: data.date || format(new Date(), 'yyyy-MM-dd'),
          student_id: a.student_id,
          student_name: a.student_name,
          class_name: data.class_name,
          points: a.points,
          reason: a.reason || 'Lesson HP Award',
          source: 'lesson' as const,
          source_id: created.id,
        }));
        const createdLogs = await hpAwardService.createBatch(logEntries);
        setHpAwardLogs(prev => [...prev, ...createdLogs]);
      }
      toast.success('Lesson record added');
    } catch (error) {
      toast.error('Failed to add lesson record');
    }
  }, [setLessonRecords, toast, applyHousePointDeltas, setHpAwardLogs]);

  const updateLessonRecord = useCallback(async (id: string, updates: Partial<LessonRecord>) => {
    const existing = lessonRecords.find(r => r.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await lessonRecordService.update(id, merged);
      setLessonRecords(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
      // Sync house point deltas
      const oldAwards = existing.house_point_awards || [];
      const newAwards = updates.house_point_awards || existing.house_point_awards || [];
      if (oldAwards.length > 0 || newAwards.length > 0) {
        const deltas = computeHousePointDeltas(oldAwards, newAwards);
        await applyHousePointDeltas(deltas);
        // Delete old HP logs for this lesson and recreate
        await hpAwardService.deleteBySourceId(id);
        setHpAwardLogs(prev => prev.filter(l => l.source_id !== id));
        if (newAwards.length > 0) {
          const logEntries: Omit<HPAwardLog, 'id'>[] = newAwards.map(a => ({
            date: merged.date || format(new Date(), 'yyyy-MM-dd'),
            student_id: a.student_id,
            student_name: a.student_name,
            class_name: merged.class_name,
            points: a.points,
            reason: a.reason || 'Lesson HP Award',
            source: 'lesson' as const,
            source_id: id,
          }));
          const createdLogs = await hpAwardService.createBatch(logEntries);
          setHpAwardLogs(prev => [...prev, ...createdLogs]);
        }
      }
      toast.success('Lesson record updated');
    } catch (error) {
      toast.error('Failed to update lesson record');
    }
  }, [lessonRecords, setLessonRecords, toast, applyHousePointDeltas, setHpAwardLogs]);

  const deleteLessonRecord = useCallback(async (id: string) => {
    const existing = lessonRecords.find(r => r.id === id);
    try {
      await lessonRecordService.delete(id);
      setLessonRecords(prev => prev.filter(r => r.id !== id));
      // Reverse house points for deleted record
      const awards = existing?.house_point_awards || [];
      if (awards.length > 0) {
        const deltas = computeHousePointDeltas(awards, []);
        await applyHousePointDeltas(deltas);
      }
      // Delete associated HP award logs
      await hpAwardService.deleteBySourceId(id);
      setHpAwardLogs(prev => prev.filter(l => l.source_id !== id));
      toast.success('Lesson record deleted');
    } catch (error) {
      toast.error('Failed to delete lesson record');
    }
  }, [lessonRecords, setLessonRecords, toast, applyHousePointDeltas, setHpAwardLogs]);

  // --- Tasks (GTD) ---

  const addTask = useCallback(async (data: Omit<Task, 'id' | 'created_at'>) => {
    try {
      // Strip undefined values to avoid PostgREST issues
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      ) as Omit<Task, 'id' | 'created_at'>;
      const created = await taskService.create({
        ...cleanData,
        created_at: new Date().toISOString(),
      });
      setTasks(prev => [...prev, created]);
      toast.success('Task added');
      return created;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('addTask failed:', error);
      toast.error(`Failed to add task: ${msg}`);
      throw error;
    }
  }, [setTasks, toast]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const existing = tasks.find(t => t.id === id);
    if (!existing) return;
    // Auto-set completed_at when moving to done
    if (updates.status === 'done' && existing.status !== 'done') {
      updates.completed_at = new Date().toISOString();
    } else if (updates.status && updates.status !== 'done') {
      updates.completed_at = undefined;
    }
    const merged = { ...existing, ...updates };
    try {
      const updated = await taskService.update(id, merged);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  }, [tasks, setTasks, toast]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  }, [setTasks, toast]);

  const cycleTaskStatus = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const cycle: Record<string, Task['status']> = {
      inbox: 'next', next: 'waiting', waiting: 'someday', someday: 'done', done: 'inbox'
    };
    const newStatus = cycle[task.status] || 'inbox';
    await updateTask(id, { status: newStatus });
  }, [tasks, updateTask]);

  // --- HP Award Logs ---

  const deleteHPAwardLog = useCallback(async (id: string) => {
    try {
      await hpAwardService.delete(id);
      setHpAwardLogs(prev => prev.filter(l => l.id !== id));
      toast.success('HP award log deleted');
    } catch (error) {
      toast.error('Failed to delete HP award log');
    }
  }, [setHpAwardLogs, toast]);

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
      teachingUnits: (v) => setTeachingUnits(v as TeachingUnit[]),
      classes: (v) => setClasses(v as ClassProfile[]),
      timetable: (v) => setTimetable(v as TimetableEntry[]),
      ideas: (v) => setIdeas(v as Idea[]),
      sops: (v) => setSops(v as SOP[]),
      goals: (v) => setGoals(v as Goal[]),
      schoolEvents: (v) => setSchoolEvents(v as SchoolEvent[]),
      workLogs: (v) => setWorkLogs(v as WorkLog[]),
      meetings: (v) => setMeetings(v as MeetingRecord[]),
      lessonRecords: (v) => setLessonRecords(v as LessonRecord[]),
      tasks: (v) => setTasks(v as Task[]),
      hpAwardLogs: (v) => setHpAwardLogs(v as HPAwardLog[]),
      emailDigests: (v) => setEmailDigests(v as EmailDigest[]),
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
  }, [setStudents, setTeachingUnits, setClasses, setTimetable, setIdeas, setSops, setGoals, setSchoolEvents, setWorkLogs, setMeetings, setLessonRecords, setTasks, setHpAwardLogs, setEmailDigests, toast]);

  return {
    // State
    timetable, students, teachingUnits, classes,
    ideas, sops, goals, schoolEvents, workLogs, meetings, lessonRecords, tasks, hpAwardLogs, emailDigests,
    toasts,

    // Student
    saveStudent, deleteStudent, addStatusRecord, updateStatusRecord, deleteStatusRecord, addWeakness, updateWeakness, deleteWeakness,
    addStudentRequest, updateStudentRequest, updateRequestDate, deleteStudentRequest, toggleRequestStatus,
    addParentCommunication, updateParentCommunication, addParentCommFollowUp, updateParentCommDate, deleteParentCommunication, toggleParentCommunicationStatus,
    addExamRecord, batchAwardHP,

    // Teaching
    saveTeachingUnit, deleteTeachingUnit,

    // Class
    saveClass, deleteClass, updateClassProgress,

    // Timetable
    updateTimetableEntry, addTimetableEntry, deleteTimetableEntry,

    // Ideas / SOPs / WorkLogs
    addIdea, updateIdea, deleteIdea, toggleIdeaStatus, toggleIdeaDashboard, consolidateIdeas,
    addSOP, updateSOP, deleteSOP, consolidateSOPs,
    addWorkLog, updateWorkLog, deleteWorkLog, consolidateWorkLogs,

    // Goals
    addGoal, updateGoal, deleteGoal,

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
