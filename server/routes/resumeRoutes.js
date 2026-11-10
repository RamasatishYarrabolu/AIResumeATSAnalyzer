import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';
import { analyzeResume, listResumes, uploadResume } from '../controllers/resumeController.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listResumes);
router.post('/upload', upload.single('resume'), uploadResume);
router.post('/analyze', analyzeResume);
export default router;
