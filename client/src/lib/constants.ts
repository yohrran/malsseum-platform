export const POINT_EVENTS = {
  CHAPTER_COMPLETE: 10,
  DAILY_COMPLETE: 50,
  CUSTOM_DAY_COMPLETE: 30,
  SEASON_COMPLETE: 200,
  STREAK_7: 100,
  STREAK_30: 500,
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  READING: '/reading',
  BIBLE: '/bible',
  CUSTOM_PLAN: '/custom-plan',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
} as const;
