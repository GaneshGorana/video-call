import { Router } from 'express';
import {
    userHandlerCheckRoom,
    userHandlerCreate,
    userHandlerDelete,
    userHandlerFriendCall,
    userHandlerGet,
    userHandlerInCall,
    userHandlerIncomingCall,
    userHandlerOutCall,
    userHandlerResetIncomingCall,
    userHandlerSetLoggedOut
} from '../controllers/userHandler.js';

const router = Router();

router.route('/getUser/:id').post(userHandlerGet)
router.route('/createRoom/:id/:pass').post(userHandlerCreate);
router.route('/logout/:id').post(userHandlerSetLoggedOut);
router.route('/deleteRoom/:id').post(userHandlerDelete);
router.route('/friendCall/:id').post(userHandlerFriendCall);
router.route('/incomingCall/:id').post(userHandlerIncomingCall);
router.route('/resetIncomingCall/:id').post(userHandlerResetIncomingCall);
router.route('/inCall/:id').post(userHandlerInCall);
router.route('/outCall/:id').post(userHandlerOutCall);
router.route('/checkRoom/:id').post(userHandlerCheckRoom);

export default router;