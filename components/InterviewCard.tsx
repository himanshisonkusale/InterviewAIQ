import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Star, ChevronRight } from "lucide-react";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeStyles =
    {
      Behavioral: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Mixed: "bg-[#00F2FE]/10 text-[#00F2FE] border-[#00F2FE]/20",
      Technical: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    }[normalizedType] || "bg-[#00F2FE]/10 text-[#00F2FE] border-[#00F2FE]/20";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="group relative w-[360px] max-sm:w-full min-h-[400px] flex flex-col rounded-3xl bg-gradient-to-b from-[#13131c] to-[#0a0a12] border border-white/5 shadow-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,242,254,0.15)] hover:border-[#00F2FE]/30 overflow-hidden">
      
      {/* Animated Gradient Border Effect (Inner) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FE]/[0.03] via-transparent to-[#4FACFE]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative flex flex-col h-full p-6 lg:p-8 z-10 justify-between gap-6">
        <div className="flex flex-col">
          {/* Top Row: Avatar & Badge */}
          <div className="flex justify-between items-start w-full mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00F2FE] blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500" />
              <Image
                src={getRandomInterviewCover()}
                alt="cover-image"
                width={80}
                height={80}
                className="rounded-full object-cover size-[80px] border-2 border-white/10 group-hover:border-[#00F2FE]/50 transition-colors relative z-10 bg-[#05050A]"
              />
            </div>
            
            <div className={cn("px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase shadow-sm", badgeStyles)}>
              {normalizedType}
            </div>
          </div>

          {/* Interview Role */}
          <h3 className="text-2xl font-bold text-white tracking-tight capitalize group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00F2FE] group-hover:to-[#4FACFE] transition-all duration-300">
            {role}
          </h3>
          <p className="text-sm font-medium text-[#8b949e] uppercase tracking-widest mt-1 mb-6">Simulation</p>

          {/* Date & Score */}
          <div className="flex flex-row gap-6 mb-6">
            <div className="flex flex-row gap-2 items-center text-[#8b949e]">
              <Calendar className="w-4 h-4 text-[#00F2FE]" />
              <p className="text-sm font-medium">{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center text-[#8b949e]">
              <Star className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-bold text-white">
                {feedback?.totalScore || "---"}<span className="text-[#8b949e] font-normal">/100</span>
              </p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="text-sm text-[#8b949e] leading-relaxed line-clamp-2 font-light">
            {feedback?.finalAssessment ||
              "Initialization pending. Deploy this simulation to calibrate your neural performance."}
          </p>
        </div>

        {/* Bottom Row: Tech Icons & Button */}
        <div className="flex flex-row items-center justify-between mt-auto pt-6 border-t border-white/5">
          <DisplayTechIcons techStack={techstack} />

          <Button asChild className={cn(
            "rounded-full font-bold px-6 py-5 transition-all duration-300 flex items-center justify-center gap-2",
            feedback 
              ? "bg-[#13131c] text-[#00F2FE] border border-[#00F2FE]/30 hover:bg-[#00F2FE]/10" 
              : "bg-[#00F2FE] text-[#05050A] border-0 shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.5)] hover:scale-105"
          )}>
            <Link
              href={
                feedback
                  ? `/dashboard/interview/${interviewId}/feedback`
                  : `/dashboard/interview/${interviewId}`
              }
            >
              {feedback ? "View Results" : "Initialize"} <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
