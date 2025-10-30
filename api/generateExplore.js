// generateExplore.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ---------------------- Supabase Client ----------------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase credentials not set in .env!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------- Generate Explore HTML ----------------------
async function generateExploreHTML() {
  const { data: bots, error } = await supabase.from('sites').select('*');

  if (error) {
    console.error("Error fetching bots:", error.message);
    return [];
  }

  let botHTML = '';
  bots.forEach((bot) => {
    const filesObj = bot.files || {}; // already an object
    const botFile = filesObj['bot.js'] || '// No bot file';

    botHTML += `
    <div class="bot">
      <h2>${bot.name}</h2>
      <p>${bot.description}</p>
      <pre>${botFile}</pre>
    </div>
    `;
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Explore Bots</title>
<style>
body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
.bot { background: #fff; padding: 10px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);}
pre { background: #eee; padding: 10px; border-radius: 5px; overflow-x: auto; }
</style>
</head>
<body>
<h1>Explore Bots</h1>
${botHTML}
</body>
</html>`;

  // Write locally for testing
  fs.writeFileSync(path.join(process.cwd(), 'explore.html'), html);
  console.log("explore.html generated successfully!");

  return html;
}

// ---------------------- Vercel Serverless Handler ----------------------
export async function handler(req, res) {
  try {
    const html = await generateExploreHTML();
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating explore page.");
  }
}

// ---------------------- Local Execution ----------------------
if (process.argv[2] === 'local') {
  generateExploreHTML();
}
