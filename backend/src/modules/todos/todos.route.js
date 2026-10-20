import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.js';
import * as todosController from './todos.controller.js';
import {
    createTodoSchema,
    listTodoQuerySchema,
    todoIdParamSchema,
    updateTodoSchema,
} from './todos.schema.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(createTodoSchema), todosController.createTodoController);
router.get('/', validateQuery(listTodoQuerySchema), todosController.getTodosController);
router.get('/:id', validateParams(todoIdParamSchema), todosController.getTodoController);
router.patch('/:id', validateParams(todoIdParamSchema), validateBody(updateTodoSchema), todosController.updateTodoController);
router.delete('/:id', validateParams(todoIdParamSchema), todosController.deleteTodoController);

export default router;