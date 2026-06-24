import Joi from 'joi';

const TODO_STATUSES = ['pending', 'in-progress', 'completed', 'archived'] as const;
const TODO_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
const SORT_FIELDS = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title', 'status'] as const;

export const createTodoSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().trim().messages({
    'string.empty': 'Title cannot be empty',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().max(2000).trim().optional().allow(''),
  status: Joi.string()
    .valid(...TODO_STATUSES)
    .default('pending'),
  priority: Joi.string()
    .valid(...TODO_PRIORITIES)
    .default('medium'),
  dueDate: Joi.date().iso().optional().allow(null),
  categoryId: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'categoryId must be a valid MongoDB ObjectId',
    }),
  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .default([])
    .messages({
      'array.max': 'Cannot have more than 10 tags',
    }),
  notes: Joi.string().max(5000).trim().optional().allow(''),
});

export const updateTodoSchema = Joi.object({
  title: Joi.string().min(1).max(200).trim().optional(),
  description: Joi.string().max(2000).trim().optional().allow('', null),
  status: Joi.string()
    .valid(...TODO_STATUSES)
    .optional(),
  priority: Joi.string()
    .valid(...TODO_PRIORITIES)
    .optional(),
  dueDate: Joi.date().iso().optional().allow(null),
  categoryId: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .optional()
    .allow(null, '')
    .messages({
      'string.pattern.base': 'categoryId must be a valid MongoDB ObjectId',
    }),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional().messages({
    'array.max': 'Cannot have more than 10 tags',
  }),
  notes: Joi.string().max(5000).trim().optional().allow('', null),
}).min(1);

export const queryTodoSchema = Joi.object({
  status: Joi.string()
    .valid(...TODO_STATUSES)
    .optional(),
  priority: Joi.string()
    .valid(...TODO_PRIORITIES)
    .optional(),
  categoryId: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'categoryId must be a valid MongoDB ObjectId',
    }),
  search: Joi.string().trim().max(200).optional().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid(...SORT_FIELDS)
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const createSubtaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().trim().messages({
    'string.empty': 'Subtask title cannot be empty',
    'string.max': 'Subtask title must not exceed 200 characters',
    'any.required': 'Subtask title is required',
  }),
});
