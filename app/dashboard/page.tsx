import Link from "next/link";
import Image from "next/image";
import { Zap, Activity, Target, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  // ✅ FIX: prevent undefined user crash
  if (!user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        
        <div className="bg-gradient-to-br from-[#13131c] to-[#0a0a12] border border-[#00F2FE]/20 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,242,254,0.1)] text-center">
          <p className="text-xl text-[#8b949e]">Please login to continue</p>
        </div>
      </div>
    );
  }

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <div className="flex flex-col gap-12 w-full pb-20 selection:bg-[#00F2FE]/30 text-white">
      {/* ── HERO CTA SECTION ── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#13131c] to-[#05050A] border border-[#00F2FE]/10 p-10 lg:p-14 group shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_-15px_rgba(0,242,254,0.15)] transition-all duration-700">
        {/* Futuristic Background Overlays */}
        <div className="absolute inset-0 bg-[url('/pattern.png')] bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00F2FE] rounded-full blur-[150px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4FACFE] rounded-full blur-[150px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#00F2FE]/10 border border-[#00F2FE]/20 rounded-full px-4 py-1.5 text-sm font-medium text-[#00F2FE] w-fit shadow-[0_0_15px_rgba(0,242,254,0.1)]">
              <Zap className="w-4 h-4" />
              <span>AI-Powered Practice</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Get Interview-Ready with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#4FACFE]">
                Instant Feedback
              </span>
            </h2>
            
            <p className="text-lg text-[#8b949e] font-light">
              Deploy hyper-realistic AI interviewers. Analyze micro-expressions, behavioral biometrics, and technical depth with zero human bias.
            </p>

            <Button asChild className="w-fit bg-[#00F2FE] text-[#05050A] hover:bg-[#4FACFE] hover:scale-105 font-bold px-8 py-6 rounded-full shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_40px_rgba(0,242,254,0.6)] transition-all mt-4 border-0">
              <Link href="/dashboard/interview" className="flex items-center gap-2 text-base">
                Initialize Session <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          <div className="relative max-md:hidden w-full max-w-[350px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00F2FE]/20 to-transparent rounded-full animate-[spin_8s_linear_infinite] blur-xl" />
            <div className="absolute inset-4 border border-[#00F2FE]/30 rounded-full animate-[spin_12s_linear_infinite_reverse] border-dashed" />
            <Image
              src="/robot.png"
              alt="AI Assistant"
              width={350}
              height={350}
              className="relative z-10 drop-shadow-[0_0_30px_rgba(0,242,254,0.5)] transform hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* ── PAST INTERVIEWS ── */}
      <section className="flex flex-col gap-8 mt-4 relative z-10">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00F2FE]/10 flex items-center justify-center border border-[#00F2FE]/20 shadow-[0_0_15px_rgba(0,242,254,0.1)]">
            <Activity className="text-[#00F2FE] w-5 h-5" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Your Session History</h2>
        </div>

        <div className="flex flex-wrap gap-6 w-full items-stretch">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <div key={interview.id} className="transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] rounded-2xl">
                <InterviewCard
                  userId={user.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              </div>
            ))
          ) : (
            <div className="w-full bg-[#13131c]/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
              <Activity className="w-12 h-12 text-[#8b949e]/30" />
              <p className="text-[#8b949e] font-light text-lg">No session history detected in the matrix.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── UPCOMING / AVAILABLE INTERVIEWS ── */}
      <section className="flex flex-col gap-8 mt-4 relative z-10">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#4FACFE]/10 flex items-center justify-center border border-[#4FACFE]/20 shadow-[0_0_15px_rgba(79,172,254,0.1)]">
            <Target className="text-[#4FACFE] w-5 h-5" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Available Simulations</h2>
        </div>

        <div className="flex flex-wrap gap-6 w-full items-stretch">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <div key={interview.id} className="transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(79,172,254,0.15)] rounded-2xl">
                <InterviewCard
                  userId={user.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              </div>
            ))
          ) : (
            <div className="w-full bg-[#13131c]/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
              <Target className="w-12 h-12 text-[#8b949e]/30" />
              <p className="text-[#8b949e] font-light text-lg">No active simulations available at this time.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;