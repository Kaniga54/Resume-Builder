import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { connectDB } from './db.js';
import { authenticateToken } from './middleware/auth.js';
import { register, login, getProfile } from './controllers/authController.js';
import { analyzeResumeFile, getHistory, getAnalysisDetails } from './controllers/resumeController.js';
import { getBuilderData, saveBuilderData } from './controllers/builderController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins for simplicity in local development, can be tightened later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for PDF file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  }
});

const apiRouter = express.Router();

// Authentication Routes
apiRouter.post('/auth/register', register);
apiRouter.post('/auth/login', login);
apiRouter.get('/auth/profile', authenticateToken, getProfile);

// Resume Analysis Routes
apiRouter.post('/resumes/analyze', authenticateToken, upload.single('resume'), analyzeResumeFile);
apiRouter.get('/resumes/history', authenticateToken, getHistory);
apiRouter.get('/resumes/analysis/:id', authenticateToken, getAnalysisDetails);

// Resume Builder Routes
apiRouter.get('/resumes/builder', authenticateToken, getBuilderData);
apiRouter.post('/resumes/builder', authenticateToken, saveBuilderData);

// Mount router on both local and Vercel rewrites prefixes
app.use('/api', apiRouter);
app.use('/api/backend', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'An unexpected error occurred.' });
});

// Start Server
async function startServer() {
  // Connect to database (will automatically fallback to local JSON file if MongoDB is not present)
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`VitaCV API Server is running on port ${PORT}`);
  });
}

startServer();
