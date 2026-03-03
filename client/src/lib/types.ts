export type User = {
  _id: string;
  googleId: string;
  email: string;
  displayName: string;
  picture?: string;
  totalPoints: number;
  preferredBibleId: string;
  preferredLanguage: string;
};

export type Day = {
  date: string;
  bookAbbr: string;
  chapters: number[];
  isCompleted: boolean;
  completedAt?: string;
};

export type Season = {
  _id: string;
  seasonNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  label: string;
  days: Day[];
  isCompleted: boolean;
  completedAt?: string;
};

export type CustomPlan = {
  _id: string;
  userId: string;
  title: string;
  seasons: Season[];
  createdAt: string;
  updatedAt: string;
};

export type DayPlan = {
  _id: string;
  dayNumber: number;
  scheduledDate: string;
  chapterRefs: string[];
  isCompleted: boolean;
  completedAt?: string;
};

export type ReadingPlan = {
  _id: string;
  userId: string;
  planType: 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  chaptersPerDay: number;
  isActive: boolean;
  days: DayPlan[];
};

export type PointsLedger = {
  _id: string;
  eventType: string;
  points: number;
  description: string;
  createdAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type LeaderboardEntry = {
  _id: string;
  displayName: string;
  picture?: string;
  totalPoints: number;
  rank: number;
};
