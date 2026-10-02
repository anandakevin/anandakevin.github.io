#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse, stringify } from 'yaml';

const recordPath = resolve('src/content/public/contributions/global-one-on-one-mentoring.md');
const sessionsUrl = 'https://api2.adplist.org/core/user-community-statistics/?identity_id=995999';
const ratingsUrl =
  'https://api.adplist.org/users/statistics?userId=1e56107a83615364eee80c21ad671027&type=mentor';

function splitFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter: ${recordPath}`);
  return { meta: parse(match[1]) ?? {}, body: match[2] };
}

const [sessionsResponse, ratingsResponse] = await Promise.all([
  fetch(sessionsUrl),
  fetch(ratingsUrl),
]);
if (!sessionsResponse.ok || !ratingsResponse.ok)
  throw new Error('ADPList statistics refresh failed.');
const sessionsPayload = await sessionsResponse.json();
const ratingsPayload = await ratingsResponse.json();
const ratings = ratingsPayload.data?.reviews;
const values = ratings?.averageRatings ? Object.values(ratings.averageRatings) : [];
if (
  !Number.isInteger(sessionsPayload.sessions_completed) ||
  !values.length ||
  values.some((value) => typeof value !== 'number')
) {
  throw new Error('ADPList response did not contain valid public statistics.');
}

const { meta, body } = splitFrontmatter(readFileSync(recordPath, 'utf8'));
const averageRating = Number(
  (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2),
);
meta.public_metrics = {
  ...meta.public_metrics,
  mentoring_sessions: sessionsPayload.sessions_completed,
  mentor_rating_values: [averageRating],
};
meta.last_verified = new Date().toISOString().slice(0, 10);
writeFileSync(recordPath, `---\n${stringify(meta)}---\n${body.replace(/^\n+/, '')}`);
console.log(
  `ADPList public snapshot refreshed: ${sessionsPayload.sessions_completed} sessions, ${averageRating}/5.`,
);
