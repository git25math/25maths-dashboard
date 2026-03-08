import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { teachingService } from '../../services/teachingService';
import { classService } from '../../services/classService';
import { timetableService } from '../../services/timetableService';
import { meetingService } from '../../services/meetingService';
import { lessonRecordService } from '../../services/lessonRecordService';
import { hpAwardService } from '../../services/hpAwardService';
import { computeHousePointDeltas } from './housePointUtils';
import { TeachingUnit, ClassProfile, TimetableEntry, MeetingRecord, LessonRecord, HPAwardLog, ToastApi } from '../../types';

interface UseTeachingActionsParams {
  setTeachingUnits: Dispatch<SetStateAction<TeachingUnit[]>>;
  setClasses: Dispatch<SetStateAction<ClassProfile[]>>;
  setTimetable: Dispatch<SetStateAction<TimetableEntry[]>>;
  meetings: MeetingRecord[];
  setMeetings: Dispatch<SetStateAction<MeetingRecord[]>>;
  lessonRecords: LessonRecord[];
  setLessonRecords: Dispatch<SetStateAction<LessonRecord[]>>;
  setHpAwardLogs: Dispatch<SetStateAction<HPAwardLog[]>>;
  normalizeAndSortUnits: (units: TeachingUnit[]) => TeachingUnit[];
  applyHousePointDeltas: (deltas: Map<string, number>) => Promise<void>;
  toast: ToastApi;
}

export function useTeachingActions({
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
}: UseTeachingActionsParams) {
  const meetingsRef = useRef(meetings);       meetingsRef.current = meetings;
  const lessonRecordsRef = useRef(lessonRecords); lessonRecordsRef.current = lessonRecords;

  const saveTeachingUnit = useCallback(async (unitData: Omit<TeachingUnit, 'id'> | TeachingUnit) => {
    try {
      if ('id' in unitData) {
        const updated = await teachingService.updateUnit(unitData.id, unitData);
        setTeachingUnits(prev => normalizeAndSortUnits(prev.map(u => u.id === updated.id ? updated : u)));
        toast.success('Unit updated');
      } else {
        const created = await teachingService.createUnit(unitData);
        setTeachingUnits(prev => normalizeAndSortUnits([...prev, created]));
        toast.success('Unit added');
      }
    } catch (error) {
      toast.error('Failed to save teaching unit');
      throw error;
    }
  }, [normalizeAndSortUnits, setTeachingUnits, toast]);

  const deleteTeachingUnit = useCallback(async (id: string) => {
    try {
      await teachingService.deleteUnit(id);
      setTeachingUnits(prev => prev.filter(u => u.id !== id));
      toast.success('Unit deleted');
    } catch (error) {
      toast.error('Failed to delete teaching unit');
    }
  }, [setTeachingUnits, toast]);

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

  const updateTimetableEntry = useCallback(async (updatedEntry: TimetableEntry) => {
    try {
      // Auto-associate meeting record for meeting-type entries
      if (updatedEntry.type === 'meeting' && !updatedEntry.meeting_record_id) {
        const entryDate = updatedEntry.date || format(new Date(), 'yyyy-MM-dd');
        const match = meetingsRef.current.find(m => m.date === entryDate && m.title ===updatedEntry.subject);
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
        const existing = lessonRecordsRef.current.find(
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
  }, [setTimetable, toast, setLessonRecords, setMeetings]);

  const addTimetableEntry = useCallback(async (newEntry: TimetableEntry) => {
    try {
      // Auto-associate meeting record for meeting-type entries
      if (newEntry.type === 'meeting' && !newEntry.meeting_record_id) {
        const entryDate = newEntry.date || format(new Date(), 'yyyy-MM-dd');
        const match = meetingsRef.current.find(m => m.date === entryDate && m.title ===newEntry.subject);
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
        const existing = lessonRecordsRef.current.find(
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
  }, [setTimetable, toast, setLessonRecords, setMeetings]);

  const deleteTimetableEntry = useCallback(async (id: string) => {
    try {
      await timetableService.delete(id);
      setTimetable(prev => prev.filter(e => e.id !== id));
      toast.success('Entry removed from schedule');
    } catch (error) {
      toast.error('Failed to delete timetable entry');
    }
  }, [setTimetable, toast]);

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
    const existing = lessonRecordsRef.current.find(r => r.id === id);
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
  }, [setLessonRecords, toast, applyHousePointDeltas, setHpAwardLogs]);

  const deleteLessonRecord = useCallback(async (id: string) => {
    const existing = lessonRecordsRef.current.find(r => r.id === id);
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
  }, [setLessonRecords, toast, applyHousePointDeltas, setHpAwardLogs]);

  return {
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
  };
}
