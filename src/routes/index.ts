import { Router } from 'express';
import healthRoutes from './health.routes';
import todoRoutes from './todo.routes';
import categoryRoutes from './category.routes';
import statsRoutes from './stats.routes';

const router = Router();

router.use('/api/healthcheck', healthRoutes);
router.use('/api/todos', todoRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/stats', statsRoutes);

export default router;
