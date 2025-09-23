// Provider integration test: Replicate, OpenRouter, then Hugging Face LLaMA backups
require('dotenv').config({ path: '.env.local' });
const { HfInference } = require('@huggingface/inference');
const Replicate = require('replicate');

async function testReplicate() {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.log('Replicate: SKIPPED (no REPLICATE_API_TOKEN)');
    return;
  }
  const model = process.env.REPLICATE_MODEL || 'meta/llama-2-70b-chat';
  console.log(`Replicate: Testing model ${model}`);
  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const output = await replicate.run(model, {
      input: {
        prompt: 'Human: Say hello in exactly 3 words.\n\nAssistant:',
        max_tokens: 10,
        temperature: 0.3,
      }
    });
    const content = Array.isArray(output) ? output.join('') : output;
    console.log('Replicate: OK →', content?.toString().trim());
  } catch (e) {
    console.log('Replicate: ERROR →', e.message);
  }
}

async function testOpenRouter() {
  if (!process.env.OPENROUTER_TOKEN) {
    console.log('OpenRouter: SKIPPED (no OPENROUTER_TOKEN)');
    return;
  }
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  console.log(`OpenRouter: Testing model ${model}`);
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "hi" in 3 words.' }
        ],
        max_tokens: 20,
        temperature: 0.3,
      })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${JSON.stringify(json).slice(0,200)}`);
    console.log('OpenRouter: OK →', json?.choices?.[0]?.message?.content);
  } catch (e) {
    console.log('OpenRouter: ERROR →', e.message);
  }
}

async function testHuggingFace() {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    console.log('HuggingFace: SKIPPED (no HF_TOKEN/HUGGINGFACE_TOKEN)');
    return;
  }
  const provider = process.env.HF_PROVIDER; // e.g. sambanova
  const hf = new HfInference(token);
  const models = [
    'meta-llama/Llama-3.1-8B-Instruct',
    'meta-llama/Llama-3.2-1B-Instruct'
  ];
  for (const model of models) {
    console.log(`HF: Testing ${model}${provider ? ' via '+provider : ''}`);
    try {
      const resp = await hf.chatCompletion({
        model,
        provider,
        messages: [
          { role: 'user', content: 'Reply with exactly: hello there' }
        ],
        max_tokens: 10,
        temperature: 0.2,
      });
      console.log('HF: OK →', resp?.choices?.[0]?.message?.content);
    } catch (e) {
      console.log('HF: ERROR →', e.message);
    }
  }
}

(async () => {
  console.log('Env present:', {
    REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
    OPENROUTER_TOKEN: !!process.env.OPENROUTER_TOKEN,
    HF_TOKEN: !!process.env.HF_TOKEN,
    HUGGINGFACE_TOKEN: !!process.env.HUGGINGFACE_TOKEN,
    HF_PROVIDER: process.env.HF_PROVIDER || null,
  });
  await testReplicate();
  await testOpenRouter();
  await testHuggingFace();
})();
