"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, Clock } from "lucide-react";
import * as faceapi from "face-api.js";

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
function WebcamFeed({
  userName,
  onFaceCountChange,
}: {
  userName: string;
  onFaceCountChange?: (count: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const detectionRef = useRef<NodeJS.Timeout | null>(null);

  // Kitni baar lagaataar face nahi dikh raha
  const absentFrames = useRef(0);
  // Kitni baar lagaataar face dikh raha hai (presence confirm karne ke liye)
  const presentFrames = useRef(0);
  // Kya person physically present hai (confirmed)
  const isPersonPresent = useRef(false);

  useEffect(() => {
    let stream: MediaStream;

    const startCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        setHasCamera(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

        detectionRef.current = setInterval(async () => {
          if (!videoRef.current) return;

          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
          );

          const count = detections.length;

          if (count >= 1) {
            // Face dikh raha hai
            absentFrames.current = 0;
            presentFrames.current += 1;

            // 3 consecutive frames (~6 sec) me face dikh raha hai
            // tabhi "present" confirm karo
            if (presentFrames.current >= 3) {
              isPersonPresent.current = true;
            }

            // Multiple faces ya single face
            onFaceCountChange?.(count);

          } else {
            // Face nahi dikh raha
            presentFrames.current = 0;
            absentFrames.current += 1;

            // Sirf tab "0" bhejo jab:
            // 1. Person pehle confirmed present tha
            // 2. 5 consecutive frames (~10 sec) se face nahi dikh raha
            if (isPersonPresent.current && absentFrames.current >= 5) {
              onFaceCountChange?.(0);
            } else {
              // Abhi confirm nahi — ignore karo
              onFaceCountChange?.(-1);
            }
          }
        }, 2000);
      } catch (e) {
        setHasCamera(false);
      }
    };

    startCam();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (detectionRef.current) clearInterval(detectionRef.current);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#13131c] to-[#05050A] border border-[#00F2FE]/20 flex-1 w-full max-w-lg shadow-[0_0_30px_rgba(0,242,254,0.1)] group transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,242,254,0.2)] h-[260px] md:h-[360px] lg:h-[420px]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FE]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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

      {hasCamera === false && (
        <div className="flex flex-col items-center justify-center gap-4 h-full w-full">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#00F2FE]/10 flex items-center justify-center border border-[#00F2FE]/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 md:h-10 md:w-10 text-[#00F2FE]/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-xs md:text-sm text-[#00F2FE]/60 font-light">
            Camera Access Required
          </p>
        </div>
      )}

      {hasCamera === null && (
        <div className="flex items-center justify-center h-full">
          <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full bg-[#00F2FE]/10 animate-pulse border border-[#00F2FE]/20" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#05050A] via-[#05050A]/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
          <h3 className="text-white text-sm font-semibold tracking-wide drop-shadow-md">
            {userName}
          </h3>
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

  // ── Face Detection State ──
  const [faceCount, setFaceCount] = useState(-1);
  const [redFlags, setRedFlags] = useState(0);
  const [terminatedByFlags, setTerminatedByFlags] = useState(false);
  const [missingCountdown, setMissingCountdown] = useState<number | null>(null);

  // ── Other Proctoring State ──
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenInitialized, setFullscreenInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const isActive = callStatus === CallStatus.ACTIVE;
  const hasAutoTerminated = useRef(false);
  const lastViolationRef = useRef(0);
  const fullscreenViolationRef = useRef(false);
  const missingFaceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Multiple Faces → Flag ──
  useEffect(() => {
    if (isActive && faceCount > 1) {
      setRedFlags((prev) => {
        const newCount = prev + 1;
        if (newCount >= 5 && !hasAutoTerminated.current) {
          hasAutoTerminated.current = true;
          setTerminatedByFlags(true);
          vapi.stop();
          setCallStatus(CallStatus.FINISHED);
        }
        return newCount;
      });
    }
  }, [faceCount, isActive]);

  // ── No Face → 20 sec countdown → Flag ──
  // faceCount = -1 → not confirmed yet → ignore
  // faceCount = 0  → confirmed physically absent → countdown start
  // faceCount >= 1 → face present → countdown cancel
  useEffect(() => {
    if (!isActive) return;
    if (faceCount === -1) return; // ignore: not loaded / not confirmed

    if (faceCount === 0) {
      // Timer pehle se chal raha hai toh dobara mat start karo
      if (missingFaceTimerRef.current) return;

      let seconds = 10;
      setMissingCountdown(seconds);

      missingFaceTimerRef.current = setInterval(() => {
        seconds -= 1;
        setMissingCountdown(seconds);

        if (seconds <= 0) {
          clearInterval(missingFaceTimerRef.current!);
          missingFaceTimerRef.current = null;
          setMissingCountdown(null);

          if (!hasAutoTerminated.current) {
            setRedFlags((prev) => {
              const newCount = prev + 1;
              if (newCount >= 5) {
                hasAutoTerminated.current = true;
                setTerminatedByFlags(true);
                vapi.stop();
                setCallStatus(CallStatus.FINISHED);
              }
              return newCount;
            });
          }
        }
      }, 1000);

    } else {
      // faceCount >= 1 → face wapas aaya → timer cancel, no flag
      if (missingFaceTimerRef.current) {
        clearInterval(missingFaceTimerRef.current);
        missingFaceTimerRef.current = null;
      }
      setMissingCountdown(null);
    }

    return () => {
      if (missingFaceTimerRef.current) {
        clearInterval(missingFaceTimerRef.current);
      }
    };
  }, [faceCount, isActive]);

  // ── Fullscreen Change Listener ──
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // ── Fullscreen Exit → Flag ──
  useEffect(() => {
    if (
      fullscreenInitialized &&
      isActive &&
      !isFullscreen &&
      !hasAutoTerminated.current &&
      !fullscreenViolationRef.current
    ) {
      fullscreenViolationRef.current = true;
      setRedFlags((prev) => {
        const newCount = prev + 1;
        if (newCount >= 5) {
          hasAutoTerminated.current = true;
          setTerminatedByFlags(true);
          vapi.stop();
          setCallStatus(CallStatus.FINISHED);
        }
        return newCount;
      });
    }
    if (isFullscreen) {
      fullscreenViolationRef.current = false;
    }
  }, [isFullscreen, isActive]);

  // ── Tab Switch → Flag ──
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (
        document.hidden &&
        isActive &&
        !hasAutoTerminated.current &&
        now - lastViolationRef.current > 2000
      ) {
        lastViolationRef.current = now;
        setTabSwitchCount((prev) => prev + 1);
        setRedFlags((prev) => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            hasAutoTerminated.current = true;
            setTerminatedByFlags(true);
            vapi.stop();
            setCallStatus(CallStatus.FINISHED);
          }
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);

  // ── Window Blur → Flag ──
  useEffect(() => {
    const handleBlur = () => {
      if (document.hidden) return;
      const now = Date.now();
      if (
        isActive &&
        !hasAutoTerminated.current &&
        now - lastViolationRef.current > 2000
      ) {
        lastViolationRef.current = now;
        setRedFlags((prev) => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            hasAutoTerminated.current = true;
            setTerminatedByFlags(true);
            vapi.stop();
            setCallStatus(CallStatus.FINISHED);
          }
          return newCount;
        });
      }
    };
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [isActive]);

  // ── Vapi Events ──
  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Error:", error);

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

  // ── Feedback Generation ──
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      const safeTranscript = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: safeTranscript,
        feedbackId,
        terminatedByFlags,
        redFlags,
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

  // ── Handlers ──
  const enterFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.log("Fullscreen denied");
      }
    }
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    await enterFullscreen();
    setFullscreenInitialized(true);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: { username: userName, userid: userId },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
      }
      await vapi.start(interviewer, {
        variableValues: { questions: formattedQuestions },
      });
    }
  };

  const handleDisconnect = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
     <>
    {/* ── Instructions Modal ── */}
    {showInstructionsModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
        <div className="relative w-full max-w-lg bg-gradient-to-b from-[#13131c] to-[#05050A] border border-[#00F2FE]/20 rounded-[2rem] p-8 shadow-[0_0_60px_rgba(0,242,254,0.15)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00F2FE]/60 to-transparent rounded-t-[2rem]" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Interview Guidelines</h2>
              <p className="text-xs text-[#8b949e]">Please read before starting</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 mb-8">
            {[
              { icon: "1", text: "Stay in fullscreen mode throughout the interview" },
              { icon: "2", text: "Only one person should be visible on camera at all times" },
              { icon: "3", text: "Keep your face clearly visible in the camera" },
              { icon: "4", text: "Do not switch tabs or minimize the browser" },
              { icon: "5", text: "5 violations will automatically terminate the session" },
              { icon: "6", text: "Speak clearly — your voice is being recorded and analyzed" },
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <span className="text-lg shrink-0">{rule.icon}</span>
                <p className="text-sm text-white/70">{rule.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="flex-1 py-3 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowInstructionsModal(false);
                handleCall();
              }}
              className="flex-1 py-3 rounded-full bg-[#00F2FE] text-[#05050A] font-bold text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)]"
            >
              I Understand — Start Session
            </button>
          </div>
        </div>
      </div>
    )}
    
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto gap-8 pt-4 pb-12 selection:bg-[#00F2FE]/30">

      {/* ── REC / Timer / Mic / Flags bar ── */}
      <div className={cn(
        "flex flex-wrap items-center justify-center gap-4 md:gap-12 px-6 py-3 md:px-8 md:py-4 rounded-full border bg-[#13131c]/80 backdrop-blur-md shadow-lg transition-all duration-500",
        isActive
          ? "border-[#00F2FE]/30 shadow-[0_0_30px_rgba(0,242,254,0.15)] opacity-100 translate-y-0"
          : "border-white/5 opacity-50 translate-y-4 pointer-events-none"
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

        {/* Mic */}
        <div className="flex items-center gap-3">
          <Mic className={cn("w-4 h-4", isActive ? "text-[#00F2FE]" : "text-white/30")} />
          <MicVisualizer active={isActive} />
        </div>

        {/* Flags */}
        {isActive && (
          <>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-lg">🚩</span>
              <span className={cn(
                "text-xs font-bold tracking-widest",
                redFlags > 0 ? "text-red-500" : "text-white/50"
              )}>
                {redFlags}/5 FLAG{redFlags !== 1 ? "S" : ""}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Multiple Face Warning ── */}
      {isActive && faceCount > 1 && (
        <div className="w-full max-w-4xl px-4 md:px-0">
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 rounded-2xl px-5 py-3 animate-pulse">
            <span className="text-red-500 text-xl">⚠️</span>
            <p className="text-red-400 text-sm font-semibold">
              Multiple faces detected! Only one person is allowed during the interview.
            </p>
            <span className="text-red-500 text-xl">🚩</span>
          </div>
        </div>
      )}

      {/* ── Face Missing Countdown Warning ── */}
      {isActive && missingCountdown !== null && (
        <div className="w-full max-w-4xl px-4 md:px-0">
          <div className="flex items-center justify-between gap-3 bg-yellow-500/10 border border-yellow-500/50 rounded-2xl px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <p className="text-yellow-300 text-sm font-semibold">
                Face not visible! Please return to camera.
              </p>
            </div>
            <span className={cn(
              "font-mono font-black text-xl",
              missingCountdown <= 5 ? "text-red-500 animate-pulse" : "text-yellow-400"
            )}>
              {missingCountdown}s
            </span>
          </div>
        </div>
      )}

      {/* ── Fullscreen Warning ── */}
      {isActive && !isFullscreen && (
        <div className="w-full max-w-4xl px-4 md:px-0">
          <div className="flex items-center justify-between gap-3 bg-orange-500/10 border border-orange-500/50 rounded-2xl px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="text-orange-400 text-xl">🖥️</span>
              <p className="text-orange-300 text-sm font-semibold">
                Fullscreen mode is required during the interview.
              </p>
            </div>
            <button
              onClick={enterFullscreen}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
            >
              Go Fullscreen Again
            </button>
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="w-full flex justify-center mt-2 mb-4 relative z-10 px-4 md:px-0">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative group flex items-center justify-center gap-3 bg-[#00F2FE] text-[#05050A] font-bold text-base md:text-lg px-8 py-4 md:px-12 md:py-5 rounded-full overflow-hidden transition-all shadow-[0_0_30px_rgba(0,242,254,0.3)] hover:shadow-[0_0_50px_rgba(0,242,254,0.5)] hover:scale-105"
            onClick={() => setShowInstructionsModal(true)}

          >
            <span className="relative z-10">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Initialize Session"
                : "Connecting..."}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#4FACFE] to-[#00F2FE] opacity-0 group-hover:opacity-100 transition-opacity" />
            {callStatus === "CONNECTING" && (
              <div className="absolute inset-0 bg-white/20 animate-pulse z-10" />
            )}
          </button>
        ) : (
          <button
            className="relative group flex items-center justify-center gap-3 bg-red-500/10 border border-red-500 text-red-500 hover:text-white font-bold text-base md:text-lg px-8 py-4 md:px-12 md:py-5 rounded-full overflow-hidden transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:scale-105"
            onClick={handleDisconnect}
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
              {isSpeaking && (
                <>
                  <div className="absolute inset-[-20px] rounded-full border border-[#00F2FE]/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute inset-[-40px] rounded-full border border-[#00F2FE]/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                </>
              )}
              <div className={cn(
                "w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-full bg-[#13131c] border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300 z-10",
                isSpeaking
                  ? "border-[#00F2FE] shadow-[0_0_30px_rgba(0,242,254,0.4)]"
                  : "border-white/10"
              )}>
                <div className="relative w-10 h-10 rounded-xl bg-[#00F2FE]/10 flex items-center justify-center border border-[#00F2FE]/30">
                  <BrainCircuit className="text-[#00F2FE] w-6 h-6 drop-shadow-[0_0_12px_rgba(0,242,254,0.9)]" />
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white tracking-wide">AIQ Core Engine</h3>
              <p className={cn("text-sm mt-1 transition-colors duration-300",
                isSpeaking ? "text-[#00F2FE]" : "text-[#8b949e]"
              )}>
                {isSpeaking ? "Analyzing & Responding..." : "Listening..."}
              </p>
            </div>
          </div>
        </div>

        {/* User Webcam */}
        <WebcamFeed userName={userName} onFaceCountChange={setFaceCount} />
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
            <p className="text-xs md:text-sm text-[#8b949e] font-light">
              Live transcript will appear here...
            </p>
          </div>
        )}
      </div>
    </div>
    </>    
  );
};

export default Agent;