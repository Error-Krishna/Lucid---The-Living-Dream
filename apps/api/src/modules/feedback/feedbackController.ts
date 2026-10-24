import { Request, Response } from 'express';
import {
  FeedbackExperience,
  FeedbackPrimaryInterest,
  FeedbackDecision,
} from '@lucid/shared';
import { getFeedbackCollection, FeedbackDocument } from '../../storage/mongodb.js';

const VALID_EXPERIENCES: FeedbackExperience[] = ['Amazing', 'Good', 'Okay', 'Not for me'];

const VALID_INTERESTS: FeedbackPrimaryInterest[] = [
  'Exploring the planets',
  'The visuals and atmosphere',
  'Moving around and interacting with the world',
  'The idea of a shared, persistent universe',
  'I did not find it interesting yet',
];

const RATING_MAP: Record<FeedbackExperience, number> = {
  Amazing: 5,
  Good: 4,
  Okay: 3,
  'Not for me': 1,
};

export const submitFeedback = async (req: Request, res: Response) => {
  const {
    experienceRating,
    primaryInterest,
    decision,
    improvements,
    rating,
    interest,
    favoriteFeatures,
    problems,
    additionalThoughts,
    prototypeVersion,
  } = req.body || {};

  // 1. Validate decisive question (Required)
  if (
    !decision ||
    typeof decision !== 'string' ||
    !['YES', 'NO'].includes(decision.trim().toUpperCase())
  ) {
    return res.status(400).json({
      error: 'The decisive question must be answered with either YES or NO',
    });
  }
  const normalizedDecision = decision.trim().toUpperCase() as FeedbackDecision;

  // 2. Validate overall experience (Required: 4-tier choice or numeric 1-5)
  const hasValidExperienceString =
    typeof experienceRating === 'string' &&
    VALID_EXPERIENCES.includes(experienceRating as FeedbackExperience);
  const hasValidNumericRating =
    typeof rating === 'number' && !isNaN(rating) && rating >= 1 && rating <= 5;

  if (!hasValidExperienceString && !hasValidNumericRating) {
    return res.status(400).json({
      error: 'Please rate your experience (Amazing, Good, Okay, or Not for me)',
    });
  }

  const resolvedRating: number = hasValidNumericRating
    ? Math.round(rating)
    : hasValidExperienceString
      ? RATING_MAP[experienceRating as FeedbackExperience]
      : 4;

  const resolvedExperience: FeedbackExperience = hasValidExperienceString
    ? (experienceRating as FeedbackExperience)
    : resolvedRating >= 5
      ? 'Amazing'
      : resolvedRating >= 4
        ? 'Good'
        : resolvedRating >= 3
          ? 'Okay'
          : 'Not for me';

  // 3. Validate primary interest (Required: must match enumerated choices)
  const candidateInterest = primaryInterest || interest;
  const isValidInterestChoice =
    typeof candidateInterest === 'string' &&
    (VALID_INTERESTS.includes(candidateInterest as FeedbackPrimaryInterest) ||
      (typeof interest === 'string' && interest.trim().length > 0 && interest.length <= 200));

  if (!isValidInterestChoice) {
    return res.status(400).json({
      error: 'Please select what interested you most',
    });
  }

  // 4. Validate optional comment (improvements)
  if (improvements !== undefined && improvements !== null) {
    if (typeof improvements !== 'string') {
      return res.status(400).json({
        error: 'Improvements comment must be a string',
      });
    }
    if (improvements.length > 2000) {
      return res.status(400).json({
        error: 'Improvements comment cannot exceed 2000 characters',
      });
    }
  }

  // Validate optional secondary comments if present
  if (problems !== undefined && problems !== null && typeof problems !== 'string') {
    return res.status(400).json({ error: 'Problems comment must be a string' });
  }
  if (additionalThoughts !== undefined && additionalThoughts !== null && typeof additionalThoughts !== 'string') {
    return res.status(400).json({ error: 'Additional thoughts must be a string' });
  }

  // Generate trusted server-side UTC timestamp (never trust client timestamps)
  const createdAt = new Date().toISOString();

  const doc: Omit<FeedbackDocument, '_id'> = {
    experienceRating: resolvedExperience,
    primaryInterest: candidateInterest as FeedbackPrimaryInterest,
    decision: normalizedDecision,
    improvements: typeof improvements === 'string' ? improvements.trim() : '',
    rating: resolvedRating,
    interest: candidateInterest,
    favoriteFeatures:
      Array.isArray(favoriteFeatures) && favoriteFeatures.every((f) => typeof f === 'string')
        ? favoriteFeatures.slice(0, 10).map((f) => f.slice(0, 200))
        : [candidateInterest],
    problems: typeof problems === 'string' ? problems.trim().slice(0, 2000) : undefined,
    additionalThoughts: typeof additionalThoughts === 'string' ? additionalThoughts.trim().slice(0, 2000) : undefined,
    prototypeVersion: typeof prototypeVersion === 'string' ? prototypeVersion.trim().slice(0, 100) : '1.1.0-space-mvp',
    createdAt,
  };

  try {
    const collection = getFeedbackCollection();
    const result = await collection.insertOne(doc);
    const submissionId = result.insertedId.toString();

    return res.status(201).json({
      success: true,
      message: 'Feedback securely received. Thank you for shaping LUCID.',
      submissionId,
      submission: {
        id: submissionId,
        ...doc,
        submittedAt: createdAt,
      },
    });
  } catch (err: any) {
    console.error('Failed to persist feedback to MongoDB:', err?.message || err);
    return res.status(503).json({
      error: 'Feedback storage service is currently unavailable. Please try again later.',
    });
  }
};

export const exportFeedback = async (_req: Request, res: Response) => {
  try {
    const collection = getFeedbackCollection();
    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
    const feedback = docs.map((doc) => ({
      id: doc._id.toString(),
      experienceRating: doc.experienceRating,
      primaryInterest: doc.primaryInterest,
      decision: doc.decision,
      improvements: doc.improvements,
      rating: doc.rating,
      interest: doc.interest,
      favoriteFeatures: doc.favoriteFeatures,
      problems: doc.problems,
      additionalThoughts: doc.additionalThoughts,
      prototypeVersion: doc.prototypeVersion,
      submittedAt: doc.createdAt,
    }));

    return res.json({
      totalSubmissions: feedback.length,
      exportedAt: new Date().toISOString(),
      feedback,
    });
  } catch (err: any) {
    console.error('Failed to export feedback from MongoDB:', err?.message || err);
    return res.status(503).json({
      error: 'Unable to export feedback at this time. Database unavailable.',
    });
  }
};
