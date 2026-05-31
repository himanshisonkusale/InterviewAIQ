import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav>
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Image src="/logo.svg" alt="InterviewAIQ Logo" width={38} height={32} className="drop-shadow-[0_0_10px_rgba(0,242,254,0.8)] group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] tracking-tight">InterviewAIQ</h2>
        </Link>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
