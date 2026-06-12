// eslint.config.js excerpt that activates this ruleset:
//
//   import ytLint from '@yentsun/lint';
//   export default [
//     {
//       ...ytLint.configs.recommended,
//       rules: {
//         ...ytLint.configs.recommended.rules,
//         '@yentsun/lint/import-general-to-specific': ['warn', { internalAliases: ['acme'] }],
//         '@yentsun/lint/no-process-exit-outside-cli': ['warn', { allowedProcessExitGlobs: ['packages/cli/**'] }],
//       },
//     },
//   ];

// ─── import-general-to-specific ───────────────────────────────────────────────
// Order: node built-ins → third-party → internal aliases → relative
import { randomUUID } from 'node:crypto';

import Stripe from 'stripe';

import { Job, Member } from 'acme/models';
import { roles } from 'acme/constants';

import { formatDate } from '../utils/date.js';


// ─── two-blank-lines-after-imports ────────────────────────────────────────────
// Exactly two blank lines separate the import block from the first statement.

// ─── require-jsdoc ────────────────────────────────────────────────────────────
// Named / exported functions need a JSDoc block with @param per parameter
// and @returns when the function has a return value.
/**
 * Assign a job to a crew member, charge the deposit, and notify the assignee.
 *
 * @param {Job} job - Job to assign
 * @param {Member} member - Crew member receiving the assignment
 * @param {object} [options] - Optional overrides
 * @param {string} [options.note] - Internal note attached to the assignment
 *
 * @returns {Promise<Job>} Updated job after assignment
 */
export default async function assignJob(job, member, options = {}) {

    // ─── blank-line-after-unpacking ───────────────────────────────────────────
    // Free extractions (values already in scope) come first with no blank line
    // between them. A blank line separates each preparation step tier.
    const [ app, logger ] = this;
    const { chargeDeposit, notifyMember, updateJob } = app.ops;

    // object-curly-spacing: spaces inside `{ }` — `{ note }` not `{note}`.
    const { note = '' } = options;

    // sync-call tier: synchronous calls (no await).
    const assignmentId = randomUUID();

    // async-call tier: awaited calls get their own blank-line-separated block.
    const existing = await app.getJob(job.id);
    const charge = await chargeDeposit(existing, member);

    // ─── blank-line-after-if ──────────────────────────────────────────────────
    // A blank line is required after an if statement before the next statement.
    if (! existing.isAvailable)
        throw new Error('Job is not available for assignment.');

    await updateJob(existing.id, {
        assignedTo: member.id,
        assignmentId,
        assignedAt: formatDate(new Date()),
        depositChargeId: charge.id,
        role: roles.agent,
        note,
    });

    await notifyMember(member, existing);

    logger.debug(`assignJob: ${existing.id} → ${member.id} note=${note}`);

    return app.getJob(job.id);
}

// ─── no-process-exit-outside-cli ──────────────────────────────────────────────
// process.exit() is flagged here; it is only allowed inside allowedProcessExitGlobs.
//   process.exit(1);  ← would be reported

// ─── no-unused ────────────────────────────────────────────────────────────────
// Unused imports, destructured bindings, and caught errors are flagged + autofixed.
//   import { something } from 'acme/utils';   ← unused import, autofixed away
//   const { id, unused } = job;               ← `unused` autofixed away
//   try { ... } catch (err) { ... }           ← unused `err` → `catch { ... }`

// ─── no-renamed-unused-destructure ────────────────────────────────────────────
// Renaming a destructured key to `_x` to silence "unused" is disallowed;
// omit the key from the pattern entirely instead.
//   const { id: _id, name } = job;  ← flagged; write `const { name } = job;`

// ─── no-relative-cross-package-imports ────────────────────────────────────────
// Relative imports must not climb into a different package.
//   import { x } from '../../webapp/src/utils.js';  ← flagged; use 'acme/utils'
