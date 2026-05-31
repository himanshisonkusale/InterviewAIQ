import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { BrainCircuit } from "lucide-react";

import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav>
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 rounded-xl bg-[#00F2FE]/10 flex items-center justify-center border border-[#00F2FE]/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FE]/20 to-transparent group-hover:opacity-100 transition-opacity" />

        <BrainCircuit className="text-[#00F2FE] w-6 h-6 drop-shadow-[0_0_12px_rgba(0,242,254,0.9)] group-hover:scale-110 transition-transform" />
      </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] tracking-tight">InterviewAIQ</h2>
        </Link>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
