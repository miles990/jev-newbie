// Offline transport fixture: loaded only by child processes in the test suite.
let active = 0;
globalThis.fetch = async (url, options = {}) => {
  if (process.env.TEST_MODE === 'timeout') return new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error('mock deadline failed')), 1000);
    options.signal.addEventListener('abort', () => { clearTimeout(timer); reject(options.signal.reason); });
  });
  if (process.env.TEST_MODE === 'unauthorized') return new Response('{}', { status: 401 });
  if (String(url).endsWith('/models')) return Response.json({ models: [] });
  if (++active > Number(process.env.TEST_MAX_ACTIVE || 100)) throw new Error('too many simultaneous requests');
  await new Promise(resolve => setTimeout(resolve, 5));
  active--;
  const body = JSON.parse(options.body);
  const answers = {};
  for (const [key, q] of Object.entries(body.questions)) {
    if (process.env.TEST_MODE === 'missing') continue;
    if (q.type === 'noul') answers[key] = { type: 'noul', noul: JSON.stringify(body.state).includes('drop') ? 0.1 : 0.9 };
    else {
      const keys = q.type === 'choice' ? Object.keys(q.criteria) : q.criteria.map((_, i) => String(i));
      answers[key] = { type: q.type, [q.type]: q.type === 'choice' ? keys[0] : 0, confidence: process.env.TEST_MODE === 'low-confidence' ? 0.2 : 0.9, probabilities: Object.fromEntries(keys.map((k, i) => [k, i === 0 ? 1 : 0])) };
    }
  }
  if (process.env.TEST_MODE === 'bad-probability') Object.values(answers)[0].noul = 5;
  return Response.json({ model: 'mock-model', answers, usage: { input_tokens: 12 } });
};
