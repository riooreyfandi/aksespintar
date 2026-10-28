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
