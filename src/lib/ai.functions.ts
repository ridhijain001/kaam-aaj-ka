import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function callGemini(prompt: string, json: boolean = false) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: json ? { responseMimeType: "application/json" } : undefined,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  if (json) {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", text);
      throw e;
    }
  }

  return text;
}

// ─── 1. AI JOB SIMPLIFICATION ─────────────────────────────────────────────────
const SimplifyInput = z.object({
  role: z.string(),
  salaryMin: z.number(),
  salaryMax: z.number(),
  salaryType: z.string(),
  experience: z.string(),
  shift: z.string(),
  area: z.string(),
  requirements: z.string(),
});

export const simplifyJob = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SimplifyInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `You are KaamSetu, an accessibility AI helping India's informal workers understand jobs.

A recruiter wrote a job. Convert it into THREE versions of a simple, warm, worker-friendly post in Hindi, English, and Tamil. Do NOT translate word-for-word — SIMPLIFY HR language into how a friend would explain the job to a worker who may have low literacy.

RULES:
- Short lines, bullet-like format with emojis 📍 💰 🕒 👤 + role-specific icon.
- Avoid words like "personnel", "rotational", "premises", "surveillance".
- Say what the worker will DO every day in plain words.
- End with a single friendly call-to-action sentence.
- Each version ~6-9 short lines. Use \\n for line breaks.

Job details:
- Role: ${data.role}
- Salary: ₹${data.salaryMin}-${data.salaryMax} (${data.salaryType})
- Experience: ${data.experience}
- Shift: ${data.shift}
- Place: ${data.area}
- Recruiter wrote: ${data.requirements}

You must return a JSON object with this exact structure:
{
  "hi": "Hindi version text",
  "en": "English version text",
  "ta": "Tamil version text"
}`;

    return callGemini(prompt, true);
  });

// ─── 2. EXPLAIN THIS JOB ──────────────────────────────────────────────────────
const ExplainInput = z.object({
  jobTitle: z.string(),
  role: z.string(),
  salary: z.string(),
  experience: z.string(),
  shift: z.string(),
  area: z.string(),
  requirements: z.string(),
  lang: z.enum(["hi", "en", "ta"]),
});

export const explainJob = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ExplainInput.parse(d))
  .handler(async ({ data }) => {
    const langName = { hi: "Hindi (Devanagari)", en: "Simple English", ta: "Tamil" }[data.lang];
    const prompt = `You are KaamSetu's worker companion. A worker is asking "Mujhe karna kya hoga?" about this job.

Answer in ${langName}. Be warm, short, conversational — like an older brother explaining the job.

Structure (use these exact section headers in the target language):
1. एक लाइन में काम / What is the work / வேலை சுருக்கம்
2. आपका काम होगा / Daily duties / தினசரி பணி — 3-4 bullets
3. यह नौकरी आपके लिए अच्छी है अगर / This job suits you if / உங்களுக்கு பொருந்தும் — 2-3 bullets
4. ध्यान दें / Things to watch out for / கவனிக்க — 1-2 short points
5. End with one encouraging sentence.

Use simple words. Avoid HR jargon. Output plain text with \\n line breaks, no markdown headers.

Job:
- Title: ${data.jobTitle}
- Role: ${data.role}
- Salary: ${data.salary}
- Experience: ${data.experience}
- Shift: ${data.shift}
- Area: ${data.area}
- Notes: ${data.requirements}`;

    const text = await callGemini(prompt, false);
    return { text };
  });

// ─── 3. SMART SUMMARY ─────────────────────────────────────────────────────────
const SummaryInput = z.object({
  role: z.string(),
  salaryMin: z.number(),
  salaryMax: z.number(),
  salaryType: z.string(),
  experience: z.string(),
  shift: z.string(),
  area: z.string(),
  distanceKm: z.number(),
  requirements: z.string(),
});

export const smartSummary = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SummaryInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Extract a Smart Summary for this informal-sector job. Return JSON with these arrays of short English phrases (3-5 each, under 6 words each):
- highlights: key facts at a glance (salary, distance, shift, verification)
- bestFor: types of workers best suited
- thingsToKnow: honest cautions / requirements
- benefits: why this job might be good

Job: ${JSON.stringify(data)}

You must return a JSON object with this exact structure:
{
  "highlights": ["highlight 1", "highlight 2", ...],
  "bestFor": ["best for 1", "best for 2", ...],
  "thingsToKnow": ["thing 1", "thing 2", ...],
  "benefits": ["benefit 1", "benefit 2", ...]
}`;

    return callGemini(prompt, true);
  });

// ─── 4. MATCH SCORE ───────────────────────────────────────────────────────────
const MatchInput = z.object({
  workerCategory: z.string(),
  workerExperience: z.string(),
  workerArea: z.string(),
  workerLangs: z.array(z.string()),
  jobCategory: z.string(),
  jobExperience: z.string(),
  jobArea: z.string(),
  jobDistanceKm: z.number(),
  jobSalary: z.string(),
});

export const matchScore = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MatchInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Score how well a worker matches this job from 0-100. Return JSON: { score: number, reasons: string[] (3 short positive bullets), gaps: string[] (0-2 short caveats) }.

Worker: ${JSON.stringify({ cat: data.workerCategory, exp: data.workerExperience, area: data.workerArea, langs: data.workerLangs })}
Job: ${JSON.stringify({ cat: data.jobCategory, exp: data.jobExperience, area: data.jobArea, dist: data.jobDistanceKm, salary: data.jobSalary })}

You must return a JSON object with this exact structure:
{
  "score": 85,
  "reasons": ["reason 1", "reason 2", ...],
  "gaps": ["gap 1", "gap 2", ...]
}`;
    return callGemini(prompt, true);
  });

