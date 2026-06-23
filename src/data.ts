/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flashcard } from "./types";

export const INITIAL_CARDS: Flashcard[] = [
  {
    id: "react-1",
    question: "What is React's Virtual DOM reconciliation algorithm called?",
    answer: "React Fiber. It is a complete rewrite of the React core algorithm that enables incremental rendering—the ability to split rendering work into chunks and spread it over multiple frames to avoid blocking the main thread.",
    category: "React Development",
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    totalAttempts: 4,
    incorrectAttempts: 1,
    lastConfidence: 4,
    averageLatency: 4.2,
    lastReviewedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: "react-2",
    question: "When and why should you return a function from a 'useEffect' hook?",
    answer: "You return a function to perform 'cleanup' (e.g., unsubscribing from sockets, clearing intervals, or canceling API requests). This runs when the component unmounts and before running the effect again, preventing memory leaks and stale state bugs.",
    category: "React Development",
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    totalAttempts: 5,
    incorrectAttempts: 3,
    lastConfidence: 2,
    averageLatency: 8.5,
    lastReviewedAt: Date.now() - 12 * 60 * 60 * 1000,
  },
  {
    id: "ml-1",
    question: "Explain the difference between L1 (Lasso) and L2 (Ridge) regularization.",
    answer: "L1 regularization adds the absolute values of the weights (|w|) to the loss, promoting sparsity (zeroing out weights, performing feature selection). L2 regularization adds the squared weights (w²) to the loss, which penalizes large weights and spreads weights smoothly, keeping them small but non-zero.",
    category: "Machine Learning",
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    totalAttempts: 3,
    incorrectAttempts: 2,
    lastConfidence: 3,
    averageLatency: 9.1,
    lastReviewedAt: Date.now() - 6 * 12 * 60 * 60 * 1000,
  },
  {
    id: "ml-2",
    question: "What is Overfitting in Machine Learning, and how do you reduce it?",
    answer: "Overfitting occurs when a model learns the training data's noise and details too well, failing to generalize to unseen data. It is reduced by adding regularization, training on more/diverse data, using dropout (in neural nets), or simplifying the model architecture.",
    category: "Machine Learning",
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    totalAttempts: 6,
    incorrectAttempts: 0,
    lastConfidence: 5,
    averageLatency: 2.1,
    lastReviewedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "swe-1",
    question: "What does the 'S' in SOLID principles represent, and why is it useful?",
    answer: "Single Responsibility Principle (SRP). It states that a class or module should have exactly one reason to change, meaning it should perform only one cohesive job. It reduces coupling, makes code easier to test, and enhances refactorability.",
    category: "Software Design",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    totalAttempts: 2,
    incorrectAttempts: 1,
    lastConfidence: 3,
    averageLatency: 5.5,
    lastReviewedAt: Date.now() - 18 * 60 * 60 * 1000,
  },
  {
    id: "ml-3",
    question: "What is the Sigmoid activation function formula, and what is its range?",
    answer: "The formula is σ(z) = 1 / (1 + e^-z). Its range is strictly between 0 and 1, mapping any real-valued number into a value representing probabilities, making it the bedrock of logistic regression and binary classification.",
    category: "Machine Learning",
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    totalAttempts: 0,
    incorrectAttempts: 0,
    lastConfidence: 3,
    averageLatency: 5.0,
    lastReviewedAt: null,
  }
];
