#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function log(message) {
  process.stdout.write(`${message}\n`);
}

async function main() {
  const payloadPath = process.env.KAHOOT_DEPLOY_PAYLOAD_PATH;
  const resultPath = process.env.KAHOOT_DEPLOY_RESULT_PATH;
  const runDir = process.env.KAHOOT_DEPLOY_RUN_DIR;

  if (!payloadPath || !resultPath) {
    throw new Error('Missing KAHOOT_DEPLOY_PAYLOAD_PATH or KAHOOT_DEPLOY_RESULT_PATH');
  }

  const payload = JSON.parse(readFileSync(resolve(payloadPath), 'utf-8'));
  const item = payload.item;

  log(`Mock uploader received item: ${item.title}`);
  log(`Run dir: ${runDir || '-'}`);
  log('Simulating login to Kahoot...');
  await new Promise(resolvePromise => setTimeout(resolvePromise, 500));
  log('Simulating content upload...');
  await new Promise(resolvePromise => setTimeout(resolvePromise, 900));

  const result = {
    item_id: item.id,
    title: item.title,
    finished_at: new Date().toISOString(),
    challenge_url: process.env.KAHOOT_MOCK_CHALLENGE_URL || item.challenge_url || '',
    note: 'Mock uploader completed successfully.',
  };

  writeFileSync(resolve(resultPath), JSON.stringify(result, null, 2));
  log('Mock upload complete.');
}

main().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
