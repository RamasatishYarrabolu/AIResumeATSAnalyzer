import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileName: { type: String, default: 'Resume' },
  resumeText: { type: String, required: true },
  jobDescription: { type: String, required: true },
  score: { type: Number, required: true },
  matchedKeywords: [String],
  missingKeywords: [String],
  suggestions: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

export default mongoose.model('Resume', resumeSchema);
