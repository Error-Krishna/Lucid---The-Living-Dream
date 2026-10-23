import { Request, Response } from 'express';
import { FeedbackSubmission } from '@lucid/shared';
import { worldStore } from '../../storage/worldStore.js';

export const submitFeedback = (req: Request, res: Response) => {
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
  } = req.body;

  // Validate decisive question
  if (decision !== 'YES' && decision !== 'NO') {
    return res.status(400).json({
      error: 'The decisive question must be answered with either YES or NO',
    });
  }

  // Validate experience rating (either new 4-tier choice or 1-5 number)
  const validExperiences = ['Amazing', 'Good', 'Okay', 'Not for me'];
  const hasValidExperience =
    experienceRating && validExperiences.includes(experienceRating);
  const hasValidNumericRating =
    typeof rating === 'number' && rating >= 1 && rating <= 5;

  if (!hasValidExperience && !hasValidNumericRating) {
    return res.status(400).json({
      error: 'Please rate your experience (Amazing, Good, Okay, or Not for me)',
    });
  }

  // Validate primary interest
  if (!primaryInterest && !interest) {
    return res.status(400).json({
      error: 'Please select what interested you most',
    });
  }

  // Map experience rating to numeric equivalent for backward compatibility if needed
  const ratingMap: Record<string, number> = {
    Amazing: 5,
    Good: 4,
    Okay: 3,
    'Not for me': 1,
  };
  const resolvedRating =
    rating ?? (experienceRating ? ratingMap[experienceRating] || 4 : 4);

  const submission = worldStore.addFeedback({
    experienceRating,
    primaryInterest: primaryInterest || interest,
    rating: resolvedRating,
    interest: interest || primaryInterest,
    favoriteFeatures: Array.isArray(favoriteFeatures) ? favoriteFeatures : [primaryInterest || ''],
    improvements: typeof improvements === 'string' ? improvements.slice(0, 2000) : '',
    problems: typeof problems === 'string' ? problems.slice(0, 2000) : '',
    decision,
    additionalThoughts: typeof additionalThoughts === 'string' ? additionalThoughts.slice(0, 2000) : '',
    prototypeVersion: prototypeVersion || '1.1.0-space-mvp',
  });

  return res.status(201).json({
    success: true,
    message: 'Feedback securely received. Thank you for shaping LUCID.',
    submissionId: submission.id,
    submission,
  });
};

export const exportFeedback = (_req: Request, res: Response) => {
  const feedbackList = worldStore.getFeedback();
  return res.json({
    totalSubmissions: feedbackList.length,
    exportedAt: new Date().toISOString(),
    feedback: feedbackList,
  });
};
