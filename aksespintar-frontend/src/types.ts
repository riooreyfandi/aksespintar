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
