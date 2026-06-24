import { Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TodoStatus = 'pending' | 'in-progress' | 'completed' | 'archived';
export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SortOrder = 'asc' | 'desc';

// ─── Subtask ──────────────────────────────────────────────────────────────────

export interface ISubtask {
  _id: Types.ObjectId;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// ─── Todo ─────────────────────────────────────────────────────────────────────

export interface ITodo {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: Date;
  categoryId?: Types.ObjectId;
  tags: string[];
  subtasks: ISubtask[];
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Request bodies ───────────────────────────────────────────────────────────

export interface CreateTodoBody {
  title: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
  categoryId?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateTodoBody {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string | null;
  categoryId?: string | null;
  tags?: string[];
  notes?: string;
}

export interface CreateSubtaskBody {
  title: string;
}

export interface CreateCategoryBody {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  color?: string;
  icon?: string;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface TodoQueryParams {
  status?: TodoStatus;
  priority?: TodoPriority;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

// ─── API Response shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface StatsResponse {
  total: number;
  byStatus: {
    pending: number;
    'in-progress': number;
    completed: number;
    archived: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  overdue: number;
  completedToday: number;
  dueToday: number;
}
