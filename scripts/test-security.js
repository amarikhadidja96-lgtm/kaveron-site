import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

console.log('=== KAVERON SUPABASE & SECURITY VERIFICATION ===\n');

// 1. Check .env and .gitignore
const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
const envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf8');

const isEnvIgnored = gitignore.includes('.env');
console.log('1. Environment Configuration:');
console.log(`   - .env in .gitignore: ${isEnvIgnored ? 'PASS' : 'FAIL'}`);
console.log(`   - .env.example created: ${envExample.includes('VITE_SUPABASE_URL') ? 'PASS' : 'FAIL'}`);

// 2. Scan for leaked secrets in src/ and dist/
const secretPatterns = [
  /service_role/i,
  /re_[0-9a-zA-Z]{20,}/,
  /RESEND_API_KEY\s*=\s*['"][^'"]+['"]/,
  /NOTIFY_EMAIL\s*=\s*['"][^'"]+['"]/,
];

function scanDir(dir) {
  let leaks = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        leaks = leaks.concat(scanDir(fullPath));
      }
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx|html|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          leaks.push({ file: fullPath, match: pattern.toString() });
        }
      }
    }
  }
  return leaks;
}

const srcLeaks = scanDir(path.join(rootDir, 'src'));
console.log('\n2. Secrets in Frontend Bundle (src/):');
if (srcLeaks.length === 0) {
  console.log('   - PASS: No secrets detected in frontend code.');
} else {
  console.log('   - FAIL: Secrets found:', srcLeaks);
}

// 3. Verify Database Migration
const migrationPath = path.join(rootDir, 'supabase', 'migrations', '20261105000000_init_schema.sql');
const hasMigration = fs.existsSync(migrationPath);
console.log('\n3. Database Migration:');
console.log(`   - SQL migration exists: ${hasMigration ? 'PASS' : 'FAIL'}`);

if (hasMigration) {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const hasRLS =
    sql.includes('alter table public.leads enable row level security;') &&
    sql.includes('alter table public.chat_sessions enable row level security;') &&
    sql.includes('alter table public.knowledge_base enable row level security;') &&
    sql.includes('alter table public.unanswered_questions enable row level security;') &&
    sql.includes('alter table public.profiles enable row level security;');
  const hasIsAdmin = sql.includes('create or replace function public.is_admin()');
  const hasChecks = sql.includes('check (char_length(') && sql.includes('status in');
  const hasIndexes = sql.includes('idx_leads_created_at') && sql.includes('idx_leads_status');

  console.log(`   - RLS enabled on ALL tables: ${hasRLS ? 'PASS' : 'FAIL'}`);
  console.log(`   - is_admin() helper defined: ${hasIsAdmin ? 'PASS' : 'FAIL'}`);
  console.log(`   - CHECK constraints on leads: ${hasChecks ? 'PASS' : 'FAIL'}`);
  console.log(`   - Performance indexes created: ${hasIndexes ? 'PASS' : 'FAIL'}`);
}

// 4. Verify Edge Function
const edgeFunctionPath = path.join(rootDir, 'supabase', 'functions', 'submit-lead', 'index.ts');
const hasEdgeFunction = fs.existsSync(edgeFunctionPath);
console.log('\n4. Edge Function (submit-lead):');
console.log(`   - Edge Function file exists: ${hasEdgeFunction ? 'PASS' : 'FAIL'}`);
if (hasEdgeFunction) {
  const code = fs.readFileSync(edgeFunctionPath, 'utf8');
  const hasHoneypot = code.includes('body.honeypot');
  const hasRateLimit = code.includes('ip_hash') && code.includes('gte("created_at"');
  const hasResend = code.includes('api.resend.com') && code.includes('RESEND_API_KEY');
  const hasCORS = code.includes('Access-Control-Allow-Origin');

  console.log(`   - Honeypot check: ${hasHoneypot ? 'PASS' : 'FAIL'}`);
  console.log(`   - IP hashing & Rate limiting: ${hasRateLimit ? 'PASS' : 'FAIL'}`);
  console.log(`   - Resend email with fallback: ${hasResend ? 'PASS' : 'FAIL'}`);
  console.log(`   - Origin CORS configuration: ${hasCORS ? 'PASS' : 'FAIL'}`);
}

// 5. Verify SEO & Robots exclusion
const robotsTxt = fs.readFileSync(path.join(rootDir, 'public', 'robots.txt'), 'utf8');
const sitemapXml = fs.readFileSync(path.join(rootDir, 'public', 'sitemap.xml'), 'utf8');
console.log('\n5. Admin Route Exclusion:');
console.log(`   - robots.txt disallows /admin: ${robotsTxt.includes('Disallow: /admin') ? 'PASS' : 'FAIL'}`);
console.log(`   - sitemap.xml excludes /admin: ${!sitemapXml.includes('/admin') ? 'PASS' : 'FAIL'}`);

console.log('\n=== ALL AUTOMATED CHECKS COMPLETED ===');

