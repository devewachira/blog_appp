const { execSync } = require('child_process');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

// Load and expand .env variables
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

// Capture command line arguments
const args = process.argv.slice(2).join(' ');

if (!args) {
  console.error("Please provide a prisma command (e.g., node prisma-run.js migrate dev)");
  process.exit(1);
}

try {
  // Execute prisma with the expanded environment
  execSync(`npx prisma ${args}`, { 
    stdio: 'inherit', 
    env: { ...process.env } 
  });
} catch (error) {
  process.exit(1);
}
