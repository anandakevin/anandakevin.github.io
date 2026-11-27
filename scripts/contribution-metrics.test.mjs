import assert from 'node:assert/strict';
import test from 'node:test';
import { formatContributionMetric } from '../src/lib/contribution-metrics.ts';

test('omits absent and unknown contribution metrics', () => {
  assert.equal(formatContributionMetric(null), null);
  assert.equal(formatContributionMetric(undefined), null);
  assert.equal(formatContributionMetric('unknown'), null);
  assert.equal(formatContributionMetric('TBD'), null);
});

test('formats numeric durations with the correct unit', () => {
  assert.deepEqual(formatContributionMetric(1, { duration: true }), {
    value: '1 hour',
    estimated: false,
  });
  assert.deepEqual(formatContributionMetric(2, { duration: true }), {
    value: '2 hours',
    estimated: false,
  });
  assert.deepEqual(formatContributionMetric(5), { value: '5', estimated: false });
});

test('formats estimated sub-hour ranges as minutes', () => {
  assert.deepEqual(
    formatContributionMetric({ min: 0.5, max: 1, estimated: true }, { duration: true }),
    {
      value: '30–60 min',
      estimated: true,
    },
  );
});
