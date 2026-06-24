import { Request, Response, NextFunction } from 'express';
import Todo from '../models/todo.model';
import { StatsResponse } from '../types';

export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const now = new Date();

    // Start and end of today in UTC
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const [
      total,
      statusAgg,
      priorityAgg,
      overdue,
      completedToday,
      dueToday,
    ] = await Promise.all([
      // Total count
      Todo.countDocuments(),

      // Group by status
      Todo.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Group by priority
      Todo.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Overdue: dueDate < now and status not in ['completed', 'archived']
      Todo.countDocuments({
        dueDate: { $lt: now },
        status: { $nin: ['completed', 'archived'] },
      }),

      // Completed today
      Todo.countDocuments({
        status: 'completed',
        completedAt: { $gte: todayStart, $lte: todayEnd },
      }),

      // Due today (regardless of status)
      Todo.countDocuments({
        dueDate: { $gte: todayStart, $lte: todayEnd },
      }),
    ]);

    // Build byStatus map with defaults
    const byStatus: StatsResponse['byStatus'] = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      archived: 0,
    };
    for (const entry of statusAgg) {
      const key = entry._id as keyof typeof byStatus;
      if (key in byStatus) {
        byStatus[key] = entry.count;
      }
    }

    // Build byPriority map with defaults
    const byPriority: StatsResponse['byPriority'] = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };
    for (const entry of priorityAgg) {
      const key = entry._id as keyof typeof byPriority;
      if (key in byPriority) {
        byPriority[key] = entry.count;
      }
    }

    const stats: StatsResponse = {
      total,
      byStatus,
      byPriority,
      overdue,
      completedToday,
      dueToday,
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}
