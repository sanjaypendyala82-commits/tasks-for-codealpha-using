/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../types";
import { BrainCircuit, Lock, UserCheck, ShieldAlert, Sparkles, UserPlus, KeyRound, Cpu, Mail, Facebook, Instagram, CheckCircle } from "lucide-react";

interface LoginGateProps {
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  onCreateUser: (
    username: string,
    displayName: string,
    avatarSeed: string,
    email?: string,
    facebookUsername?: string,
    instagramUsername?: string,
    isEmailConnected?: boolean,
    isFacebookConnected?: boolean,
    isInstagramConnected?: boolean
  ) => User | null;
}

export default function LoginGate({
  onLoginSuccess,
  allUsers,
  onCreateUser,
}: LoginGateProps) {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("••••••••"); // illustrative standard credential
  const [error, setError] = useState<string | null>(null);

  // Email and Social Integration state variables
  const [email, setEmail] = useState("");
  const [facebookUsername, setFacebookUsername] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  
  const [isEmailConnected, setIsEmailConnected] = useState(false);
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  // Quick avatar options
  const avatars = ["🧠", "🧬", "💻", "🔬", "🛰️", "🚀", "🎓", "🤖"];
  const [selectedAvatar, setSelectedAvatar] = useState("🧠");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalUser = username.trim().toLowerCase();
    const found = allUsers.find((u) => u.username.toLowerCase() === normalUser);

    if (found) {
      onLoginSuccess(found);
    } else {
      setError(`Profile with username "${username}" not found. Simply click "Create Account" below to register this profile in seconds!`);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !displayName.trim()) {
      setError("Please fill out both the username and display name.");
      return;
    }

    const normalUser = username.trim().toLowerCase();
    const existing = allUsers.find((u) => u.username.toLowerCase() === normalUser);
    if (existing) {
      setError("That username is already taken. Please pick another one.");
      return;
    }

    const newUser = onCreateUser(
      username.trim(),
      displayName.trim(),
      selectedAvatar,
      email.trim() || undefined,
      facebookUsername.trim() || undefined,
      instagramUsername.trim() || undefined,
      isEmailConnected || !!email.trim(),
      isFacebookConnected || !!facebookUsername.trim(),
      isInstagramConnected || !!instagramUsername.trim()
    );

    if (newUser) {
      onLoginSuccess(newUser);
    } else {
      setError("Failed to create profile. Please check credentials format.");
    }
  };

  const handleQuickSelect = (user: User) => {
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 bg-slate-100/65">
      {/* Brand Launcher Logo */}
      <div className="text-center mb-8 max-w-sm animate-fade-in">
        <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 rounded-2xl text-white shadow-xl shadow-blue-500/10 mb-4 ring-4 ring-blue-50">
          <BrainCircuit className="h-7 w-7 animate-pulse" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
          Cogni<span className="text-blue-600">Memory</span>
        </h1>
        <p className="text-xs text-slate-500 font-mono font-bold uppercase tracking-widest mt-0.5">
          Predictive <span className="text-red-600 font-extrabold">Spaced Repetition</span> Workspace
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
        {/* Top Decorative Border utilizing red, grey, and blue */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-slate-400 to-blue-600" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Toggle Title */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 pt-1.5">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isSignUpMode ? (
              <>
                <UserPlus className="h-5 w-5 text-blue-600" /> Create Cognitive Account
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-blue-600" /> Workspace Login Gate
              </>
            )}
          </h2>
          <span className="text-2xs font-mono uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-150 font-bold flex items-center gap-1">
            <Cpu className="h-3 w-3 animate-pulse" /> SECURE LAB
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-2.5 leading-relaxed">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-500" />
            <div>
              <span className="font-bold">Access Warning: </span>
              {error}
            </div>
          </div>
        )}

        {/* Regular Login Mode */}
        {!isSignUpMode ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-2xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                Username / Identifier
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. sanjay, guest_tester"
                className="w-full text-sm border border-slate-300 rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                Workspace Lock Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full text-sm border border-slate-300 rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                  required
                />
                <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <span className="block text-3xs text-slate-500 mt-1.5">
                Note: Standard credential values are verified against locally isolated sandbox profiles.
              </span>
            </div>

             <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-sm border border-blue-600 cursor-pointer"
            >
              <UserCheck className="h-4.5 w-4.5 text-white" /> Unlock Workspace
            </button>
          </form>
        ) : (
          /* Sign Up / Create Profile Mode */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-2xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                Select Your Study Avatar
              </label>
              <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-50 border border-slate-200/65 rounded-xl">
                {avatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`text-xl p-1.5 rounded-lg transition-all ${
                      selectedAvatar === av
                        ? "bg-white border-2 border-blue-500 shadow-sm transform scale-105"
                        : "hover:bg-white/50 border border-transparent"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                Choose Unique Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. student_alpha, coder99"
                className="w-full text-sm border border-slate-300 rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sanjay Pendyala, John Doe"
                className="w-full text-sm border border-slate-300 rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            {/* Extended Connections Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3.5">
              <span className="block text-2xs font-black text-slate-700 uppercase tracking-wider">
                🔗 Link External Channels
              </span>

              {/* Email Connection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-extrabold text-slate-600 uppercase flex items-center gap-1">
                    <Mail className="h-3 w-3 text-red-500" /> Email Address
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (email.trim().includes("@")) {
                        setIsEmailConnected(!isEmailConnected);
                      }
                    }}
                    className={`text-3xs px-2 py-0.5 rounded font-mono font-bold uppercase transition ${
                      isEmailConnected
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                    }`}
                  >
                    {isEmailConnected ? "Linked ✓" : "Click to Link"}
                  </button>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    if (val.trim().includes("@")) {
                      setIsEmailConnected(true);
                    } else {
                      setIsEmailConnected(false);
                    }
                  }}
                  placeholder="e.g. sanjay@gmail.com"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* Facebook Connection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-extrabold text-slate-600 uppercase flex items-center gap-1">
                    <Facebook className="h-3 w-3 text-blue-600" /> Facebook Profile
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (facebookUsername.trim()) {
                        setIsFacebookConnected(!isFacebookConnected);
                      }
                    }}
                    className={`text-3xs px-2 py-0.5 rounded font-mono font-bold uppercase transition ${
                      isFacebookConnected
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                    }`}
                  >
                    {isFacebookConnected ? "Linked ✓" : "Click to Link"}
                  </button>
                </div>
                <input
                  type="text"
                  value={facebookUsername}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFacebookUsername(val);
                    if (val.trim().length > 2) {
                      setIsFacebookConnected(true);
                    } else {
                      setIsFacebookConnected(false);
                    }
                  }}
                  placeholder="e.g. facebook.com/sanjay.pendyala"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* Instagram Connection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-extrabold text-slate-600 uppercase flex items-center gap-1">
                    <Instagram className="h-3 w-3 text-red-500" /> Instagram Handle
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (instagramUsername.trim()) {
                        setIsInstagramConnected(!isInstagramConnected);
                      }
                    }}
                    className={`text-3xs px-2 py-0.5 rounded font-mono font-bold uppercase transition ${
                      isInstagramConnected
                        ? "bg-red-100 text-red-750 border border-red-250"
                        : "bg-red-50/75 text-red-600 hover:bg-red-100 border border-red-100"
                    }`}
                  >
                    {isInstagramConnected ? "Linked ✓" : "Click to Link"}
                  </button>
                </div>
                <input
                  type="text"
                  value={instagramUsername}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInstagramUsername(val);
                    if (val.trim().length > 2) {
                      setIsInstagramConnected(true);
                    } else {
                      setIsInstagramConnected(false);
                    }
                  }}
                  placeholder="e.g. @sanjay_pendyala"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 outline-none focus:ring-1 focus:ring-red-450"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-sm border border-blue-600 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 animate-pulse" /> Initialize My Workspace Profile
            </button>
          </form>
        )}

        {/* Footer Toggle Modes */}
        <div className="mt-6 border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-500">
          <span>
            {isSignUpMode ? "Already verified?" : "First time studying?"}
          </span>
          <button
            onClick={() => {
              setIsSignUpMode(!isSignUpMode);
              setError(null);
              // reset fields
              setUsername("");
              setDisplayName("");
            }}
            className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
          >
            {isSignUpMode ? "Sign In Instead" : "Create Lock Profile"}
          </button>
        </div>

        {/* Pre-configured Demo Accounts Helper */}
        {allUsers.length > 0 && !isSignUpMode && (
          <div className="mt-6 bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-500">
            <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wide text-3xs flex items-center gap-1">
              <span>👤 Quick-Select Registered Profiles</span>
            </h4>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickSelect(user)}
                  className="w-full flex items-center justify-between p-2 bg-white hover:bg-blue-50/50 rounded-lg border border-slate-200 transition text-left text-2xs font-medium hover:border-blue-200"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{user.avatarSeed}</span>
                    <span className="text-slate-800 font-bold truncate">{user.displayName}</span>
                    <span className="text-gray-400 font-mono">(@{user.username})</span>
                  </span>
                  <span className="text-3xs text-blue-600 font-bold group-hover:underline">Quick Unlock →</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-6 text-2xs text-slate-400 max-w-sm font-mono">
        Designed for strict secure environments. To access real-time cloud data, authentication profiles are isolated safely on local clients.
      </div>
    </div>
  );
}
