import { Router } from 'express';
import { userHandlerCreate, userHandlerDelete, userHandlerFriendCall, userHandlerInCall, userHandlerOutCall } from '../controllers/userHandler.js';

const router = Router();

router.route('/createRoom/:id/:pass').post(userHandlerCreate);
router.route('/deleteRoom/:id').post(userHandlerDelete);
router.route('/friendCall/:id').post(userHandlerFriendCall);
router.route('/inCall/:id').post(userHandlerInCall);
router.route('/outCall/:id').post(userHandlerOutCall);

export default router;