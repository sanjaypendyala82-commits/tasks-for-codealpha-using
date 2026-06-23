/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Flashcard, StudyRecord, MLWeights, MLMetrics, User } from "./types";
import { DEFAULT_WEIGHTS, trainLogisticRegression, predictForgettingProbability } from "./lib/ml";
import { INITIAL_CARDS } from "./data";
import FlashcardViewer from "./components/FlashcardViewer";
import CardManager from "./components/CardManager";
import Dashboard from "./components/Dashboard";
import LoginGate from "./components/LoginGate";
import { BrainCircuit, BookOpen, Layers, Cpu, Sparkles, RefreshCw, LogOut, User as UserIcon, Mail, Facebook, Instagram } from "lucide-react";

// Initial standard profiles to seed the database so they can quick-select
const PRESET_USERS: User[] = [
  {
    id: "user-sanjay",
    username: "sanjay",
    displayName: "Sanjay Pendyala",
    avatarSeed: "🧠",
    joinedAt: 1782043200000,
    email: "sanjay@gmail.com",
    facebookUsername: "sanjay.pendyala",
    instagramUsername: "@sanjay_pendyala",
    isEmailConnected: true,
    isFacebookConnected: true,
    isInstagramConnected: true
  },
  {
    id: "user-mldev",
    username: "ml_dev",
    displayName: "Cognitive Researcher",
    avatarSeed: "💻",
    joinedAt: 1782043200000,
  }
];

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [weights, setWeights] = useState<MLWeights>(DEFAULT_WEIGHTS);
  const [metrics, setMetrics] = useState<MLMetrics>({
    lossHistory: [],
    accuracy: 1.0,
    totalSamples: 0,
    truePositives: 0,
    falsePositives: 0,
    trueNegatives: 0,
    falseNegatives: 0,
  });

  const [currentTab, setCurrentTab] = useState<"study" | "manage" | "analytics">("study");
  const [isLoaded, setIsLoaded] = useState(false);

  // States for inline social/email connection drawers
  const [editingIntegration, setEditingIntegration] = useState<"email" | "facebook" | "instagram" | null>(null);
  const [integrationInput, setIntegrationInput] = useState("");

  // 1. Initial Load of Users List and Auto-Login
  useEffect(() => {
    try {
      const savedUsersList = localStorage.getItem("flashcards_app_users_v2");
      let allUsers: User[] = [];
      if (savedUsersList) {
        allUsers = JSON.parse(savedUsersList);
      } else {
        // Seed standard users
        allUsers = PRESET_USERS;
        localStorage.setItem("flashcards_app_users_v2", JSON.stringify(allUsers));
      }
      setUsers(allUsers);

      const savedActiveUserId = localStorage.getItem("flashcards_active_user_id");
      if (savedActiveUserId) {
        const found = allUsers.find((u) => u.id === savedActiveUserId);
        if (found) {
          setCurrentUser(found);
        }
      }
    } catch (e) {
      console.error("Failed to parse local metadata", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Dynamic state loader triggered when active user switches
  useEffect(() => {
    if (!isLoaded) return;

    if (!currentUser) {
      setCards([]);
      setRecords([]);
      setWeights(DEFAULT_WEIGHTS);
      setMetrics({
        lossHistory: [],
        accuracy: 1.0,
        totalSamples: 0,
        truePositives: 0,
        falsePositives: 0,
        trueNegatives: 0,
        falseNegatives: 0,
      });
      return;
    }

    try {
      // Load user specific isolated keys
      const cardKey = `user_cards_${currentUser.id}`;
      const recordKey = `user_records_${currentUser.id}`;
      const weightKey = `user_weights_${currentUser.id}`;

      const savedCards = localStorage.getItem(cardKey);
      const savedRecords = localStorage.getItem(recordKey);
      const savedWeights = localStorage.getItem(weightKey);

      const loadedCards: Flashcard[] = savedCards ? JSON.parse(savedCards) : INITIAL_CARDS;
      const loadedRecords: StudyRecord[] = savedRecords ? JSON.parse(savedRecords) : [];
      const loadedWeights: MLWeights = savedWeights ? JSON.parse(savedWeights) : DEFAULT_WEIGHTS;

      setCards(loadedCards);
      setRecords(loadedRecords);

      if (loadedRecords.length > 0) {
        const result = trainLogisticRegression(loadedRecords, loadedWeights);
        setWeights(result.weights);
        setMetrics(result.metrics);
      } else {
        setWeights(loadedWeights);
        setMetrics({
          lossHistory: [],
          accuracy: 1.0,
          totalSamples: 0,
          truePositives: 0,
          falsePositives: 0,
          trueNegatives: 0,
          falseNegatives: 0,
        });
      }
    } catch (err) {
      console.error("Error loading user state data:", err);
      setCards(INITIAL_CARDS);
      setWeights(DEFAULT_WEIGHTS);
    }
  }, [currentUser, isLoaded]);

  // Auth Operations
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("flashcards_active_user_id", user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("flashcards_active_user_id");
  };

  const handleCreateUser = (
    username: string,
    displayName: string,
    avatarSeed: string,
    email?: string,
    facebookUsername?: string,
    instagramUsername?: string,
    isEmailConnected?: boolean,
    isFacebookConnected?: boolean,
    isInstagramConnected?: boolean
  ): User | null => {
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      username: username.toLowerCase().trim(),
      displayName: displayName.trim(),
      avatarSeed,
      joinedAt: Date.now(),
      email,
      facebookUsername,
      instagramUsername,
      isEmailConnected,
      isFacebookConnected,
      isInstagramConnected,
    };

    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem("flashcards_app_users_v2", JSON.stringify(updated));
    return newUser;
  };

  const handleUpdateUserIntegrations = (
    emailVal?: string,
    facebookVal?: string,
    instagramVal?: string,
    emailConn?: boolean,
    facebookConn?: boolean,
    instagramConn?: boolean
  ) => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      email: emailVal,
      facebookUsername: facebookVal,
      instagramUsername: instagramVal,
      isEmailConnected: emailConn,
      isFacebookConnected: facebookConn,
      isInstagramConnected: instagramConn,
    };

    setCurrentUser(updatedUser);

    const updatedUsersList = users.map((u) => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsersList);
    localStorage.setItem("flashcards_app_users_v2", JSON.stringify(updatedUsersList));
  };

  // Scored state actions scoped to current user
  const handleReviewCard = (cardId: string, confidence: number, latencySeconds: number) => {
    if (!currentUser) return;

    const updatedCards = cards.map((card) => {
      if (card.id === cardId) {
        const totalAttempts = card.totalAttempts + 1;
        const incorrectAttempts = card.incorrectAttempts + (confidence <= 2 ? 1 : 0);
        const averageLatency = (card.averageLatency * card.totalAttempts + latencySeconds) / totalAttempts;

        return {
          ...card,
          totalAttempts,
          incorrectAttempts,
          lastConfidence: confidence,
          averageLatency,
          lastReviewedAt: Date.now(),
        };
      }
      return card;
    });

    const cardPriorReview = cards.find((c) => c.id === cardId)!;
    const incorrectRateBefore = cardPriorReview.totalAttempts > 0 
      ? cardPriorReview.incorrectAttempts / cardPriorReview.totalAttempts 
      : 0.0;
    
    const ratingLabel = confidence <= 2 ? 1 : 0;

    const newRecord: StudyRecord = {
      id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cardId,
      timestamp: Date.now(),
      latencySeconds,
      confidenceNormalized: (5 - confidence) / 4.0,
      incorrectRateBefore,
      label: ratingLabel,
    };

    const updatedRecords = [...records, newRecord];

    const { weights: trainedWeights, metrics: trainedMetrics } = trainLogisticRegression(
      updatedRecords,
      weights
    );

    setCards(updatedCards);
    setRecords(updatedRecords);
    setWeights(trainedWeights);
    setMetrics(trainedMetrics);

    localStorage.setItem(`user_cards_${currentUser.id}`, JSON.stringify(updatedCards));
    localStorage.setItem(`user_records_${currentUser.id}`, JSON.stringify(updatedRecords));
    localStorage.setItem(`user_weights_${currentUser.id}`, JSON.stringify(trainedWeights));
  };

  const handleAddCard = (question: string, answer: string, category: string) => {
    if (!currentUser) return;

    const newCard: Flashcard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      question,
      answer,
      category,
      createdAt: Date.now(),
      totalAttempts: 0,
      incorrectAttempts: 0,
      lastConfidence: 3,
      averageLatency: 5.0,
      lastReviewedAt: null,
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    localStorage.setItem(`user_cards_${currentUser.id}`, JSON.stringify(updatedCards));
  };

  const handleEditCard = (id: string, question: string, answer: string, category: string) => {
    if (!currentUser) return;

    const updatedCards = cards.map((card) => {
      if (card.id === id) {
        return {
          ...card,
          question,
          answer,
          category,
        };
      }
      return card;
    });

    setCards(updatedCards);
    localStorage.setItem(`user_cards_${currentUser.id}`, JSON.stringify(updatedCards));
  };

  const handleDeleteCard = (id: string) => {
    if (!currentUser) return;

    const updatedCards = cards.filter((card) => card.id !== id);
    setCards(updatedCards);
    localStorage.setItem(`user_cards_${currentUser.id}`, JSON.stringify(updatedCards));
  };

  const handleAddGeneratedCards = (newCards: Array<{ question: string; answer: string; category: string }>) => {
    if (!currentUser) return;

    const freshCards: Flashcard[] = newCards.map((nc, index) => ({
      id: `card-ai-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
      question: nc.question,
      answer: nc.answer,
      category: nc.category || "AI Generated",
      createdAt: Date.now(),
      totalAttempts: 0,
      incorrectAttempts: 0,
      lastConfidence: 3,
      averageLatency: 5.0,
      lastReviewedAt: null,
    }));

    const updatedCards = [...cards, ...freshCards];
    setCards(updatedCards);
    localStorage.setItem(`user_cards_${currentUser.id}`, JSON.stringify(updatedCards));
  };

  const handleResetWeights = () => {
    if (!currentUser) return;

    setWeights(DEFAULT_WEIGHTS);
    localStorage.setItem(`user_weights_${currentUser.id}`, JSON.stringify(DEFAULT_WEIGHTS));

    if (records.length > 0) {
      const result = trainLogisticRegression(records, DEFAULT_WEIGHTS);
      setMetrics(result.metrics);
    }
  };

  const handleRetrainModel = () => {
    if (!currentUser) return;

    if (records.length > 0) {
      const result = trainLogisticRegression(records, weights, 200, 0.15, 0.02);
      setWeights(result.weights);
      setMetrics(result.metrics);
      localStorage.setItem(`user_weights_${currentUser.id}`, JSON.stringify(result.weights));
    }
  };

  const handleRestoreDefaultDeck = () => {
    if (!currentUser) return;

    if (window.confirm("Are you sure you want to restore the default educational flashcard deck? This will preserve your current stats data but reset card questions.")) {
      setCards(INITIAL_CARDS);
      localStorage.setItem(`user_cards_${currentUser.id}`, JSON.stringify(INITIAL_CARDS));
    }
  };

  const getCardForgettingProb = (card: Flashcard) => {
    return predictForgettingProbability(card, weights);
  };

  const getPrioritySortedCards = () => {
    return [...cards].sort((a, b) => b.totalAttempts === 0 ? 1 : a.totalAttempts === 0 ? -1 : getCardForgettingProb(b) - getCardForgettingProb(a));
  };

  // Loading indicator stage
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
        <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mb-3" />
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Loading ML Cognitive Workspace...
        </span>
      </div>
    );
  }

  // Not Authenticated Stage
  if (!currentUser) {
    return (
      <LoginGate
        onLoginSuccess={handleLoginSuccess}
        allUsers={users}
        onCreateUser={handleCreateUser}
      />
    );
  }

  // Authenticated Workspace State
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 transition-colors duration-300">
      {/* Header Bar */}
      <header id="main-app-header" className="sticky top-0 z-50 bg-white border-b border-slate-200 backdrop-blur bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-sm flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                  CogniMemory
                </h1>
                <span className="text-3xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                  PREDICTIVE PACING LAB
                </span>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <nav id="navbar-tablist" className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                id="tab-study-selector"
                onClick={() => setCurrentTab("study")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                  currentTab === "study"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" /> Study Deck
              </button>

              <button
                id="tab-manage-selector"
                onClick={() => setCurrentTab("manage")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                  currentTab === "manage"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> Manage Deck
              </button>

              <button
                id="tab-analytics-selector"
                onClick={() => setCurrentTab("analytics")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                  currentTab === "analytics"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                <Cpu className="h-3.5 w-3.5" /> ML Cognitive Lab
              </button>
            </nav>

            {/* User credentials + sign-out indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl max-w-[170px] sm:max-w-none">
                <span className="text-base leading-none select-none">{currentUser.avatarSeed}</span>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-3">{currentUser.displayName}</span>
                  <span className="text-3xs text-slate-400 font-mono mt-0.5">@{currentUser.username}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 py-2.5 bg-white hover:bg-red-550 hover:text-white border border-slate-200 hover:border-red-600 hover:bg-red-600 text-slate-500 rounded-xl transition flex items-center justify-center group cursor-pointer"
                title="Secure Lock & Exit Workspace"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden leading-none font-bold text-2xs uppercase tracking-wider sm:inline-block ml-1.5">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE TAB NAV */}
      <div className="md:hidden flex justify-center bg-white border-b border-slate-200 py-2 px-4 shadow-sm">
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full">
          <button
            onClick={() => setCurrentTab("study")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-2xs font-bold rounded-lg cursor-pointer ${
              currentTab === "study" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
            }`}
          >
            Study
          </button>
          <button
            onClick={() => setCurrentTab("manage")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-2xs font-bold rounded-lg cursor-pointer ${
              currentTab === "manage" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
            }`}
          >
            Manage
          </button>
          <button
            onClick={() => setCurrentTab("analytics")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-2xs font-bold rounded-lg cursor-pointer ${
              currentTab === "analytics" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
            }`}
          >
            ML Lab
          </button>
        </nav>
      </div>

      {/* Main Container Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* ML Engine Status Banner Card */}
        <section id="cognitive-concept-banner" className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1 md:max-w-xl">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-blue-600 fill-blue-600/10" />
                Hello, {currentUser.displayName}!
              </h2>
              <p className="text-2xs text-slate-500 leading-relaxed font-semibold">
                Your study history and weights parameters are isolated configuration profiles. Practice flashcards to feedback recall response times, train the regression model, and prioritize forgetting.
              </p>
            </div>

            <div className="flex gap-2 text-2xs uppercase tracking-wider font-bold shrink-0">
              <button
                onClick={handleRestoreDefaultDeck}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl transition cursor-pointer"
                title="Loads standard diagnostic educational cards to study"
              >
                Restore Defaults
              </button>
            </div>
          </div>

          {/* Social and Email Connections Hub */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Connected Workspace Access Channels
              </h3>
              <span className="text-3xs font-mono uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-bold">
                OAuth Sync: Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* EMAIL CHANNEL CARD */}
              <div className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl p-4 transition duration-150 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-2xs font-extrabold text-slate-700 uppercase tracking-widest leading-3">Email Address</h4>
                        <p className="text-3xs text-slate-400 font-mono mt-0.5">Primary Link</p>
                      </div>
                    </div>
                    <span className={`text-3xs px-2 py-0.5 font-bold uppercase rounded ${
                      currentUser.isEmailConnected
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-slate-200 text-slate-600 border border-slate-300/45"
                    }`}>
                      {currentUser.isEmailConnected ? "Linked" : "Not Linked"}
                    </span>
                  </div>

                  <div className="mt-4 text-xs">
                    {currentUser.email ? (
                      <span className="font-mono text-slate-800 font-bold block truncate">{currentUser.email}</span>
                    ) : (
                      <span className="text-slate-400 italic text-2xs block">No registered email address</span>
                    )}
                  </div>
                </div>

                {editingIntegration === "email" ? (
                  <div className="mt-3 p-2 bg-white rounded-lg border border-slate-250 animate-fade-in space-y-2">
                    <input
                      type="email"
                      value={integrationInput}
                      onChange={(e) => setIntegrationInput(e.target.value)}
                      placeholder="sanjay@gmail.com"
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5 text-3xs uppercase tracking-wide font-bold">
                      <button
                        onClick={() => setEditingIntegration(null)}
                        className="px-2 py-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (integrationInput.trim().includes("@")) {
                            handleUpdateUserIntegrations(
                              integrationInput.trim(),
                              currentUser.facebookUsername,
                              currentUser.instagramUsername,
                              true,
                              currentUser.isFacebookConnected,
                              currentUser.isInstagramConnected
                            );
                            setEditingIntegration(null);
                          }
                        }}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between text-3xs font-extrabold uppercase pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingIntegration("email");
                        setIntegrationInput(currentUser.email || "");
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {currentUser.email ? "Edit Address" : "+ Add Link"}
                    </button>
                    {currentUser.email && (
                      <button
                        onClick={() => {
                          handleUpdateUserIntegrations(
                            undefined,
                            currentUser.facebookUsername,
                            currentUser.instagramUsername,
                            false,
                            currentUser.isFacebookConnected,
                            currentUser.isInstagramConnected
                          );
                        }}
                        className="text-red-600 hover:text-red-800 hover:underline cursor-pointer font-bold"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* FACEBOOK CHANNEL CARD */}
              <div className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl p-4 transition duration-150 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Facebook className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-2xs font-extrabold text-slate-700 uppercase tracking-widest leading-3">Facebook Profile</h4>
                        <p className="text-3xs text-slate-400 font-mono mt-0.5">Social Backup</p>
                      </div>
                    </div>
                    <span className={`text-3xs px-2 py-0.5 font-bold uppercase rounded ${
                      currentUser.isFacebookConnected
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-slate-200 text-slate-600 border border-slate-300/45"
                    }`}>
                      {currentUser.isFacebookConnected ? "Linked" : "Not Linked"}
                    </span>
                  </div>

                  <div className="mt-4 text-xs">
                    {currentUser.facebookUsername ? (
                      <span className="font-mono text-slate-800 font-bold block truncate">{currentUser.facebookUsername}</span>
                    ) : (
                      <span className="text-slate-400 italic text-2xs block">No Facebook account synced</span>
                    )}
                  </div>
                </div>

                {editingIntegration === "facebook" ? (
                  <div className="mt-3 p-2 bg-white rounded-lg border border-slate-250 animate-fade-in space-y-2">
                    <input
                      type="text"
                      value={integrationInput}
                      onChange={(e) => setIntegrationInput(e.target.value)}
                      placeholder="facebook.com/username"
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5 text-3xs uppercase tracking-wide font-bold">
                      <button
                        onClick={() => setEditingIntegration(null)}
                        className="px-2 py-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (integrationInput.trim().length > 1) {
                            handleUpdateUserIntegrations(
                              currentUser.email,
                              integrationInput.trim(),
                              currentUser.instagramUsername,
                              currentUser.isEmailConnected,
                              true,
                              currentUser.isInstagramConnected
                            );
                            setEditingIntegration(null);
                          }
                        }}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between text-3xs font-extrabold uppercase pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingIntegration("facebook");
                        setIntegrationInput(currentUser.facebookUsername || "");
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {currentUser.facebookUsername ? "Edit Link" : "+ Add Link"}
                    </button>
                    {currentUser.facebookUsername && (
                      <button
                        onClick={() => {
                          handleUpdateUserIntegrations(
                            currentUser.email,
                            undefined,
                            currentUser.instagramUsername,
                            currentUser.isEmailConnected,
                            false,
                            currentUser.isInstagramConnected
                          );
                        }}
                        className="text-red-600 hover:text-red-800 hover:underline cursor-pointer font-bold"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* INSTAGRAM CHANNEL CARD */}
              <div className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl p-4 transition duration-150 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-red-50 text-red-650 rounded-lg border border-red-100">
                        <Instagram className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-2xs font-extrabold text-slate-700 uppercase tracking-widest leading-3">Instagram Handle</h4>
                        <p className="text-3xs text-slate-400 font-mono mt-0.5">Social Backup</p>
                      </div>
                    </div>
                    <span className={`text-3xs px-2 py-0.5 font-bold uppercase rounded ${
                      currentUser.isInstagramConnected
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-slate-200 text-slate-600 border border-slate-300/45"
                    }`}>
                      {currentUser.isInstagramConnected ? "Linked" : "Not Linked"}
                    </span>
                  </div>

                  <div className="mt-4 text-xs">
                    {currentUser.instagramUsername ? (
                      <span className="font-mono text-slate-800 font-bold block truncate">{currentUser.instagramUsername}</span>
                    ) : (
                      <span className="text-slate-400 italic text-2xs block">No Instagram account linked</span>
                    )}
                  </div>
                </div>

                {editingIntegration === "instagram" ? (
                  <div className="mt-3 p-2 bg-white rounded-lg border border-slate-250 animate-fade-in space-y-2">
                    <input
                      type="text"
                      value={integrationInput}
                      onChange={(e) => setIntegrationInput(e.target.value)}
                      placeholder="@username"
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5 text-3xs uppercase tracking-wide font-bold">
                      <button
                        onClick={() => setEditingIntegration(null)}
                        className="px-2 py-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (integrationInput.trim().length > 1) {
                            handleUpdateUserIntegrations(
                              currentUser.email,
                              currentUser.facebookUsername,
                              integrationInput.trim(),
                              currentUser.isEmailConnected,
                              currentUser.isFacebookConnected,
                              true
                            );
                            setEditingIntegration(null);
                          }
                        }}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between text-3xs font-extrabold uppercase pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingIntegration("instagram");
                        setIntegrationInput(currentUser.instagramUsername || "");
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {currentUser.instagramUsername ? "Edit Link" : "+ Add Link"}
                    </button>
                    {currentUser.instagramUsername && (
                      <button
                        onClick={() => {
                          handleUpdateUserIntegrations(
                            currentUser.email,
                            currentUser.facebookUsername,
                            undefined,
                            currentUser.isEmailConnected,
                            currentUser.isFacebookConnected,
                            false
                          );
                        }}
                        className="text-red-600 hover:text-red-800 hover:underline cursor-pointer font-bold"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Tab views rendering switches */}
        <section id="content-container-stage" className="mt-4 min-h-[500px]">
          {currentTab === "study" && (
            <FlashcardViewer
              cards={getPrioritySortedCards()} // Prioritized queue sorted on-the-fly
              onReviewCard={handleReviewCard}
              predictForgetProb={getCardForgettingProb}
            />
          )}

          {currentTab === "manage" && (
            <CardManager
              cards={cards}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onAddGeneratedCards={handleAddGeneratedCards}
            />
          )}

          {currentTab === "analytics" && (
            <Dashboard
              cards={cards}
              records={records}
              weights={weights}
              metrics={metrics}
              predictForgetProb={getCardForgettingProb}
              onResetWeights={handleResetWeights}
              onRetrainModel={handleRetrainModel}
            />
          )}
        </section>
      </main>
    </div>
  );
}
