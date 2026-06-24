import Joi from 'joi';

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required().trim().messages({
    'string.empty': 'Category name cannot be empty',
    'string.max': 'Category name must not exceed 50 characters',
    'any.required': 'Category name is required',
  }),
  color: Joi.string()
    .pattern(HEX_COLOR_PATTERN)
    .default('#6366f1')
    .messages({
      'string.pattern.base': 'Color must be a valid hex color (e.g. #fff or #6366f1)',
    }),
  icon: Joi.string().trim().max(10).default('📁'),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).trim().optional().messages({
    'string.empty': 'Category name cannot be empty',
    'string.max': 'Category name must not exceed 50 characters',
  }),
  color: Joi.string()
    .pattern(HEX_COLOR_PATTERN)
    .optional()
    .messages({
      'string.pattern.base': 'Color must be a valid hex color (e.g. #fff or #6366f1)',
    }),
  icon: Joi.string().trim().max(10).optional(),
}).min(1);
