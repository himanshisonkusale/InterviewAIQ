"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BrainCircuit,
  Mic,
  Activity,
  Zap,
  Target,
  ShieldCheck,
  ChevronRight,
  Play,
  Lock,
} from "lucide-react";

const FeatureCard = ({ title, desc, icon: Icon, delay }: { title: string, desc: string, icon: any, delay: number }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#13131c] to-[#0a0a12] border border-white/5 p-8 group cursor-pointer h-full flex flex-col shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] hover:shadow-[0_0_50px_-15px_rgba(0,242,254,0.3)] hover:-translate-y-2 transition-all duration-500"
    >
      {/* 3D Inner Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(0,242,254,0.15), transparent 40%)`,
        }}
      />
      
      <div className="relative z-10 flex-1 transform-gpu transition-transform duration-500 group-hover:translate-z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F2FE]/20 to-[#4FACFE]/5 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] mb-8 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,242,254,0.4)] transition-all duration-500">
          <Icon size={32} className="drop-shadow-[0_0_15px_rgba(0,242,254,0.8)]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#00F2FE]/80 transition-all duration-300">{title}</h3>
        <p className="text-[#8b949e] leading-relaxed font-light text-lg">{desc}</p>
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const videoRotateX = useTransform(scrollYProgress, [0, 0.3], [6, 0]);
  const videoRotateY = useTransform(scrollYProgress, [0, 0.3], [-12, 0]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-[#05050A] text-white selection:bg-[#00F2FE]/30 overflow-x-hidden font-sans"
    >
      {/* ── SHIMMER & TEXTURE OVERLAYS ── */}
      <div className="fixed inset-0 pointer-events-none z-[100] mix-blend-overlay opacity-[0.05]">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="fixed inset-0 z-[90] pointer-events-none opacity-[0.15]"
        style={{
          background: "linear-gradient(60deg, transparent 20%, rgba(255,255,255,0.03) 40%, rgba(0,242,254,0.06) 50%, rgba(255,255,255,0.03) 60%, transparent 80%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <motion.div
          animate={{
            x: mousePos.x * -30,
            y: mousePos.y * -30,
          }}
          transition={{ type: "spring", damping: 50, stiffness: 200 }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00F2FE] rounded-full blur-[180px] opacity-10"
        />
        <motion.div
          animate={{
            x: mousePos.x * 40,
            y: mousePos.y * 40,
          }}
          transition={{ type: "spring", damping: 50, stiffness: 200 }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1a388b] rounded-full blur-[180px] opacity-20"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)" />
      </div>

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-transparent"
      >
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative w-10 h-10 rounded-xl bg-[#00F2FE]/10 flex items-center justify-center border border-[#00F2FE]/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FE]/20 to-transparent group-hover:opacity-100 transition-opacity" />
            <BrainCircuit className="text-[#00F2FE] w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#00F2FE] transition-colors">
            InterviewAIQ
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-[#8b949e]">
          <a href="#hero" className="hover:text-white transition-colors">Platform</a>
          <a href="#features" className="hover:text-white transition-colors">Technology</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
        </div>
        <div className="hidden md:block w-32" /> {/* Empty spacer to balance center alignment */}
      </motion.nav>

      {/* ── HERO ── */}
      <section
        id="hero"
        className="relative min-h-[85vh] flex flex-col items-center justify-center pt-28 lg:pt-32 pb-20 px-6 overflow-hidden"
      >
        {/* Immersive Background Video (Full Screen Width) */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-full sm:w-[120%] lg:w-[55vw] h-[120%] lg:h-[140%] z-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
            className="w-full h-full"
            style={{
              maskImage: "radial-gradient(ellipse at center right, black 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center right, black 20%, transparent 75%)"
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-100 brightness-[1.3] contrast-[1.2] saturate-[1.2] mix-blend-screen"
              src="/Candidate_interviewing_AI_assistant.mp4"
            />
          </motion.div>
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl w-full flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-12"
        >
          {/* Text Content */}
          <div className="flex-1 flex flex-col gap-8 text-center lg:text-left z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#00F2FE]/10 border border-[#00F2FE]/20 rounded-full px-5 py-2 text-sm font-medium text-[#00F2FE] w-fit mx-auto lg:mx-0 shadow-[0_0_15px_rgba(0,242,254,0.1)] backdrop-blur-sm"
            >
              <Zap className="w-4 h-4" />
              <span>Next-Gen Candidate Assessment</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tighter"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="block text-white mb-2"
              >
                The Future Of
              </motion.span>
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-[#4FACFE] to-[#00F2FE] animate-gradient bg-[length:200%_auto] mb-2"
              >
                Assessment,
              </motion.span>
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="block text-white opacity-90"
              >
                Powered by AIQ
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg md:text-xl text-[#8b949e] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
            >
              Deploy hyper-realistic AI interviewers. Analyze micro-expressions,
              behavioral biometrics, and technical depth with zero human bias.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4"
            >
              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-[#00F2FE] text-[#05050A] font-bold px-8 py-4 rounded-full flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:shadow-[0_0_40px_rgba(0,242,254,0.6)] transition-all"
                >
                  Get Started <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-transparent text-white font-semibold px-8 py-4 rounded-full border border-white/10 hover:border-[#00F2FE]/50 transition-all flex items-center justify-center gap-3"
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>
          </div>

        </motion.div>
      </section>

      {/* ── FEATURES GRID (BENTO BOX) ── */}
      <section id="features" className="py-32 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
              Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#4FACFE]">Excellence</span>
            </h2>
            <p className="text-lg md:text-xl text-[#8b949e] max-w-3xl mx-auto font-light">
              Our proprietary engine evaluates candidates on an unprecedented multidimensional matrix, leaving no blind spots.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            <div className="md:col-span-2 lg:col-span-2">
              <FeatureCard
                title="Real-time Voice Analysis"
                desc="Millisecond-latency voice processing captures tone, hesitation, and clarity. Native integration with Vapi ensures a fluid, conversational flow that feels inherently human and adapts to candidate responses."
                icon={Mic}
                delay={0}
              />
            </div>
            <div className="col-span-1">
              <FeatureCard
                title="Behavioral Biometrics"
                desc="Advanced mapping algorithms continuously monitor stress levels and engagement metrics to build a complete behavioral profile."
                icon={Activity}
                delay={0.1}
              />
            </div>
            <div className="col-span-1">
              <FeatureCard
                title="Instant AIQ Scoring"
                desc="Dynamic scoring across 5 core pillars. Feedback is generated the moment the session concludes, providing actionable insights instantly."
                icon={Target}
                delay={0.2}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <FeatureCard
                title="Unbiased Evaluation Engine"
                desc="Calibrated against millions of data points to ensure fair, objective, and standardized assessments for every single candidate, eliminating human unconscious bias entirely from the screening process."
                icon={ShieldCheck}
                delay={0.3}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── THE AIQ WORKFLOW ── */}
      <section id="workflow" className="py-32 px-6 bg-[#030305] border-y border-white/5 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
        {/* Deep ambient glow for workflow background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,242,254,0.03),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-28"
          >
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight drop-shadow-2xl">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-[#4FACFE] to-[#00F2FE] animate-gradient bg-[length:200%_auto]">Workflow</span>
            </h2>
            <p className="text-xl md:text-2xl text-[#8b949e] max-w-2xl mx-auto font-light">
              A frictionless pathway from connection to deep analytics.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-6 relative">
            {/* 3D Glowing Connecting line */}
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#00F2FE]/20 to-transparent">
              <motion.div
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="h-full w-48 bg-gradient-to-r from-transparent via-[#00F2FE] to-transparent shadow-[0_0_30px_#00F2FE]"
              />
            </div>

            {[
              { num: "01", title: "Initialize Sync", desc: "Candidate connects securely. System calibrates audio/video fidelity and authenticates identity automatically." },
              { num: "02", title: "Dynamic Simulation", desc: "AI engages in an adaptive, context-aware technical dialogue tailored to the specific role requirements." },
              { num: "03", title: "Deep Analytics", desc: "A comprehensive performance matrix is generated instantly, highlighting strengths and developmental areas." }
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.2, duration: 0.7, type: "spring", bounce: 0.4 }}
                className="flex-1 relative group w-full max-w-sm mx-auto"
              >
                <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-b from-[#13131c] to-[#05050A] border border-white/10 flex items-center justify-center mb-10 relative z-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] group-hover:border-[#00F2FE]/50 group-hover:shadow-[0_0_50px_rgba(0,242,254,0.3)] group-hover:-translate-y-3 transition-all duration-500">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00F2FE] font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(0,242,254,0.5)] group-hover:scale-110 transition-transform duration-500">{step.num}</span>
                  {/* Glowing 3D rings */}
                  <div className="absolute -inset-4 border border-[#00F2FE]/10 rounded-[2rem] opacity-0 group-hover:opacity-100 group-hover:animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] transition-all duration-500" />
                  <div className="absolute inset-0 border-[3px] border-dashed border-[#00F2FE]/40 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:animate-[spin_6s_linear_infinite] transition-all duration-500" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00F2FE]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                <h3 className="text-3xl font-bold mb-5 text-center text-white tracking-tight">{step.title}</h3>
                <p className="text-[#8b949e] text-lg leading-relaxed text-center font-light px-4">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00F2FE]/5 mix-blend-screen" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight tracking-tight"
          >
            Ready to upgrade your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#4FACFE]">
              hiring matrix?
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#8b949e] mb-12 text-xl max-w-2xl mx-auto font-light"
          >
            Join the beta and experience the next evolution of technical talent acquisition.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/sign-up">
              <button className="relative group inline-flex items-center justify-center gap-3 bg-[#00F2FE] text-[#05050A] font-bold text-lg px-12 py-5 rounded-full overflow-hidden transition-all shadow-[0_0_30px_rgba(0,242,254,0.3)] hover:shadow-[0_0_50px_rgba(0,242,254,0.5)]">
                <span className="relative z-10">Initialize Now</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#4FACFE] to-[#00F2FE] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 pt-20 pb-12 px-6 bg-[#020204] relative overflow-hidden">
        {/* Subtle footer glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00F2FE] blur-[200px] opacity-[0.03] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#00F2FE]/10 flex items-center justify-center border border-[#00F2FE]/30">
                  <BrainCircuit className="text-[#00F2FE] w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">InterviewAIQ</span>
              </div>
              <p className="text-[#8b949e] font-light max-w-sm text-lg leading-relaxed mb-6">
                Redefining the future of technical talent acquisition with hyper-realistic AI and bias-free evaluation.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com/himanshisonkusale/InterviewAIQ" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#00F2FE] hover:text-[#05050A] transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(0,242,254,0.4)]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Platform</h4>
              <ul className="space-y-4 text-[#8b949e]">
                <li><a href="#features" className="hover:text-[#00F2FE] transition-colors">Technology</a></li>
                <li><a href="#workflow" className="hover:text-[#00F2FE] transition-colors">How it works</a></li>
                <li><a href="/sign-up" className="hover:text-[#00F2FE] transition-colors">Initialize Session</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Legal</h4>
              <ul className="space-y-4 text-[#8b949e]">
                <li><a href="#" className="hover:text-[#00F2FE] transition-colors">Privacy Matrix</a></li>
                <li><a href="#" className="hover:text-[#00F2FE] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#00F2FE] transition-colors">Data Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[#8b949e] text-sm font-light">
              © {new Date().getFullYear()} InterviewAIQ. All systems operational.
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8b949e]">
              <span className="font-light">Designed by</span>
              <span className="font-bold text-white tracking-wide">Himanshi</span>
              <div className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse ml-1" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}