import express from 'express';
import multer from 'multer';
import { clerkMiddleware } from '@clerk/express';
import path from 'path';
import {
  createBusinessProfile,
  updateBusinessProfile,
  getMyBusinessProfile,
} from '../controllers/businessProfileController.js';

const businessProfileRouter = express.Router();

businessProfileRouter.use(clerkMiddleware());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `business-${unique}${ext}`);
  }
});

const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: 'logoName', maxCount: 1 },
  { name: 'stampName', maxCount: 1 },
  { name: 'signatureNameMeta', maxCount: 1 },
]);

// create
businessProfileRouter.post('/', uploadFields, createBusinessProfile);

// update
businessProfileRouter.put('/:id', uploadFields, updateBusinessProfile);

// get my profile
businessProfileRouter.get('/me', getMyBusinessProfile);

export default businessProfileRouter;