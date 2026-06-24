import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Todo from '../models/todo.model';
import {
  CreateTodoBody,
  UpdateTodoBody,
  CreateSubtaskBody,
  TodoQueryParams,
} from '../types';

// ─── List todos (paginated, filtered, sorted) ─────────────────────────────────

export async function listTodos(
  req: Request<object, object, object, TodoQueryParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      status,
      priority,
      categoryId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter
    const filter: mongoose.FilterQuery<typeof Todo> = {};

    if (status) filter['status'] = status;
    if (priority) filter['priority'] = priority;
    if (categoryId && mongoose.isValidObjectId(categoryId)) {
      filter['categoryId'] = new mongoose.Types.ObjectId(categoryId);
    }
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter['$or'] = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortDirection };

    const skip = (page - 1) * limit;

    const [todos, total] = await Promise.all([
      Todo.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('categoryId', 'name color icon')
        .lean(),
      Todo.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: todos,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Create todo ──────────────────────────────────────────────────────────────

export async function createTodo(
  req: Request<object, object, CreateTodoBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const todo = await Todo.create(req.body);
    const populated = await todo.populate('categoryId', 'name color icon');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
}

// ─── Get single todo ──────────────────────────────────────────────────────────

export async function getTodo(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid todo id' });
      return;
    }

    const todo = await Todo.findById(req.params.id)
      .populate('categoryId', 'name color icon')
      .lean();

    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }

    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
}

// ─── Update todo ──────────────────────────────────────────────────────────────

export async function updateTodo(
  req: Request<{ id: string }, object, UpdateTodoBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid todo id' });
      return;
    }

    const updateFields: Record<string, unknown> = {};
    const unsetFields: Record<string, unknown> = {};

    // Separate explicit null values (unset) from regular updates
    for (const [key, value] of Object.entries(req.body)) {
      if (value === null) {
        unsetFields[key] = '';
      } else {
        updateFields[key] = value;
      }
    }

    // Handle completedAt logic for status changes
    if (updateFields['status'] === 'completed') {
      updateFields['completedAt'] = new Date();
    } else if (updateFields['status'] && updateFields['status'] !== 'completed') {
      unsetFields['completedAt'] = '';
    }

    const updateOp: mongoose.UpdateQuery<typeof Todo> = {};
    if (Object.keys(updateFields).length > 0) updateOp['$set'] = updateFields;
    if (Object.keys(unsetFields).length > 0) updateOp['$unset'] = unsetFields;

    const todo = await Todo.findByIdAndUpdate(req.params.id, updateOp, {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name color icon');

    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }

    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
}

// ─── Delete todo ──────────────────────────────────────────────────────────────

export async function deleteTodo(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid todo id' });
      return;
    }

    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// ─── Toggle todo status ───────────────────────────────────────────────────────

export async function toggleTodo(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid todo id' });
      return;
    }

    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }

    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    todo.status = newStatus;
    if (newStatus === 'completed') {
      todo.completedAt = new Date();
    } else {
      todo.completedAt = undefined;
    }

    await todo.save();
    await todo.populate('categoryId', 'name color icon');

    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
}

// ─── Create subtask ───────────────────────────────────────────────────────────

export async function createSubtask(
  req: Request<{ id: string }, object, CreateSubtaskBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid todo id' });
      return;
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          subtasks: {
            title: req.body.title,
            completed: false,
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    ).populate('categoryId', 'name color icon');

    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }

    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
}

// ─── Toggle subtask ───────────────────────────────────────────────────────────

export async function toggleSubtask(
  req: Request<{ id: string; subtaskId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id, subtaskId } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid todo id' });
      return;
    }
    if (!mongoose.isValidObjectId(subtaskId)) {
      res.status(400).json({ success: false, message: 'Invalid subtask id' });
      return;
    }

    const todo = await Todo.findById(id);
    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }

    const subtask = todo.subtasks.find((s) => s._id.toString() === subtaskId);
    if (!subtask) {
      res.status(404).json({ success: false, message: 'Subtask not found' });
      return;
    }

    subtask.completed = !subtask.completed;
    await todo.save();
    await todo.populate('categoryId', 'name color icon');

    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
}

// ─── Delete subtask ───────────────────────────────────────────────────────────

export async function deleteSubtask(
  req: Request<{ id: string; subtaskId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id, subtaskId } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid todo id' });
      return;
    }
    if (!mongoose.isValidObjectId(subtaskId)) {
      res.status(400).json({ success: false, message: 'Invalid subtask id' });
      return;
    }

    const todo = await Todo.findByIdAndUpdate(
      id,
      { $pull: { subtasks: { _id: new mongoose.Types.ObjectId(subtaskId) } } },
      { new: true },
    ).populate('categoryId', 'name color icon');

    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }

    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
}
