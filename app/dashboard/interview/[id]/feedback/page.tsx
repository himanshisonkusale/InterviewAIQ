import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Star, Calendar, ChevronLeft, RotateCcw, Target, Zap, CheckCircle2, AlertTriangle, Activity } from "lucide-react";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/dashboard");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const totalScore = feedback?.totalScore || 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 selection:bg-[#00F2FE]/30 text-white">
      {/* ── HEADER & OVERALL SCORE ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 bg-gradient-to-br from-[#13131c] to-[#05050A] p-8 md:p-12 rounded-[2rem] border border-[#00F2FE]/20 shadow-[0_0_40px_rgba(0,242,254,0.1)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('/pattern.png')] bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00F2FE] rounded-full blur-[120px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity" />

        <div className="relative z-10 flex flex-col gap-4 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-[#00F2FE]/10 border border-[#00F2FE]/20 rounded-full px-4 py-1.5 text-sm font-medium text-[#00F2FE] w-fit shadow-[0_0_15px_rgba(0,242,254,0.1)]">
            <Activity className="w-4 h-4" />
            <span>Analysis Complete</span>
          </div>
          {feedback?.terminatedByFlags && (
  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4">
    <span className="text-red-500 text-2xl">🚩</span>
    <div>
      <p className="text-red-400 font-bold text-base">Interview Terminated — Integrity Violation</p>
      <p className="text-red-400/70 text-sm font-light mt-0.5">
        This session was automatically ended after {feedback?.redFlags} red flag{feedback?.redFlags !== 1 ? "s" : ""} were detected (multiple faces / tab switch / fullscreen exit).
      </p>
    </div>
  </div>
)}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Performance Report <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] capitalize">
              {interview.role} Role
            </span>
          </h1>
          <div className="flex items-center gap-6 mt-2 text-[#8b949e]">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00F2FE]/70" />
              <span className="font-light">
                {feedback?.createdAt ? dayjs(feedback.createdAt).format("MMM D, YYYY") : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Big Score Display */}
        <div className="relative z-10 flex flex-col items-center justify-center shrink-0">
          <div className="relative flex items-center justify-center w-40 h-40 md:w-48 md:h-48">
            {/* SVG Circle */}
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_20px_rgba(0,242,254,0.3)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="6" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" 
                className="text-[#00F2FE]" 
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(totalScore / 100) * 283} 283`}
                style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white drop-shadow-md">{totalScore}</span>
              <span className="text-xs text-[#00F2FE] font-bold tracking-widest uppercase mt-1">Score</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── LEFT COLUMN (Assessment & Breakdown) ── */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Final Assessment */}
          <div className="bg-[#13131c]/60 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 text-white">
              <Star className="text-[#00F2FE]" /> Executive Summary
            </h2>
            <p className="text-[#8b949e] leading-relaxed text-lg font-light">
              {feedback?.finalAssessment || "No overall assessment provided."}
            </p>
          </div>

          {/* Performance Chart (Category Scores) */}
          <div className="bg-[#13131c]/60 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-8 text-white">
              <Target className="text-[#00F2FE]" /> Metrics Breakdown
            </h2>
            
            <div className="flex flex-col gap-8">
              {feedback?.categoryScores && feedback.categoryScores.length > 0 ? (
                feedback.categoryScores.map((category, index) => (
                  <div key={index} className="flex flex-col gap-3 group">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-semibold text-white/90 text-lg tracking-wide">{category.name}</span>
                      <span className="text-[#00F2FE] font-bold">{category.score}/100</span>
                    </div>
                    {/* Progress Bar Track */}
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                       <div 
                         className="h-full bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] rounded-full shadow-[0_0_10px_rgba(0,242,254,0.8)] group-hover:shadow-[0_0_20px_rgba(0,242,254,1)] transition-shadow duration-300" 
                         style={{ width: `${category.score}%` }}
                       />
                    </div>
                    <p className="text-sm text-[#8b949e] font-light mt-1 italic leading-relaxed">{category.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-[#8b949e] italic font-light">No category metrics available.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Strengths & Improvements) ── */}
        <div className="flex flex-col gap-8">
          
          {/* Strengths */}
          <div className="bg-gradient-to-b from-[#13131c]/80 to-[#13131c]/40 border border-green-500/20 p-8 rounded-3xl backdrop-blur-md shadow-[0_0_30px_rgba(34,197,94,0.05)]">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-green-400">
              <CheckCircle2 className="w-6 h-6" /> Key Strengths
            </h3>
            <ul className="flex flex-col gap-4">
              {feedback?.strengths && feedback.strengths.length > 0 ? (
                feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-3 text-[#8b949e] font-light group">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.8)] group-hover:scale-125 transition-transform" />
                    <span className="leading-relaxed">{strength}</span>
                  </li>
                ))
              ) : (
                <li className="text-white/30 italic font-light">No specific strengths identified.</li>
              )}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-gradient-to-b from-[#13131c]/80 to-[#13131c]/40 border border-amber-500/20 p-8 rounded-3xl backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-amber-400">
              <AlertTriangle className="w-6 h-6" /> Target Areas
            </h3>
            <ul className="flex flex-col gap-4">
              {feedback?.areasForImprovement && feedback.areasForImprovement.length > 0 ? (
                feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex gap-3 text-[#8b949e] font-light group">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)] group-hover:scale-125 transition-transform" />
                    <span className="leading-relaxed">{area}</span>
                  </li>
                ))
              ) : (
                <li className="text-white/30 italic font-light">No areas for improvement identified.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 border-t border-white/10 pt-10">
        <Link href="/dashboard" className="w-full sm:w-auto">
          <button className="w-full relative group flex items-center justify-center gap-3 bg-[#13131c] text-white font-bold text-lg px-10 py-5 rounded-full border border-white/20 transition-all hover:bg-white/5 hover:border-white/40">
            <ChevronLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </Link>
        <Link href={`/dashboard/interview/${id}`} className="w-full sm:w-auto">
          <button className="w-full relative group flex items-center justify-center gap-3 bg-[#00F2FE] text-[#05050A] font-bold text-lg px-10 py-5 rounded-full transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_40px_rgba(0,242,254,0.5)] hover:scale-105 border-0">
            <RotateCcw className="w-5 h-5" /> Retake Simulation
          </button>
        </Link>
      </div>

    </div>
  );
};

export default Feedback;
