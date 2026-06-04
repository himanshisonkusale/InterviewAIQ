import Link from "next/link";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserFeedbackHistory } from "@/lib/actions/general.action";
import ProgressChart from "@/components/ProgressChart";

async function ProgressPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-[#8b949e]">Please login to continue</p>
      </div>
    );
  }

  const feedbackHistory = await getUserFeedbackHistory(user.id);

  return (
    <div className="flex flex-col gap-8 w-full pb-20 text-white">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <TrendingUp className="text-green-400 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Your Progress</h1>
            <p className="text-sm text-white/40">Track your improvement across all interviews</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* ── Chart ── */}
      <div className="bg-gradient-to-b from-[#13131c] to-[#05050A] border border-white/[0.07] rounded-[2rem] p-6 md:p-8">
        <ProgressChart feedbackHistory={feedbackHistory ?? []} />
      </div>

    </div>
  );
}

export default ProgressPage;