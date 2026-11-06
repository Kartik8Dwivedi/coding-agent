import { humanInTheLoopMiddleware } from 'langchain';
import AppConfig from '../config/AppConfig.js';

// Empty when HITL_ENABLED is false, so the agent runs every tool without asking
export function getHitlMiddlewares() {
  return AppConfig.HITL_ENABLED ? [buildHitlMiddleware()] : [];
}

export function buildHitlMiddleware() {
  return humanInTheLoopMiddleware({
    interruptOn: {
      read_file: false, // no hitl for read_file tool
      list_files: false, // no hitl for list_files tool
      list_jobs: false, // no hitl for list_jobs tool
      stop_job: false, // no hitl for stop_job tool
      run_command: {
        allowedDecisions: ['approve', 'edit', 'reject'],
        description:
          'Run a bash command in the current working directory (host machine not a sandbox)',
      },
      write_file: {
        allowedDecisions: ['approve', 'edit', 'reject'],
        description: 'Write or overwrite a file on disk',
      },
      edit_file: {
        allowedDecisions: ['approve', 'edit', 'reject'],
        description: 'Edit an existing file on the disk',
      },
    },
    descriptionPrefix: 'Coding agent needs your approval to move ahead',
  });
}
