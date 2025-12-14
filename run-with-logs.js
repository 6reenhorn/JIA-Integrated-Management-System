#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exePath = path.join(__dirname, 'dist', 'jia-integrated-management-system 0.0.0.exe');

console.log('🚀 Starting app:', exePath);

const proc = spawn(exePath, [], {
    stdio: 'inherit',  // Inherit parent's stdio so we see all output
    detached: false
});

proc.on('exit', (code) => {
    console.log('🛑 Process exited with code:', code);
});

proc.on('error', (err) => {
    console.error('❌ Error:', err);
});
