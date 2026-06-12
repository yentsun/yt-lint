// ─── no-nodejs-builtins-in-webapp ─────────────────────────────────────────────
// Files matching browserCodeGlobs may not import Node.js built-ins.
//   import { readFile } from 'node:fs';  ← flagged inside webapp code

// ─── import-general-to-specific ───────────────────────────────────────────────
// Order: third-party → internal aliases → relative
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import { formatDate } from 'acme/utils';

import AssigneeAvatar from './AssigneeAvatar.jsx';


// ─── two-blank-lines-after-imports ────────────────────────────────────────────

// ─── require-jsdoc ────────────────────────────────────────────────────────────
/**
 * Card displaying a job summary with expandable details and status toggle.
 *
 * @param {object} props
 * @param {object} props.job - Job record
 * @param {Function} props.onStatusChange - Called with the new status string
 */
export default function JobCard({ job, onStatusChange }) {

    // ─── blank-line-after-unpacking ───────────────────────────────────────────
    // Free extractions first — values already in scope, no calls needed.
    const [ expanded, setExpanded ] = useState(false);

    // object-curly-spacing: `{ id, title, status, assignee, scheduledAt }` — spaced.
    const { id, title, status, assignee, scheduledAt } = job;

    // sync-call tier: synchronous function calls separated by a blank line.
    const formattedDate = formatDate(scheduledAt);

    return (
        <div className="rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{title}</h3>
                <StatusBadge status={status} onChange={onStatusChange} />
            </div>

            {expanded && (
                <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <UserIcon className="h-4 w-4" />
                        <AssigneeAvatar assignee={assignee} />
                    </div>
                </div>
            )}

            <button
                className="mt-2 text-xs text-blue-600 hover:underline"
                onClick={() => setExpanded(! expanded)}
            >
                {expanded ? 'Show less' : 'Show more'}
            </button>
        </div>
    );
}

// ─── require-jsdoc ────────────────────────────────────────────────────────────
// Object methods and class methods also require JSDoc.
/**
 * Badge showing the current job status; clicking it cycles to the next status.
 *
 * @param {object} props
 * @param {string} props.status - Current status string
 * @param {Function} props.onChange - Called with the next status on click
 */
function StatusBadge({ status, onChange }) {

    // ─── no-blank-lines-between-declarations ──────────────────────────────────
    // Consecutive variable declarations must not have blank lines between them.
    const COLORS = { open: 'bg-green-100 text-green-800', 'in-progress': 'bg-yellow-100 text-yellow-800' };
    const nextStatus = status === 'open' ? 'in-progress' : 'open';
    const colorClass = COLORS[status] ?? 'bg-gray-100 text-gray-700';

    return (
        <button
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
            onClick={() => onChange(nextStatus)}
        >
            {status}
        </button>
    );
}
