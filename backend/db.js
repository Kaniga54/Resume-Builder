import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const LOCAL_DB_PATH = isVercel
  ? path.join('/tmp', 'local_db.json')
  : path.join(__dirname, 'data', 'local_db.json');

let useMongoDB = false;

// Define Schemas for MongoDB
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ResumeAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  score: { type: Number, required: true },
  breakdown: {
    keywords: Number,
    formatting: Number,
    sections: Number,
    contact: Number
  },
  sectionsFound: [String],
  sectionsMissing: [String],
  suggestions: [{
    category: String,
    message: String,
    severity: String // 'high', 'medium', 'low'
  }],
  resumeText: String,
  jobDescription: String,
  createdAt: { type: Date, default: Date.now }
});

const ResumeBuilderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, default: '' },
  title: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  summary: { type: String, default: '' },
  experience: [{
    company: String,
    role: String,
    location: String,
    dates: String,
    description: String
  }],
  education: [{
    school: String,
    degree: String,
    dates: String,
    grade: String
  }],
  skills: [String],
  projects: [{
    name: String,
    description: String,
    link: String
  }],
  selectedTemplate: { type: String, default: 'modern' },
  updatedAt: { type: Date, default: Date.now }
});

let UserModel;
let ResumeAnalysisModel;
let ResumeBuilderModel;

// Local JSON Database Helper functions
async function ensureLocalDB() {
  try {
    await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
    try {
      await fs.access(LOCAL_DB_PATH);
    } catch {
      await fs.writeFile(LOCAL_DB_PATH, JSON.stringify({ users: [], analyses: [], builders: [] }, null, 2));
    }
  } catch (err) {
    console.error('Failed to initialize local JSON database:', err);
  }
}

async function readLocalDB() {
  await ensureLocalDB();
  const data = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
  return JSON.parse(data);
}

async function writeLocalDB(data) {
  await ensureLocalDB();
  await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

// Database Connection
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(uri);
      useMongoDB = true;
      UserModel = mongoose.model('User', UserSchema);
      ResumeAnalysisModel = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
      ResumeBuilderModel = mongoose.model('ResumeBuilder', ResumeBuilderSchema);
      console.log('MongoDB connected successfully!');
      return true;
    } catch (err) {
      console.error('MongoDB connection failed. Falling back to local JSON database.', err.message);
    }
  } else {
    console.log('No MONGODB_URI found. Using local JSON database fallback.');
  }

  // Set up local file DB fallback
  useMongoDB = false;
  await ensureLocalDB();
  console.log(`Local JSON Database active at: ${LOCAL_DB_PATH}`);
  return false;
}

// Common DB Interface Functions
export const db = {
  isMongoDB: () => useMongoDB,

  // Users
  async findUserByEmail(email) {
    if (useMongoDB) {
      return await UserModel.findOne({ email: email.toLowerCase() });
    } else {
      const data = await readLocalDB();
      const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  },

  async findUserById(id) {
    if (useMongoDB) {
      return await UserModel.findById(id);
    } else {
      const data = await readLocalDB();
      const user = data.users.find(u => u.id === id);
      return user || null;
    }
  },

  async createUser({ name, email, password }) {
    if (useMongoDB) {
      const user = new UserModel({ name, email: email.toLowerCase(), password });
      return await user.save();
    } else {
      const data = await readLocalDB();
      const newUser = {
        id: Math.random().toString(36).substring(2, 15),
        name,
        email: email.toLowerCase(),
        password,
        createdAt: new Date().toISOString()
      };
      data.users.push(newUser);
      await writeLocalDB(data);
      return newUser;
    }
  },

  // Resume Analyses
  async saveAnalysis(analysisData) {
    if (useMongoDB) {
      const analysis = new ResumeAnalysisModel(analysisData);
      return await analysis.save();
    } else {
      const data = await readLocalDB();
      const newAnalysis = {
        id: Math.random().toString(36).substring(2, 15),
        ...analysisData,
        createdAt: new Date().toISOString()
      };
      data.analyses.push(newAnalysis);
      await writeLocalDB(data);
      return newAnalysis;
    }
  },

  async getAnalysisById(id) {
    if (useMongoDB) {
      return await ResumeAnalysisModel.findById(id);
    } else {
      const data = await readLocalDB();
      const analysis = data.analyses.find(a => a.id === id);
      return analysis || null;
    }
  },

  async getHistoryByUserId(userId) {
    if (useMongoDB) {
      // Return history sorted by date descending, excluding heavy text content for list
      return await ResumeAnalysisModel.find({ userId })
        .select('-resumeText -jobDescription')
        .sort({ createdAt: -1 });
    } else {
      const data = await readLocalDB();
      // Filter, map (to exclude heavy text), and sort
      return data.analyses
        .filter(a => a.userId === userId)
        .map(({ resumeText, jobDescription, ...rest }) => rest)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  // Resume Builder Data
  async getBuilderData(userId) {
    if (useMongoDB) {
      return await ResumeBuilderModel.findOne({ userId });
    } else {
      const data = await readLocalDB();
      if (!data.builders) data.builders = [];
      const builder = data.builders.find(b => b.userId === userId);
      return builder || null;
    }
  },

  async saveBuilderData(userId, builderData) {
    if (useMongoDB) {
      return await ResumeBuilderModel.findOneAndUpdate(
        { userId },
        { ...builderData, updatedAt: new Date() },
        { new: true, upsert: true }
      );
    } else {
      const data = await readLocalDB();
      if (!data.builders) data.builders = [];
      
      const index = data.builders.findIndex(b => b.userId === userId);
      const updatedBuilder = {
        userId,
        ...builderData,
        updatedAt: new Date().toISOString()
      };

      if (index >= 0) {
        data.builders[index] = updatedBuilder;
      } else {
        data.builders.push(updatedBuilder);
      }

      await writeLocalDB(data);
      return updatedBuilder;
    }
  }
};
