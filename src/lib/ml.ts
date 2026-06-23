/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MLWeights, MLMetrics, StudyRecord, Flashcard } from "../types";

// Standard default weights that represent intuitive human forgetting behaviors:
// Latency has a positive effect on forgetting, low confidence has a massive positive effect on forgetting,
// and historical incorrect attempts have a positive effect.
export const DEFAULT_WEIGHTS: MLWeights = {
  bias: -1.2, // Default base probability of forgetting is low
  wLatency: 1.5, // Takes longer -> more likely to need a review
  wConfidence: 3.5, // Low confidence -> extremely highly likely to need review
  wIncorrect: 2.0, // Frequently incorrect -> likely to need review
};

/**
 * Sigmoid activation function
 */
export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
}

/**
 * Extracts and normalizes features from a flashcard for model prediction
 */
export function getFeatures(card: Flashcard): [number, number, number] {
  // x1: Latency normalized (capped at 10 seconds, scaled to 0..1)
  const normLatency = Math.min(10, card.averageLatency) / 10.0;
  
  // x2: Confidence normalized (5 is mastered, 1 is forgotten. Convert to index 0..1 where 1 is highest forget probability)
  const normConfidence = (5 - card.lastConfidence) / 4.0;
  
  // x3: Historical incorrect rate
  const incorrectRate = card.totalAttempts > 0 
    ? card.incorrectAttempts / card.totalAttempts 
    : 0.0;

  return [normLatency, normConfidence, incorrectRate];
}

/**
 * Predicts the probability that the user is about to forget this card (P(forget) = y=1)
 */
export function predictForgettingProbability(card: Flashcard, weights: MLWeights): number {
  const [x1, x2, x3] = getFeatures(card);
  const z = weights.bias + weights.wLatency * x1 + weights.wConfidence * x2 + weights.wIncorrect * x3;
  return sigmoid(z);
}

/**
 * Trains a Logistic Regression model on user study history via Gradient Descent with L2 Regularization.
 */
export function trainLogisticRegression(
  records: StudyRecord[],
  initialWeights: MLWeights,
  epochs: number = 150,
  learningRate: number = 0.1,
  lambda: number = 0.05 // Regularization parameter to prevent extreme weights or overfitting on small samples
): { weights: MLWeights; metrics: MLMetrics } {
  // If we have no records, return default weights and zero metrics
  if (records.length === 0) {
    return {
      weights: { ...initialWeights },
      metrics: {
        lossHistory: [],
        accuracy: 1.0,
        totalSamples: 0,
        truePositives: 0,
        falsePositives: 0,
        trueNegatives: 0,
        falseNegatives: 0,
      },
    };
  }

  // Extract features (X) and labels (Y)
  // X matrix of dimension N x 3
  const N = records.length;
  const X: number[][] = records.map((r) => [
    r.latencySeconds / 10.0, // capped normalized raw feature
    r.confidenceNormalized,
    r.incorrectRateBefore,
  ]);
  const Y: number[] = records.map((r) => r.label);

  // Initialize weights
  let bias = initialWeights.bias;
  let wLatency = initialWeights.wLatency;
  let wConfidence = initialWeights.wConfidence;
  let wIncorrect = initialWeights.wIncorrect;

  const lossHistory: number[] = [];

  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalLoss = 0;
    
    // Gradients
    let d_bias = 0;
    let d_wLatency = 0;
    let d_wConfidence = 0;
    let d_wIncorrect = 0;

    for (let i = 0; i < N; i++) {
      const [x1, x2, x3] = X[i];
      const y = Y[i];

      // Hypothesis
      const z = bias + wLatency * x1 + wConfidence * x2 + wIncorrect * x3;
      const h = sigmoid(z);

      // Error
      const error = h - y;

      d_bias += error;
      d_wLatency += error * x1;
      d_wConfidence += error * x2;
      d_wIncorrect += error * x3;

      // Binary Cross Entropy Loss
      const clipH = Math.max(1e-15, Math.min(1 - 1e-15, h));
      const sampleLoss = -(y * Math.log(clipH) + (1 - y) * Math.log(1 - clipH));
      totalLoss += sampleLoss;
    }

    // Average gradients and include L2 regularization (do not regularize bias)
    d_bias = d_bias / N;
    d_wLatency = (d_wLatency / N) + (lambda * wLatency);
    d_wConfidence = (d_wConfidence / N) + (lambda * wConfidence);
    d_wIncorrect = (d_wIncorrect / N) + (lambda * wIncorrect);

    // Update weights
    bias -= learningRate * d_bias;
    wLatency -= learningRate * d_wLatency;
    wConfidence -= learningRate * d_wConfidence;
    wIncorrect -= learningRate * d_wIncorrect;

    // Add penalty to loss
    const l2Penalty = (lambda / (2 * N)) * (wLatency * wLatency + wConfidence * wConfidence + wIncorrect * wIncorrect);
    const avgLoss = (totalLoss / N) + l2Penalty;
    lossHistory.push(avgLoss);
  }

  // Calculate metrics on the training set
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;
  let correctPredictions = 0;

  for (let i = 0; i < N; i++) {
    const [x1, x2, x3] = X[i];
    const y = Y[i];

    const z = bias + wLatency * x1 + wConfidence * x2 + wIncorrect * x3;
    const h = sigmoid(z);
    const predictedLabel = h >= 0.5 ? 1 : 0;

    if (predictedLabel === y) {
      correctPredictions++;
      if (y === 1) truePositives++;
      else trueNegatives++;
    } else {
      if (y === 1) falseNegatives++;
      else falsePositives++;
    }
  }

  const accuracy = N > 0 ? correctPredictions / N : 1.0;

  return {
    weights: { bias, wLatency, wConfidence, wIncorrect },
    metrics: {
      lossHistory,
      accuracy,
      totalSamples: N,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
    },
  };
}
