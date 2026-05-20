const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: allPosts, error } = await supabase.from('posts').select('id, title, lang, slug');
  if (error) {
    console.error('Error fetching posts count:', error);
    return;
  }
  
  const counts = {};
  allPosts.forEach(p => {
    counts[p.lang] = (counts[p.lang] || 0) + 1;
  });
  console.log('Posts count by language:', counts);
  console.log('List of all posts:');
  allPosts.forEach(p => {
    console.log(`- [${p.lang}] ${p.title} (${p.slug})`);
  });
}

main();
