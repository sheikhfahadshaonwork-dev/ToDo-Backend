import { Router } from 'express';
import {
  listCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator';

const router = Router();

// GET /api/categories
router.get('/', listCategories);

// POST /api/categories
router.post('/', validate(createCategorySchema, 'body'), createCategory);

// GET /api/categories/:id
router.get('/:id', getCategory);

// PUT /api/categories/:id
router.put('/:id', validate(updateCategorySchema, 'body'), updateCategory);

// DELETE /api/categories/:id
router.delete('/:id', deleteCategory);

export default router;
