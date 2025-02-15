/**
 * Setup development SSL certificates. Some signing providers require SSL to work locally.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const certsDir = path.join(process.cwd(), 'certs');
const keyPath = path.join(certsDir, 'key.pem');
const certPath = path.join(certsDir, 'cert.pem');

function checkOpenSSLAvailability() {
  try {
    execSync('openssl version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

// Generate certificates if they don't exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log('Generating development SSL certificates...');

  if (!checkOpenSSLAvailability()) {
    console.error(
      '\x1b[31mError: OpenSSL is not available in your system.\x1b[0m'
    );
    console.error('\nTo install OpenSSL:');
    console.error(
      '- Windows: Install via https://slproweb.com/products/Win32OpenSSL.html'
    );
    console.error('- macOS: Install via Homebrew: brew install openssl');
    console.error('- Linux (Ubuntu/Debian): sudo apt-get install openssl');
    console.error('- Linux (Fedora): sudo dnf install openssl');
    console.error('\nAfter installing OpenSSL, run this script again.');
    process.exit(1);
  }

  try {
    execSync(
      `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=localhost"`,
      { stdio: 'inherit' }
    );
    console.log('\x1b[32mSSL certificates generated successfully!\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mFailed to generate SSL certificates:\x1b[0m', error);
    process.exit(1);
  }
} else {
  console.log('Development SSL certificates already exist.');
}
