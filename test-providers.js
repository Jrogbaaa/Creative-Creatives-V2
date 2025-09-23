#!/usr/bin/env node
// AI Provider Integration Test - Test all configured AI providers
require('dotenv').config({ path: '.env.local' });

const Replicate = require('replicate');
const { HfInference } = require('@huggingface/inference');

async function testReplicate() {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.log('Replicate: SKIPPED (no REPLICATE_API_TOKEN)');
    return false;
  }
  
  const model = process.env.REPLICATE_MODEL || 'meta/meta-llama-3-8b-instruct';
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
    console.log('Replicate: ✅ SUCCESS →', content?.toString().trim());
    return true;
  } catch (e) {
    console.log('Replicate: ❌ ERROR →', e.message);
    return false;
  }
}

async function testOpenRouter() {
  if (!process.env.OPENROUTER_TOKEN) {
    console.log('OpenRouter: SKIPPED (no OPENROUTER_TOKEN)');
    return false;
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
    
    console.log('OpenRouter: ✅ SUCCESS →', json?.choices?.[0]?.message?.content);
    return true;
  } catch (e) {
    console.log('OpenRouter: ❌ ERROR →', e.message);
    return false;
  }
}

async function testHuggingFace() {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    console.log('HuggingFace: SKIPPED (no HF_TOKEN/HUGGINGFACE_TOKEN)');
    return false;
  }
  
  const provider = process.env.HF_PROVIDER;
  const hf = new HfInference(token);
  const model = 'meta-llama/Llama-3.1-8B-Instruct';
  
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
    
    console.log('HF: ✅ SUCCESS →', resp?.choices?.[0]?.message?.content);
    return true;
  } catch (e) {
    console.log('HF: ❌ ERROR →', e.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Creative Creatives V2 - AI Provider Test');
  console.log('━'.repeat(50));
  console.log('Env configured:', {
    REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
    OPENROUTER_TOKEN: !!process.env.OPENROUTER_TOKEN,
    HF_TOKEN: !!process.env.HF_TOKEN,
    HUGGINGFACE_TOKEN: !!process.env.HUGGINGFACE_TOKEN,
    HF_PROVIDER: process.env.HF_PROVIDER || 'none',
  });
  console.log();

  const results = [];
  
  results.push(await testReplicate());
  results.push(await testOpenRouter());  
  results.push(await testHuggingFace());
  
  const workingCount = results.filter(Boolean).length;
  
  console.log();
  console.log('━'.repeat(50));
  console.log(`🎯 Result: ${workingCount}/3 providers working`);
  
  if (workingCount > 0) {
    console.log('✅ Marcus Creative Expert will work!');
    console.log('🚀 You can now start the app: npm run dev');
  } else {
    console.log('❌ No providers working - Marcus will not respond');
    console.log('📋 Please configure at least one provider token');
    console.log('🥇 Recommended: Get Replicate token at https://replicate.com/account/api-tokens');
  }
}

if (require.main === module) {
  main();
}

module.exports = { testReplicate, testOpenRouter, testHuggingFace };
