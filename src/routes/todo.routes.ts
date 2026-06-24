import { Router } from 'express';
import {
  listTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
} from '../controllers/todo.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createTodoSchema,
  updateTodoSchema,
  queryTodoSchema,
  createSubtaskSchema,
} from '../validators/todo.validator';

const router = Router();

// GET /api/todos
router.get('/', validate(queryTodoSchema, 'query'), listTodos);

// POST /api/todos
router.post('/', validate(createTodoSchema, 'body'), createTodo);

// GET /api/todos/:id
router.get('/:id', getTodo);

// PUT /api/todos/:id
router.put('/:id', validate(updateTodoSchema, 'body'), updateTodo);

// DELETE /api/todos/:id
router.delete('/:id', deleteTodo);

// PATCH /api/todos/:id/toggle
router.patch('/:id/toggle', toggleTodo);

// POST /api/todos/:id/subtasks
router.post('/:id/subtasks', validate(createSubtaskSchema, 'body'), createSubtask);

// PATCH /api/todos/:id/subtasks/:subtaskId/toggle
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);

// DELETE /api/todos/:id/subtasks/:subtaskId
router.delete('/:id/subtasks/:subtaskId', deleteSubtask);

export default router;
