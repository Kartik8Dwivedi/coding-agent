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
  MAX_MODEL_CALLS_PER_RUN: z.number().default(10),
  MAX_READ_BYTES: z.number().default(1000000), // 1MB
  HITL_ENABLED: z.stringbool().default(false),
  WORKING_DIRECTORY: z.string()
                        .default(`${process.cwd()}/workspace`)
                        .transform(expandPath)
                        .refine(isExistingDirectory, 'WORKING_DIRECTORY must be an existing directory'),
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
  PROMPTS_DIRECTORY: `${process.cwd()}/prompts`,
  WORKSPACE_DIRECTORY: `${process.cwd()}/workspace`,
  AGENT_NAME: env.AGENT_NAME,
  MAX_MODEL_CALLS_PER_RUN: env.MAX_MODEL_CALLS_PER_RUN,
  MAX_READ_BYTES: env.MAX_READ_BYTES,
  HITL_ENABLED: env.HITL_ENABLED,
  WORKING_DIRECTORY: env.WORKING_DIRECTORY,
});

export type AppConfigType = typeof AppConfig;
export default AppConfig;
