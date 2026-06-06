import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
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
- Recruiter wrote: ${data.requirements}`;

    const { experimental_output } = await generateText({
      model: gateway(),
      prompt,
      experimental_output: Output.object({
        schema: z.object({
          hi: z.string(),
          en: z.string(),
          ta: z.string(),
        }),
      }),
    });
    return experimental_output;
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

    const { text } = await generateText({ model: gateway(), prompt });
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

Job: ${JSON.stringify(data)}`;
    const { experimental_output } = await generateText({
      model: gateway(),
      prompt,
      experimental_output: Output.object({
        schema: z.object({
          highlights: z.array(z.string()),
          bestFor: z.array(z.string()),
          thingsToKnow: z.array(z.string()),
          benefits: z.array(z.string()),
        }),
      }),
    });
    return experimental_output;
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
Job: ${JSON.stringify({ cat: data.jobCategory, exp: data.jobExperience, area: data.jobArea, dist: data.jobDistanceKm, salary: data.jobSalary })}`;
    const { experimental_output } = await generateText({
      model: gateway(),
      prompt,
      experimental_output: Output.object({
        schema: z.object({
          score: z.number(),
          reasons: z.array(z.string()),
          gaps: z.array(z.string()),
        }),
      }),
    });
    return experimental_output;
  });
