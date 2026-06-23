/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Flashcard, MLWeights, MLMetrics, StudyRecord } from "../types";
import { BrainCircuit, Cpu, TrendingDown, Layers, BarChart3, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

interface DashboardProps {
  cards: Flashcard[];
  records: StudyRecord[];
  weights: MLWeights;
  metrics: MLMetrics;
  predictForgetProb: (card: Flashcard) => number;
  onResetWeights: () => void;
  onRetrainModel: () => void;
}

export default function Dashboard({
  cards,
  records,
  weights,
  metrics,
  predictForgetProb,
  onResetWeights,
  onRetrainModel,
}: DashboardProps) {
  // Compute prioritized active queue
  const scoredQueue = [...cards]
    .map((card) => ({
      ...card,
      forgetProbability: predictForgetProb(card),
    }))
    .sort((a, b) => b.forgetProbability - a.forgetProbability);

  // SVG Line Chart Coordinate Generator for Loss History
  const renderLossCurve = () => {
    if (!metrics.lossHistory || metrics.lossHistory.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-xs">
          No training metrics logged yet. Study cards to gather interaction history.
        </div>
      );
    }

    const data = metrics.lossHistory;
    const padding = 20;
    const width = 450;
    const height = 160;

    const minLoss = 0;
    const maxLoss = Math.max(...data, 1.0);

    // Create polyline path coordinates
    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      // Invert Y coordinate because SVG (0,0) is top-left
      const y = height - padding - ((val - minLoss) / (maxLoss - minLoss)) * (height - padding * 2);
      return `${x},${y}`;
    });

    const pathString = `M ${points.join(" L ")}`;

    // Gradient area path coordinates
    const lastX = padding + (data.length - 1) / (data.length - 1) * (width - padding * 2);
    const bottomY = height - padding;
    const areaPathString = `${pathString} L ${lastX},${bottomY} L ${padding},${bottomY} Z`;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Gradients */}
          <defs>
            <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Gradient Filled Area */}
          <path d={areaPathString} fill="url(#lossGradient)" />

          {/* Main Stroke Path */}
          <path d={pathString} stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Dots on Start/Finish */}
          {points.length > 0 && (
            <>
              <circle cx={padding} cy={height - padding - ((data[0] - minLoss) / (maxLoss - minLoss)) * (height - padding * 2)} r="4" fill="#ef4444" />
              <circle cx={lastX} cy={height - padding - ((data[data.length - 1] - minLoss) / (maxLoss - minLoss)) * (height - padding * 2)} r="4" fill="#2563eb" />
            </>
          )}
        </svg>

        {/* Legend */}
        <div className="flex justify-between items-center text-3xs font-mono text-gray-400 px-4 mt-1">
          <span>Epoch 0 (Loss: {data[0]?.toFixed(2)})</span>
          <span>Epoch {data.length} (Loss: {data[data.length - 1]?.toFixed(2)})</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ML Engine State Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-blue-300">
              Supervised Model
            </span>
            <Cpu className="h-5 w-5 text-blue-400 fill-blue-400/10" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold tracking-tight mb-0.5">
              Logistic Regression
            </h3>
            <p className="text-3xs text-slate-400 leading-normal">
              Self-correcting Gradient Descent engine trained in browser.
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-3xs font-mono">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-slate-300">State: <span className="text-blue-400 font-bold">Active & Loaded</span></span>
          </div>
        </div>

        {/* Training Data Metric */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">
              Interaction Log
            </span>
            <Layers className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-850 tracking-tight">
              {records.length}
            </h3>
            <p className="text-2xs text-slate-500 font-medium">
              Training data-points collected
            </p>
          </div>
          <p className="text-3xs text-slate-450 leading-relaxed font-light mt-2">
            Increments with each confidence & latency review you record.
          </p>
        </div>

        {/* Model Accuracy Output */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">
              Model Accuracy
            </span>
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-850 tracking-tight">
              {(metrics.accuracy * 100).toFixed(0)}%
            </h3>
            <p className="text-2xs text-slate-500 font-medium">
              Training Set Classification
            </p>
          </div>
          <p className="text-3xs text-slate-450 leading-relaxed font-light mt-2">
            Percentage of reviews correctly grouped by predicted forgotten status.
          </p>
        </div>

        {/* Core Deck Size indicator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">
              Active Deck Size
            </span>
            <BrainCircuit className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-850 tracking-tight">
              {cards.length}
            </h3>
            <p className="text-2xs text-slate-500 font-medium">
              Total Flashcards Saved
            </p>
          </div>
          <p className="text-3xs text-slate-500 leading-relaxed font-medium mt-2">
            <span className="text-red-600 font-extrabold">{scoredQueue.filter(q => q.forgetProbability >= 0.7).length}</span> classified in <span className="text-red-600 font-bold">"Critical"</span> need of review.
          </p>
        </div>
      </div>

      {/* Main Core Section: Model Optimization Curve vs Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COMPONENT: Weight parameters & Confusion Matrix */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <BrainCircuit className="h-4.5 w-4.5 text-blue-600" />
                Live Regression Weights (θ)
              </h3>
              <div className="flex gap-2 text-2xs uppercase tracking-wider font-bold">
                <button
                  onClick={onResetWeights}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={onRetrainModel}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                >
                  Re-Optimize (SGD)
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-normal font-light">
              Weights reflect how features impact forgetting. A highly <strong className="text-red-600 font-bold">positive</strong> weight indicates that high values of that feature spike card critical prioritization.
            </p>

            <div className="space-y-4">
              {/* Bias Weight */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1 font-mono">
                  <span>w_bias (Base Forgetting Propensity)</span>
                  <span className={weights.bias >= 0 ? "text-red-600 font-bold" : "text-blue-600 font-bold"}>
                    {weights.bias >= 0 ? "+" : ""}{weights.bias.toFixed(3)}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${weights.bias >= 0 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, Math.max(5, (Math.abs(weights.bias) / 5) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Latency Weight */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1 font-mono">
                  <span>w_latency (Recall Latency Index)</span>
                  <span className={weights.wLatency >= 0 ? "text-red-600 font-bold" : "text-blue-600 font-bold"}>
                    {weights.wLatency >= 0 ? "+" : ""}{weights.wLatency.toFixed(3)}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${weights.wLatency >= 0 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, Math.max(5, (Math.abs(weights.wLatency) / 5) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Confidence Weight */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1 font-mono">
                  <span>w_confidence (Self-Reported Weakness)</span>
                  <span className={weights.wConfidence >= 0 ? "text-red-600 font-bold" : "text-blue-600 font-bold"}>
                    {weights.wConfidence >= 0 ? "+" : ""}{weights.wConfidence.toFixed(3)}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${weights.wConfidence >= 0 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, Math.max(5, (Math.abs(weights.wConfidence) / 5) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Incorrect Rate Weight */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1 font-mono">
                  <span>w_incorrect (Historical Failure Frequency)</span>
                  <span className={weights.wIncorrect >= 0 ? "text-red-600 font-bold" : "text-blue-600 font-bold"}>
                    {weights.wIncorrect >= 0 ? "+" : ""}{weights.wIncorrect.toFixed(3)}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${weights.wIncorrect >= 0 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, Math.max(5, (Math.abs(weights.wIncorrect) / 5) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Confusion Matrix Diagnostic View */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-4">
              <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
              Confusion Matrix & Predictors
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* True Positive */}
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4">
                <span className="block text-3xs font-extrabold uppercase tracking-widest text-blue-600 mb-1">
                  True Positives (TP)
                </span>
                <div className="text-2xl font-extrabold text-slate-850">{metrics.truePositives}</div>
                <span className="text-3xs text-slate-500">Predicted Forgot, and User Actually Forgot</span>
              </div>

              {/* False Positive */}
              <div className="bg-red-50/30 border border-red-100 rounded-xl p-4">
                <span className="block text-3xs font-extrabold uppercase tracking-widest text-red-500 mb-1">
                  False Positives (FP)
                </span>
                <div className="text-2xl font-extrabold text-slate-850">{metrics.falsePositives}</div>
                <span className="text-3xs text-slate-500">Predicted Forgot, but User Recalled Well</span>
              </div>

              {/* False Negative */}
              <div className="bg-red-50/30 border border-red-100 rounded-xl p-4">
                <span className="block text-3xs font-extrabold uppercase tracking-widest text-red-500 mb-1">
                  False Negatives (FN)
                </span>
                <div className="text-2xl font-extrabold text-slate-850">{metrics.falseNegatives}</div>
                <span className="text-3xs text-slate-500">Predicted Mastered, but User Forgot</span>
              </div>

              {/* True Negative */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                  True Negatives (TN)
                </span>
                <div className="text-2xl font-extrabold text-slate-850">{metrics.trueNegatives}</div>
                <span className="text-3xs text-slate-500">Predicted Mastered, and User Recalled Well</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: Convergence Curve + ML Study Queue */}
        <div className="space-y-6">
          {/* Binary Cross-Entropy Loss Convergence Graph */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-1.5 mb-2">
              <TrendingDown className="h-4.5 w-4.5 text-blue-600" />
              BCE Logistic Loss Convergence
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-light">
              Binary Cross Entropy Loss curve showing gradient descent optimization convergence across epochs.
            </p>
            {renderLossCurve()}
          </div>

          {/* Model prioritized study queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
                <Cpu className="h-4.5 w-4.5 text-red-500" />
                Adaptive ML Study Priority
              </h3>
              <span className="text-3xs uppercase font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
                Sorted by P(forget) descending
              </span>
            </div>

            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {scoredQueue.map((item, index) => {
                const p = item.forgetProbability;
                let statusBadge = "bg-slate-100 text-slate-600 border-slate-200/60";
                if (p >= 0.7) statusBadge = "bg-red-50 text-red-700 border-red-100";
                else if (p >= 0.3) statusBadge = "bg-blue-50 text-blue-700 border-blue-100";

                return (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-slate-400 font-mono text-2xs">#{index + 1}</span>
                        <span className="text-slate-400 font-light text-3xs font-mono">[{item.category}]</span>
                      </div>
                      <p className="font-semibold text-slate-800 truncate" title={item.question}>
                        {item.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded text-3xs font-extrabold border uppercase tracking-wider ${statusBadge}`}>
                        {p >= 0.7 ? "Critical" : p >= 0.3 ? "Review" : "Mastered"}
                      </span>
                      <span className="text-3xs font-mono font-bold text-slate-600">
                        {(p * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}

              {scoredQueue.length === 0 && (
                <div className="text-center py-10 border border-dashed text-slate-400 text-xs rounded-xl">
                  Add flashcards to visualize prioritizing study cards.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
