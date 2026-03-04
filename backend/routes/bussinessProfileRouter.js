import express from 'express';
import multer from 'multer';
import { clerkMiddleware } from '@clerk/express';
import path from 'path';
import {createBusinessProfile} from '../controllers/businessProfileController.js';


const businessProfileRouter = express.Router();

bussinessProfileRouter.use(clerkMiddleware());

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

//create 
bussinessProfileRouter.post('/', 
    upload.fields([{ name: 'logoNmae', maxCount: 1 },
    { name: 'stampName', maxCount: 1 },
    { name: 'signatureNameMeta', maxCount: 1 },
    ]),
    createBusinessProfile
);

//to update 
businessProfileRouter.put('/:id',
    upload.fields([{ name: 'logoNmae', maxCount: 1 },
    { name: 'stampName', maxCount: 1 }, 
    { name: 'signatureNameMeta', maxCount: 1 },
    ]),
    createBusinessProfile
);

businessProfileRouter.get("/me", getbusinessProfile);

export default businessProfileRouter;