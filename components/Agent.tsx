"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { BrainCircuit } from "lucide-react";
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

// ─── Interview Timer ──────────────────────────────────────────────────────────
function InterviewTimer({ running }: { running: boolean }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <span className="font-mono text-sm font-bold tracking-widest text-[#00F2FE]">
      {mm}:{ss}
    </span>
  );
}

// ─── Mic Level Visualizer ─────────────────────────────────────────────────────
function MicVisualizer({ active }: { active: boolean }) {
  const [bars, setBars] = useState<number[]>([3, 3, 3, 3, 3, 3, 3]);
  const animRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!active) {
      setBars([3, 3, 3, 3, 3, 3, 3]);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const newBars = [0, 1, 2, 3, 4, 5, 6].map((i) =>
            Math.max(3, Math.round(((data[i * 2] || 0) / 255) * 24))
          );
          setBars(newBars);
          animRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        const idle = () => {
          setBars([3, 3, 3, 3, 3, 3, 3].map(() => Math.floor(Math.random() * 6) + 3));
          animRef.current = requestAnimationFrame(idle);
        };
        idle();
      }
    };

    start();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, [active]);

  return (
    <div className="flex items-end gap-[3px] h-6">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-[#00F2FE] transition-all duration-75 shadow-[0_0_8px_rgba(0,242,254,0.6)]"
          style={{ height: `${h}px`, opacity: active ? 1 : 0.3 }}
        />
      ))}
    </div>
  );
}

