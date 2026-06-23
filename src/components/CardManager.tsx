/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Flashcard } from "../types";
import { Plus, Edit3, Trash2, Sparkles, AlertCircle, Loader2, Check, Search, Filter } from "lucide-react";

interface CardManagerProps {
  cards: Flashcard[];
  onAddCard: (question: string, answer: string, category: string) => void;
  onEditCard: (id: string, question: string, answer: string, category: string) => void;
  onDeleteCard: (id: string) => void;
  onAddGeneratedCards: (newCards: Array<{ question: string; answer: string; category: string }>) => void;
}

export default function CardManager({
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onAddGeneratedCards,
}: CardManagerProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Form states
  const [isEditing, setIsEditing] = useState<string | null>(null); // holds card ID if editing
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");

  // AI Generator state
  const [aiTopic, setAiTopic] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedPreview, setGeneratedPreview] = useState<Array<{ question: string; answer: string; category: string }> | null>(null);

  // Derive unique categories for filter
  const categories = ["All", ...Array.from(new Set(cards.map((c) => c.category || "General")))];

  // Filtered Cards
  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          card.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    if (isEditing) {
      onEditCard(isEditing, question, answer, category.trim() || "General");
      setIsEditing(null);
    } else {
      onAddCard(question, answer, category.trim() || "General");
    }

    // Reset Form
    setQuestion("");
    setAnswer("");
    setCategory("");
  };

  const handleEditClick = (card: Flashcard) => {
    setIsEditing(card.id);
    setQuestion(card.question);
    setAnswer(card.answer);
    setCategory(card.category);
    // Scroll to form nicely
    document.getElementById("card-form-anchor")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setQuestion("");
    setAnswer("");
    setCategory("");
  };

  const handleGenerateAiCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsAiGenerating(true);
    setAiError(null);
    setGeneratedPreview(null);

    try {
      const response = await fetch("/api/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Generation endpoint returned an error");
      }

      if (data.cards && Array.isArray(data.cards)) {
        setGeneratedPreview(data.cards);
      } else {
        throw new Error("Invalid response format received from AI server");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong generating the cards.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleMergeAiCards = () => {
    if (generatedPreview && generatedPreview.length > 0) {
      onAddGeneratedCards(generatedPreview);
      setGeneratedPreview(null);
      setAiTopic("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: Manage & Edit Form + AI Generation */}
      <div className="lg:col-span-5 space-y-8">
        {/* Manual Addition/Editor Block */}
        <div id="card-form-anchor" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-blue-600" />
            {isEditing ? "Edit Flashcard" : "Create New Flashcard"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Front Side (Question)
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="Type the flashcard question here..."
                className="w-full text-sm border border-slate-300 rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Back Side (Detailed Explanation)
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                placeholder="Provide a thorough, comprehensive explanation or definition..."
                className="w-full text-sm border border-slate-300 rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Physics, React hooks, History (optional)"
                className="w-full text-sm border border-slate-300 rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition active:scale-95 cursor-pointer"
              >
                {isEditing ? "Save Changes" : "Add Flashcard"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-3 px-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* AI Assisted Creation tool */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-blue-400">
            <Sparkles className="h-5 w-5 text-blue-400 fill-blue-400/30 animate-pulse" />
            AI Flashcard Builder
          </h3>
          <p className="text-xs text-slate-300 mb-5 leading-relaxed">
            Generate 4 high-quality tailored flashcards on any topic in seconds using Gemini. Perfect for kickstarting a new study session.
          </p>

          <form onSubmit={handleGenerateAiCards} className="space-y-4">
            <div>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. Quantum Computing, Docker basics..."
                className="w-full text-sm border border-slate-700 bg-slate-800 text-white rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-blue-500/50 outline-none transition"
                required
                disabled={isAiGenerating}
              />
            </div>
            <button
              type="submit"
              disabled={isAiGenerating || !aiTopic.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-white" /> Generate 4 Flashcards
                </>
              )}
            </button>
          </form>

          {aiError && (
            <div className="mt-4 p-3.5 bg-red-950/40 border border-red-800/40 text-red-200 rounded-xl text-xs flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{aiError}</span>
            </div>
          )}

          {generatedPreview && (
            <div className="mt-6 border-t border-slate-800 pt-5 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Preview ({generatedPreview.length} Cards)
                </span>
                <span className="text-2xs bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-500/20">
                  Ready
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {generatedPreview.map((card, i) => (
                  <div key={i} className="bg-slate-800/60 border border-slate-750 rounded-xl p-3 text-xs leading-relaxed">
                    <div className="flex justify-between items-center mb-1 font-semibold text-blue-300">
                      <span>Card {i + 1}</span>
                      <span className="opacity-80 text-2xs uppercase font-mono">{card.category}</span>
                    </div>
                    <p className="font-semibold text-slate-100 mb-1">Q: {card.question}</p>
                    <p className="text-slate-300 font-light italic">A: {card.answer.length > 90 ? card.answer.slice(0, 90) + "..." : card.answer}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleMergeAiCards}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-lg"
              >
                <Check className="h-4 w-4" /> Import All Cards to Deck
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Deck List */}
      <div className="lg:col-span-7 space-y-6">
        {/* Search, Filter counts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search question or answer text..."
                className="w-full text-sm border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border border-slate-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 px-1">
            <span>Showing <span className="text-blue-600 font-bold">{filteredCards.length}</span> of <span className="font-semibold text-slate-700">{cards.length}</span> flashcards</span>
            {cards.length === 0 && <span className="text-red-500 font-extrabold">Your deck is currently empty!</span>}
          </div>
        </div>

        {/* Card grid/list */}
        <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-1">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white border border-slate-200 hover:border-blue-200 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <span className="inline-flex px-2 py-0.5 text-3xs font-extrabold tracking-wider uppercase rounded bg-blue-50 text-blue-700 border border-blue-100/60">
                    {card.category}
                  </span>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(card)}
                      className="p-1 px-2 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title="Edit Card"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="p-1 px-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Delete Card"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-extrabold text-slate-800 text-sm md:text-base mb-1 leading-snug">
                  {card.question}
                </h4>
                <p className="text-slate-500 text-xs md:text-sm line-clamp-3">
                  {card.answer}
                </p>
              </div>

              {/* Little dashboard indicator at the foot of each card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-3xs font-mono text-slate-400">
                <span>Confidence: <strong className="text-blue-600 font-bold">{card.lastConfidence}/5</strong></span>
                <span>Attempts: <strong className="text-slate-700 font-bold">{card.totalAttempts}</strong></span>
                <span>Avg. Latency: <strong className="text-slate-700 font-bold">{card.averageLatency.toFixed(1)}s</strong></span>
              </div>
            </div>
          ))}

          {filteredCards.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No cards matched your query.</p>
              <p className="text-xs text-slate-400 mt-1">Clear searching or filter options to display cards.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
