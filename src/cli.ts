#!/usr/bin/env node
import { resolve, relative } from 'node:path';
import { writeFileSync, readdirSync, statSync } from 'node:fs';
import { generateDtsForFile } from './typegen.js';

const [,, command, ...args] = process.argv;

if (command === 'typegen') {
  const dirs = args.length > 0 ? args : ['src'];
  let count = 0;

  for (const dir of dirs) {
    const absDir = resolve(dir);
    walkPhpFiles(absDir, (phpPath) => {
      const dts = generateDtsForFile(phpPath);
      if (dts.trim()) {
        const dtsPath = phpPath + '.d.ts';
        writeFileSync(dtsPath, dts);
        console.log(`  ${relative(process.cwd(), dtsPath)}`);
        count++;
      }
    });
  }

  console.log(`\nGenerated ${count} .d.ts files.`);
} else {
  console.log('Usage: storybook-php typegen [dirs...]');
  console.log('  Generate .d.ts files for PHP sources');
  process.exit(command ? 1 : 0);
}

function walkPhpFiles(dir: string, cb: (path: string) => void): void {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory() && entry !== 'node_modules' && entry !== 'vendor') {
      walkPhpFiles(full, cb);
    } else if (entry.endsWith('.php')) {
      cb(full);
    }
  }
}
