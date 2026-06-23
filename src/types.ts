/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarSeed: string; // for cute pixel avatar generation
  joinedAt: number;
  email?: string;
  facebookUsername?: string;
  instagramUsername?: string;
  isEmailConnected?: boolean;
  isFacebookConnected?: boolean;
  isInstagramConnected?: boolean;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: number;
  
  // Historical stats used for ML features
  totalAttempts: number;
  incorrectAttempts: number;
  lastConfidence: number; // 1 to 5
  averageLatency: number; // in seconds
  lastReviewedAt: number | null;
}

export interface StudyRecord {
  id: string;
  cardId: string;
  timestamp: number;
  latencySeconds: number; // features[0]
  confidenceNormalized: number; // features[1] (5 - confidence) / 4
  incorrectRateBefore: number; // features[2] (incorrectAttempts / totalAttempts before this review)
  label: number; // 1 if forgotten/needs review (confidence <= 2), 0 if recalled well (confidence >= 3)
}

export interface MLWeights {
  bias: number;
  wLatency: number;
  wConfidence: number;
  wIncorrect: number;
}

export interface MLMetrics {
  lossHistory: number[];
  accuracy: number;
  totalSamples: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
}
