"use server";

import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";



export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId, terminatedByFlags, redFlags } = params;

  try {
     if (terminatedByFlags) {
      const feedback = {
        interviewId,
        userId,

        totalScore: 0,

        categoryScores: [
          {
            name: "Communication Skills",
            score: 0,
            comment: "Interview terminated due to multiple face detection violations.",
          },
          {
            name: "Technical Knowledge",
            score: 0,
            comment: "Interview terminated before evaluation.",
          },
          {
            name: "Problem-Solving",
            score: 0,
            comment: "Interview terminated before evaluation.",
          },
          {
            name: "Cultural & Role Fit",
            score: 0,
            comment: "Interview terminated before evaluation.",
          },
          {
            name: "Confidence & Clarity",
            score: 0,
            comment: "Interview terminated before evaluation.",
          },
        ],

        strengths: [],

        areasForImprovement: [
          "Follow interview guidelines",
          "Ensure only one person is visible during the interview",
        ],

        finalAssessment:
          "Interview was automatically terminated after multiple face detection violations.",

        createdAt: new Date().toISOString(),
        terminatedByFlags: true,
        redFlags: redFlags || 0,
      };

      let feedbackRef;

      if (feedbackId) {
        feedbackRef = db.collection("feedback").doc(feedbackId);
      } else {
        feedbackRef = db.collection("feedback").doc();
      }

      await feedbackRef.set(feedback);

      return {
        success: true,
        feedbackId: feedbackRef.id,
      };
    }
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.

        Return ONLY a valid JSON object with no extra text, no markdown, no backticks. Example format:
        {
          "totalScore": 80,
          "categoryScores": [
            {"name": "Communication Skills", "score": 80, "comment": "..."},
            {"name": "Technical Knowledge", "score": 80, "comment": "..."},
            {"name": "Problem-Solving", "score": 80, "comment": "..."},
            {"name": "Cultural & Role Fit", "score": 80, "comment": "..."},
            {"name": "Confidence & Clarity", "score": 80, "comment": "..."}
          ],
          "strengths": ["..."],
          "areasForImprovement": ["..."],
          "finalAssessment": "..."
        }
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Return only valid JSON, no extra text.",
    });

    const cleanText = text.replace(/```json|```/g, "").trim();
    console.log("GROQ RESPONSE:");
    console.log(cleanText);
   let object;

try {
  object = JSON.parse(cleanText);
} catch (error) {
  console.error("Invalid JSON returned by Groq");
  console.error(cleanText);

  return { success: false };
}

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
      terminatedByFlags: terminatedByFlags,
      redFlags: redFlags || 0,
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}


export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

// ── NEW: User ka poora feedback history fetch karo (progress tracking ke liye) ──
export async function getUserFeedbackHistory(
  userId: string
): Promise<Feedback[] | null> {
  if (!userId) return [];

  const snapshot = await db
    .collection("feedback")
    .where("userId", "==", userId)
    .orderBy("createdAt", "asc") // asc → chart mein left se right progress dikhega
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];
}