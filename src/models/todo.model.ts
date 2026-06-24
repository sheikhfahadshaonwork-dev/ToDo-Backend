import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITodo, TodoStatus, TodoPriority } from '../types';

export interface TodoDocument extends Omit<ITodo, '_id'>, Document {}

const subtaskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true,
      minlength: [1, 'Subtask title must be at least 1 character'],
      maxlength: [200, 'Subtask title must not exceed 200 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true, versionKey: false },
);

const todoSchema = new Schema<TodoDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed', 'archived'] as TodoStatus[],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'] as TodoPriority[],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (tags: string[]) => tags.length <= 10,
          message: 'Cannot have more than 10 tags',
        },
        {
          validator: (tags: string[]) => tags.every((t) => t.length <= 50),
          message: 'Each tag must not exceed 50 characters',
        },
      ],
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes must not exceed 5000 characters'],
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes for efficient querying
todoSchema.index({ status: 1 });
todoSchema.index({ priority: 1 });
todoSchema.index({ dueDate: 1 });
todoSchema.index({ categoryId: 1 });
todoSchema.index({ createdAt: -1 });
todoSchema.index({ status: 1, priority: 1 });
todoSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware: set completedAt when status becomes 'completed'
todoSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'completed') {
      if (!this.completedAt) {
        this.completedAt = new Date();
      }
    } else {
      this.completedAt = undefined;
    }
  }
  next();
});

// Pre-findOneAndUpdate middleware: handle completedAt on update operations
todoSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (update && typeof update === 'object' && '$set' in update) {
    const setOp = update['$set'] as Record<string, unknown>;
    if (setOp && setOp['status'] === 'completed') {
      if (!setOp['completedAt']) {
        setOp['completedAt'] = new Date();
      }
    } else if (setOp && setOp['status'] && setOp['status'] !== 'completed') {
      (update as Record<string, unknown>)['$unset'] = { completedAt: '' };
    }
  }
  next();
});

const Todo: Model<TodoDocument> = mongoose.model<TodoDocument>('Todo', todoSchema);

export default Todo;
