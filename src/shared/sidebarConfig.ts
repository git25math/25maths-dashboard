import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  Lightbulb,
  Clock,
  Mic,
  Settings,
} from 'lucide-react';

export const SIDEBAR_ITEMS = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'timetable', icon: Calendar, label: 'Timetable' },
  { key: 'students', icon: Users, label: 'Students' },
  { key: 'teaching', icon: BookOpen, label: 'Teaching' },
  { key: 'ideas', icon: Lightbulb, label: 'Idea Pool' },
  { key: 'worklogs', icon: Clock, label: 'Work Logs' },
  { key: 'meetings', icon: Mic, label: 'Meetings' },
  { key: 'sop', icon: Settings, label: 'SOP Library' },
] as const;
