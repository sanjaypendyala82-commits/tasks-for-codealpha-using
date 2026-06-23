/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Flashcard, StudyRecord } from "../types";
import { BrainCircuit, Clock, HelpCircle, ArrowRight, ArrowLeft, RefreshCw, Sparkles } from "lucide-react";

interface FlashcardViewerProps {
  cards: Flashcard[];
  onReviewCard: (cardId: string, confidence: number, latencySeconds: number) => void;
  predictForgetProb: (card: Flashcard) => number;
}

export default function FlashcardViewer({
  cards,
  onReviewCard,
  predictForgetProb,
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [latency, setLatency] = useState<number | null>(null);

  // Ensure index is within bounds
  const activeIndex = cards.length > 0 ? Math.min(currentIndex, cards.length - 1) : -1;
  const activeCard = activeIndex !== -1 ? cards[activeIndex] : null;

  // Start timer when card changes or resets
  useEffect(() => {
    setStartTime(Date.now());
    setIsFlipped(false);
    setLatency(null);
  }, [activeIndex, activeCard?.id]);

  // Handle empty states after hooks
  if (cards.length === 0 || !activeCard) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 border border-gray-200/60 rounded-2xl min-h-[350px]">
        <BrainCircuit className="h-16 w-16 text-gray-400 mb-4 animate-pulse" />
        <h3 className="text-xl font-medium text-gray-800 mb-2">No Cards Available to Study</h3>
        <p className="text-gray-500 max-w-sm mb-6 text-sm">
          Please add some flashcards in the "Manage" tab or load default flashcards to begin learning.
        </p>
      </div>
    );
  }

  const handleShowAnswer = () => {
    if (!isFlipped) {
      const elapsed = (Date.now() - startTime) / 1000.0;
      setLatency(elapsed);
      setIsFlipped(true);
    }
  };

  const handleRate = (rating: number) => {
    if (latency !== null) {
      onReviewCard(activeCard.id, rating, latency);
      
      // Auto move to next card or loop
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Wrap around
        setCurrentIndex(0);
      }
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1);
    } else {
      setCurrentIndex(cards.length - 1);
    }
  };

  // Predict forgetting score for the active card
  const forgetProbability = activeCard ? predictForgetProb(activeCard) : 0;
  
  // Custom difficulty/status badges based on P(forget)
  let statusText = "Mastered";
  let statusColor = "bg-slate-150 text-slate-700 border-slate-300 font-bold";
  if (forgetProbability >= 0.7) {
    statusText = "Critical Needs Review";
    statusColor = "bg-red-50 text-red-700 border-red-200 animate-pulse font-extrabold";
  } else if (forgetProbability >= 0.3) {
    statusText = "Review Recommended";
    statusColor = "bg-blue-50 text-blue-700 border-blue-200 font-extrabold";
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Top Header Card Info */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-sm font-semibold text-slate-500">
          Card {activeIndex + 1} of {cards.length}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
          {activeCard.category || "General"}
        </span>
      </div>

      {/* Main Flashcard Display Container */}
      <div className="relative min-h-[300px] w-full perspective-1000">
        <div
          id="flashcard-element"
          onClick={!isFlipped ? handleShowAnswer : undefined}
          className={`relative w-full rounded-2xl border-2 transition-all duration-500 ease-out p-8 md:p-10 cursor-pointer shadow-md min-h-[300px] flex flex-col justify-between ${
            isFlipped
              ? "bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white shadow-xl shadow-slate-950/20"
              : "bg-white border-slate-200 text-slate-900 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5"
          }`}
        >
          {/* Header row in the card */}
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              {isFlipped ? "Answer Side" : "Question Side"}
            </span>

            {/* Model Prioritization Badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-3xs font-black border uppercase tracking-wider ${statusColor}`}>
                {statusText}
              </span>
              <span className="text-xs font-mono text-slate-400" title="Model's predicted probability of forgetting this card">
                P(forget): <strong className={forgetProbability >= 0.7 ? "text-red-500 font-extrabold" : forgetProbability >= 0.3 ? "text-blue-500 font-extrabold" : "text-slate-500 font-bold"}>{(forgetProbability * 100).toFixed(0)}%</strong>
              </span>
            </div>
          </div>

          {/* Central Question or Answer Area */}
          <div className="flex-grow flex flex-col justify-center items-center my-6">
            {!isFlipped ? (
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight leading-relaxed max-w-lg mb-4 text-slate-800">
                  {activeCard.question}
                </h2>
                <span className="inline-flex items-center text-xs text-blue-600 gap-1.5 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100/80 transition">
                  <RefreshCw className="h-3 w-3 animate-spin duration-3000 text-blue-500" /> Click to reveal answer
                </span>
              </div>
            ) : (
              <div className="text-center w-full">
                <p className="text-lg md:text-xl leading-relaxed max-w-lg mx-auto text-slate-100 font-semibold whitespace-pre-wrap">
                  {activeCard.answer}
                </p>
              </div>
            )}
          </div>

          {/* Card stats / footer */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Total Attempts: <span className="font-bold text-slate-600">{activeCard.totalAttempts}</span>
            </span>
            {activeCard.lastReviewedAt && (
              <span className="font-mono">Last: {new Date(activeCard.lastReviewedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Show Answer / Confidence Ratings Controls */}
      <div className="mt-8">
        {!isFlipped ? (
          <button
            id="btn-show-answer"
            onClick={handleShowAnswer}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/10 transition-all active:scale-[0.98] uppercase tracking-wider text-sm"
          >
            Show Answer <HelpCircle className="h-5 w-5 text-blue-100" />
          </button>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 animate-fade-in">
            <div className="flex items-center gap-1.5 mb-4">
              <BrainCircuit className="h-4 w-4 text-blue-600 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Rate Your Recall Confidence
              </h4>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Self-reporting is the core feature that refines the Logistic Regression model, updating future review frequencies.
            </p>

            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {[
                { r: 1, label: "Forgot", color: "hover:bg-red-600 hover:text-white border-red-300 text-red-700 bg-red-50/40" },
                { r: 2, label: "Hesitant", color: "hover:bg-red-500 hover:text-white border-red-200 text-red-600 bg-red-50/10" },
                { r: 3, label: "Recalled", color: "hover:bg-slate-600 hover:text-white border-slate-300 text-slate-700 bg-slate-100/50" },
                { r: 4, label: "Easy", color: "hover:bg-blue-500 hover:text-white border-blue-200 text-blue-600 bg-blue-50/20" },
                { r: 5, label: "Mastered", color: "hover:bg-blue-600 hover:text-white border-blue-300 text-blue-700 bg-blue-50/60" },
              ].map((item) => (
                <button
                  key={item.r}
                  id={`btn-rate-${item.r}`}
                  onClick={() => handleRate(item.r)}
                  className={`flex flex-col items-center justify-center py-3.5 px-1 rounded-xl border text-center transition font-bold text-xs active:scale-95 cursor-pointer ${item.color}`}
                >
                  <span className="text-sm md:text-base font-black">{item.r}</span>
                  <span className="text-3xs font-bold uppercase tracking-tight mt-0.5 block opacity-90">{item.label}</span>
                </button>
              ))}
            </div>

            {latency !== null && (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-2xs font-mono text-slate-500">
                <Clock className="h-3 w-3 text-blue-500" />
                Response Latency: <span className="font-bold text-slate-700">{latency.toFixed(2)}s</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons Row */}
      <div className="flex items-center justify-between mt-6 gap-4">
        <button
          id="btn-prev-card"
          onClick={prevCard}
          className="flex-1 inline-flex items-center justify-center gap-1 text-sm text-slate-600 hover:text-blue-600 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl transition font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Previous Card
        </button>
        <button
          id="btn-next-card"
          onClick={nextCard}
          className="flex-1 inline-flex items-center justify-center gap-1 text-sm text-slate-600 hover:text-blue-600 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl transition font-semibold"
        >
          Skip Card <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
