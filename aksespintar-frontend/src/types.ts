export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type MaterialListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  publishedAt: string;
  category: { name: string; slug: string };
};

export type Material = MaterialListItem & {
  content: string;
  updatedAt: string;
  author: { name: string };
};

export type Paged<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type QuizOption = {
  id: string;
  optionText: string;
};

export type QuizQuestion = {
  id: string;
  questionText: string;
  orderIndex: number;
  options: QuizOption[];
};

export type QuizBestAttempt = {
  id: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
};

export type MaterialQuiz = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number | null;
  questions: QuizQuestion[];
  bestAttempt: QuizBestAttempt | null;
};

export type QuizResult = {
  attempt: {
    id: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    completedAt: string;
  };
  review: {
    questionId: string;
    selectedOptionId: string | null;
    correctOptionId: string | null;
    isCorrect: boolean;
    explanation: string | null;
  }[];
};

export type LeaderboardEntry = {
  rank: number;
  id: string;
  name: string;
  totalScore: number;
  correctAnswers: number;
  wrongAnswers: number;
  quizzesTaken: number;
};

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string; role: string };
};

export type AdminOverview = {
  totalUsers: number;
  activeSessions: number;
  totalLogins: number;
  login24h: number;
  register24h: number;
  totalAudit: number;
};

export type AdminSessionInfo = {
  loginAt: string;
  lastSeenAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  minutesLoggedIn: number;
  minutesIdle: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  loginCount: number;
  lastLoginAt: string | null;
  createdAt: string;
  activeSessions: number;
  currentSession: AdminSessionInfo | null;
};

export type AdminSession = {
  id: string;
  user: { id: string; name: string; email: string; role: string };
  ipAddress: string | null;
  userAgent: string | null;
  loginAt: string;
  lastSeenAt: string;
  expiresAt: string;
  minutesLoggedIn: number;
  minutesIdle: number;
};

export type AdminActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: { ip?: string | null; userAgent?: string | null; loginKe?: number; durasiMenit?: number } | null;
  createdAt: string;
  actor: { name: string; email: string; role: string };
};
