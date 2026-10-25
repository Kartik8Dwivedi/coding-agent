import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { expandPath, isExistingDirectory } from '../util/pathUtils.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3001'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  AGENT_NAME: z.string().default(`Kartik's Coding Agent`),
  MAX_MODEL_CALLS_PER_RUN: z.coerce.number().default(10),
  MAX_READ_BYTES: z.coerce.number().default(1000000), // 1MB
  HITL_ENABLED: z.stringbool().default(false),
  WORKING_DIRECTORY: z
    .string()
    .default(path.join(process.cwd(), 'workspace'))
    .transform(expandPath)
    .refine(
      isExistingDirectory,
      'WORKING_DIRECTORY must be an existing directory',
    ),
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const issues = parsed.error.issues.map(
        (issue) => ` - ${issue.path.join('.')}: ${issue.message}`,
    );

    console.log(`[ERROR] Invalid Environment Configuration: \n ${issues}`);
    process.exit(1);
}

const env = parsed.data;

const AppConfig = Object.freeze({
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    MONGO_URI: env.MONGO_URI,
    PROJECT_ROOT: process.cwd(),
    PROMPTS_DIRECTORY: path.join(process.cwd(), 'prompts'),
    WORKSPACE_DIRECTORY: path.join(process.cwd(), 'workspace'),
    AGENT_NAME: env.AGENT_NAME,
    MAX_MODEL_CALLS_PER_RUN: env.MAX_MODEL_CALLS_PER_RUN,
    MAX_READ_BYTES: env.MAX_READ_BYTES,
    HITL_ENABLED: env.HITL_ENABLED,
    WORKING_DIRECTORY: env.WORKING_DIRECTORY,
    OPENAI_API_KEY: env.OPENAI_API_KEY,
    GROQ_API_KEY: env.GROQ_API_KEY,
    GEMINI_API_KEY: env.GEMINI_API_KEY,
});

export type AppConfigType = typeof AppConfig;
export default AppConfig;