// ─── Webcam Feed ──────────────────────────────────────────────────────────────
function WebcamFeed({ userName }: { userName: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream;
    const startCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setHasCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setHasCamera(false);
      }
    };
    startCam();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#13131c] to-[#05050A] border border-[#00F2FE]/20 flex-1 w-full max-w-lg shadow-[0_0_30px_rgba(0,242,254,0.1)] group transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,242,254,0.2)] h-[260px] md:h-[360px] lg:h-[420px]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FE]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Live webcam */}
      {hasCamera !== false && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={cn(
            "object-cover w-full h-full transition-opacity duration-500 rounded-[2rem]",
            hasCamera ? "opacity-100" : "opacity-0"
          )}
          style={{ transform: "scaleX(-1)" }}
        />
      )}

      {/* Fallback */}
      {hasCamera === false && (
        <div className="flex flex-col items-center justify-center gap-4 h-full w-full">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#00F2FE]/10 flex items-center justify-center border border-[#00F2FE]/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-[#00F2FE]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs md:text-sm text-[#00F2FE]/60 font-light">Camera Access Required</p>
        </div>
      )}

      {hasCamera === null && (
        <div className="flex items-center justify-center h-full">
          <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full bg-[#00F2FE]/10 animate-pulse border border-[#00F2FE]/20" />
        </div>
      )}

      {/* Name Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#05050A] via-[#05050A]/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
          <h3 className="text-white text-sm font-semibold tracking-wide drop-shadow-md">{userName}</h3>
        </div>
      </div>
    </div>
  );
}

// ─── Main Agent ───────────────────────────────────────────────────────────────
const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/dashboard/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/dashboard");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/dashboard");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const isActive = callStatus === CallStatus.ACTIVE;

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto gap-8 pt-4 pb-12 selection:bg-[#00F2FE]/30">
      
      {/* ── REC / Timer / Mic bar ── */}
      <div className={cn(
        "flex flex-wrap items-center justify-center gap-4 md:gap-12 px-6 py-3 md:px-8 md:py-4 rounded-full border bg-[#13131c]/80 backdrop-blur-md shadow-lg transition-all duration-500",
        isActive ? "border-[#00F2FE]/30 shadow-[0_0_30px_rgba(0,242,254,0.15)] opacity-100 translate-y-0" : "border-white/5 opacity-50 translate-y-4 pointer-events-none"
      )}>
        {/* REC */}
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={cn("absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75", isActive && "animate-ping")} />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <span className="text-xs font-black tracking-[0.2em] text-white/90">LIVE</span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Timer */}
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-[#00F2FE]/70" />
          <InterviewTimer running={isActive} />
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Mic visualizer */}
        <div className="flex items-center gap-3">
          <Mic className={cn("w-4 h-4", isActive ? "text-[#00F2FE]" : "text-white/30")} />
          <MicVisualizer active={isActive} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex justify-center mt-2 mb-4 relative z-10 px-4 md:px-0">
        {callStatus !== "ACTIVE" ? (
          <button 
            className="relative group flex items-center justify-center gap-3 bg-[#00F2FE] text-[#05050A] font-bold text-base md:text-lg px-8 py-4 md:px-12 md:py-5 rounded-full overflow-hidden transition-all shadow-[0_0_30px_rgba(0,242,254,0.3)] hover:shadow-[0_0_50px_rgba(0,242,254,0.5)] hover:scale-105"
            onClick={() => handleCall()}
          >
            <span className="relative z-10">
              {callStatus === "INACTIVE" || callStatus === "FINISHED" ? "Initialize Session" : "Connecting..."}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#4FACFE] to-[#00F2FE] opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {callStatus === "CONNECTING" && (
               <div className="absolute inset-0 bg-white/20 animate-pulse z-10" />
            )}
          </button>
        ) : (
          <button 
            className="relative group flex items-center justify-center gap-3 bg-red-500/10 border border-red-500 text-red-500 hover:text-white font-bold text-base md:text-lg px-8 py-4 md:px-12 md:py-5 rounded-full overflow-hidden transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:scale-105"
            onClick={() => handleDisconnect()}
          >
            <span className="relative z-10">Terminate Session</span>
            <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch justify-center w-full px-4 md:px-0">
        {/* AI Interviewer Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#13131c] to-[#05050A] border border-[#00F2FE]/20 flex-1 w-full max-w-lg shadow-[0_0_30px_rgba(0,242,254,0.1)] group transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,242,254,0.2)] h-[260px] md:h-[360px] lg:h-[420px] flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[url('/pattern.png')] bg-center opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FE]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="relative flex items-center justify-center">
              {/* Pulsing rings when speaking */}
              {isSpeaking && (
                <>
                  <div className="absolute inset-[-20px] rounded-full border border-[#00F2FE]/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute inset-[-40px] rounded-full border border-[#00F2FE]/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                </>
              )}
              
              <div className={cn(
                "w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-full bg-[#13131c] border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300 z-10",
                isSpeaking ? "border-[#00F2FE] shadow-[0_0_30px_rgba(0,242,254,0.4)]" : "border-white/10"
              )}>
                <div className="relative w-10 h-10 rounded-xl bg-[#00F2FE]/10 flex items-center justify-center border border-[#00F2FE]/30">
  <BrainCircuit className="text-[#00F2FE] w-6 h-6 drop-shadow-[0_0_12px_rgba(0,242,254,0.9)]" />
</div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white tracking-wide">AIQ Core Engine</h3>
              <p className={cn("text-sm mt-1 transition-colors duration-300", isSpeaking ? "text-[#00F2FE]" : "text-[#8b949e]")}>
                {isSpeaking ? "Analyzing & Responding..." : "Listening..."}
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <WebcamFeed userName={userName} />
      </div>

      {/* Transcript Box */}
      <div className="w-full max-w-4xl min-h-[80px] md:min-h-[100px] flex items-center justify-center relative z-10 px-4 md:px-0">
        {messages.length > 0 ? (
          <div className="w-full relative overflow-hidden rounded-2xl bg-[#13131c]/60 border border-[#00F2FE]/20 backdrop-blur-md p-4 md:p-6 shadow-[0_0_20px_rgba(0,242,254,0.05)] h-full flex items-center justify-center">
             <p
               key={lastMessage}
               className="text-base md:text-lg text-center text-white/90 font-light leading-relaxed animate-fadeIn line-clamp-2 md:line-clamp-3"
             >
               {lastMessage}
             </p>
          </div>
        ) : (
          <div className="w-full relative overflow-hidden rounded-2xl bg-[#13131c]/30 border border-white/5 border-dashed backdrop-blur-md p-4 md:p-6 h-full flex items-center justify-center">
             <p className="text-xs md:text-sm text-[#8b949e] font-light">Live transcript will appear here...</p>
          </div>
        )}
      </div>


    </div>
  );
};

export default Agent;