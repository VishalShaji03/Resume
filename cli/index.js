#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 ANSI Colors & Styles
// ═══════════════════════════════════════════════════════════════════════════════
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m',
    white: '\x1b[37m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 Configuration - UPDATE THESE VALUES
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = {
    name: 'LaTeX Resume',
    github: 'https://github.com/Vishhh03/Latex-Resume',
    // Lambda Function URL (run: terraform output wake_up_url)
    wakeUpUrl: 'https://7stdrljqpaqrxihun4yequ34oa0ozlsv.lambda-url.us-east-1.on.aws/',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 ASCII Art Banner
// ═══════════════════════════════════════════════════════════════════════════════
const banner = `
${c.cyan}${c.bold}
 ██╗      █████╗ ████████╗███████╗██╗  ██╗
 ██║     ██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝
 ██║     ███████║   ██║   █████╗   ╚███╔╝ 
 ██║     ██╔══██║   ██║   ██╔══╝   ██╔██╗ 
 ███████╗██║  ██║   ██║   ███████╗██╔╝ ██╗
 ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
${c.reset}
${c.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}
${c.white}       AI-Powered LaTeX Resume Editor${c.reset}
${c.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// 🛠️ Utility Functions
// ═══════════════════════════════════════════════════════════════════════════════
function openUrl(url) {
    const start = process.platform === 'darwin' ? 'open' :
        process.platform === 'win32' ? 'start' : 'xdg-open';
    require('child_process').exec(`${start} ${url}`);
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 Wake Up ECS & Open Browser
// ═══════════════════════════════════════════════════════════════════════════════
async function wakeAndOpen() {
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const MAX_RETRIES = 20;        // Max polling attempts
    const POLL_INTERVAL = 5000;    // 5 seconds between polls
    const TIMEOUT_MS = 180000;     // 3 minute total timeout

    let attempts = 0;
    let spinnerIdx = 0;
    let statusMessage = 'Booting...';
    let done = false;
    const startTime = Date.now();

    console.log(`\n${c.yellow}Waking up the Resume Engine on AWS ECS...${c.reset}`);
    console.log(`${c.dim}(Timeout: 3 minutes, polling every 5s)${c.reset}\n`);

    if (CONFIG.wakeUpUrl === 'YOUR_LAMBDA_FUNCTION_URL_HERE') {
        console.log(`${c.yellow}Lambda URL not configured!${c.reset}`);
        console.log(`${c.dim}   Update CONFIG.wakeUpUrl in this package${c.reset}\n`);
        return;
    }

    // Timer that updates the display every second (independent of polling)
    const displayTimer = setInterval(() => {
        if (done) return;
        spinnerIdx++;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        process.stdout.write(`\r${c.cyan}${spinner[spinnerIdx % spinner.length]} ${statusMessage} (${elapsed}s)${c.reset}   `);
    }, 1000);

    try {
        while (attempts < MAX_RETRIES && (Date.now() - startTime) < TIMEOUT_MS) {
            attempts++;

            const response = await httpGet(CONFIG.wakeUpUrl);

            if (response.status === 'ready') {
                done = true;
                clearInterval(displayTimer);
                console.log(`\r${c.green}Backend is ready!${c.reset}                         `);
                console.log(`\n${c.magenta}Opening: ${c.bold}${response.url}${c.reset}\n`);
                openUrl(response.url);
                return;
            } else if (response.status === 'error') {
                done = true;
                clearInterval(displayTimer);
                console.log(`\r${c.yellow}${response.message}${c.reset}                         \n`);
                return;
            } else {
                statusMessage = response.message || 'Booting...';
                await sleep(POLL_INTERVAL);
            }
        }

        // Timeout reached
        done = true;
        clearInterval(displayTimer);
        console.log(`\r${c.yellow}Timeout: ECS is still starting up.${c.reset}                    `);
        console.log(`${c.dim}Try again in a minute, or check AWS Console.${c.reset}\n`);

    } catch (err) {
        done = true;
        clearInterval(displayTimer);
        console.log(`\r${c.yellow}Connection error: ${err.message}${c.reset}\n`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📖 How It Works - Architecture Explanation
// ═══════════════════════════════════════════════════════════════════════════════
function showHowItWorks() {
    console.clear();
    console.log(`
${c.cyan}${c.bold}┌─────────────────────────────────────────────────────────────────────────┐${c.reset}
${c.cyan}${c.bold}│                     HOW THE RESUME EDITOR WORKS                         │${c.reset}
${c.cyan}${c.bold}└─────────────────────────────────────────────────────────────────────────┘${c.reset}

${c.yellow}THE PROBLEM:${c.reset}
  Tailoring a resume for each job is tedious. LaTeX is powerful but fiddly.
  I wanted to just say "add 2 years at Google doing Kubernetes" and have it done.

${c.yellow}THE SOLUTION:${c.reset}
  An AI that understands LaTeX, running on AWS, that only costs money when used.

${c.bold}ARCHITECTURE:${c.reset}

  ${c.dim}┌──────────────┐${c.reset}              ${c.dim}┌──────────────┐${c.reset}              ${c.dim}┌──────────────┐${c.reset}
  ${c.dim}│${c.reset}  ${c.white}You (CLI)${c.reset}   ${c.dim}│${c.reset}   ${c.cyan}──────▶${c.reset}   ${c.dim}│${c.reset}    ${c.green}Lambda${c.reset}    ${c.dim}│${c.reset}   ${c.cyan}──────▶${c.reset}   ${c.dim}│${c.reset}  ${c.magenta}ECS Fargate${c.reset} ${c.dim}│${c.reset}
  ${c.dim}│${c.reset}  npx command  ${c.dim}│${c.reset}    wake up   ${c.dim}│${c.reset}  (wake/stop)  ${c.dim}│${c.reset}   starts     ${c.dim}│${c.reset}   container  ${c.dim}│${c.reset}
  ${c.dim}└──────────────┘${c.reset}              ${c.dim}└──────────────┘${c.reset}              ${c.dim}└──────────────┘${c.reset}
                                                                     ${c.dim}│${c.reset}
         ${c.dim}┌─────────────────────────────────────────────────────────┘${c.reset}
         ${c.dim}▼${c.reset}
  ${c.dim}┌──────────────────────────────────────────────────────────────────────┐${c.reset}
  ${c.dim}│${c.reset}  ${c.bold}DOCKER CONTAINER (runs ~5-10 min per session)${c.reset}                        ${c.dim}│${c.reset}
  ${c.dim}│${c.reset}                                                                        ${c.dim}│${c.reset}
  ${c.dim}│${c.reset}    ${c.blue}Bun Backend${c.reset}  ───▶  ${c.yellow}Qwen AI (Bedrock)${c.reset}  ───▶  ${c.green}pdflatex${c.reset}              ${c.dim}│${c.reset}
  ${c.dim}│${c.reset}    serves API         generates LaTeX        compiles PDF             ${c.dim}│${c.reset}
  ${c.dim}│${c.reset}                                                    ${c.dim}│${c.reset}                   ${c.dim}│${c.reset}
  ${c.dim}│${c.reset}    ${c.white}Next.js UI${c.reset}  ◀───  preview + accept/reject  ◀────┘                   ${c.dim}│${c.reset}
  ${c.dim}│${c.reset}    (static files)           changes                                   ${c.dim}│${c.reset}
  ${c.dim}│${c.reset}                                                                        ${c.dim}│${c.reset}
  ${c.dim}│${c.reset}    ${c.magenta}Cloudflare Tunnel${c.reset}  ◀───  exposes to internet (no load balancer)    ${c.dim}│${c.reset}
  ${c.dim}└──────────────────────────────────────────────────────────────────────┘${c.reset}
                                     ${c.dim}│${c.reset}
                                     ${c.dim}▼${c.reset}
                          ${c.dim}┌──────────────────┐${c.reset}
                          ${c.dim}│${c.reset}  ${c.green}GitHub Commit${c.reset}    ${c.dim}│${c.reset}
                          ${c.dim}│${c.reset}  (auto-saves)     ${c.dim}│${c.reset}
                          ${c.dim}└──────────────────┘${c.reset}

${c.yellow}COST BREAKDOWN:${c.reset}
  ${c.green}•${c.reset} When idle: ${c.bold}$0/hr${c.reset}  ${c.dim}(nothing running)${c.reset}
  ${c.green}•${c.reset} When active: ${c.bold}~$0.01-0.02${c.reset}  ${c.dim}(Fargate Spot + Bedrock tokens)${c.reset}
  ${c.green}•${c.reset} Budget kill switch: ${c.bold}auto-stops${c.reset} everything if you hit $5/month

${c.yellow}THE FLOW:${c.reset}
  ${c.white}1.${c.reset} You run ${c.cyan}npx latex-resume-cli${c.reset}
  ${c.white}2.${c.reset} Lambda checks if ECS is running. If not, starts it ${c.dim}(~45-60s cold start)${c.reset}
  ${c.white}3.${c.reset} Container boots: Bun server + TeX Live + Cloudflare tunnel
  ${c.white}4.${c.reset} You type: "Add experience at Google, 2 years, Kubernetes"
  ${c.white}5.${c.reset} AI generates a LaTeX patch, backend compiles to PDF
  ${c.white}6.${c.reset} You see the preview. Accept = auto-commit to GitHub
  ${c.white}7.${c.reset} After 10 min idle, container kills itself. Back to $0.

${c.yellow}WHY THESE CHOICES:${c.reset}
  ${c.green}•${c.reset} ${c.bold}Fargate Spot${c.reset} over Lambda: TeX Live is huge. Docker makes it easy.
  ${c.green}•${c.reset} ${c.bold}Cloudflare Tunnel${c.reset} over ALB: No monthly load balancer cost.
  ${c.green}•${c.reset} ${c.bold}Bedrock${c.reset} over OpenAI: No API keys. Pay-per-token. Runs in my VPC.
  ${c.green}•${c.reset} ${c.bold}pdflatex${c.reset} over xelatex: Faster compilation. Good enough for most fonts.

${c.dim}Press Enter to return to menu...${c.reset}`);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('', () => {
        rl.close();
        showMenu();
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 Interactive Menu
// ═══════════════════════════════════════════════════════════════════════════════
async function showMenu() {
    console.clear();
    console.log(banner);

    console.log(`${c.bold}  What would you like to do?${c.reset}\n`);
    console.log(`  ${c.cyan}[1]${c.reset} ${c.white}View GitHub Repository${c.reset}`);
    console.log(`  ${c.cyan}[2]${c.reset} ${c.white}Launch AI Resume Editor (AWS ECS)${c.reset}`);
    console.log(`  ${c.cyan}[3]${c.reset} ${c.white}How it Works${c.reset}`);
    console.log(`  ${c.cyan}[4]${c.reset} ${c.dim}Exit${c.reset}`);
    console.log();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`${c.yellow}  --> Enter choice [1-4]: ${c.reset}`, async (answer) => {
        rl.close();

        switch (answer.trim()) {
            case '1':
                console.log(`\n${c.green}Opening GitHub...${c.reset}\n`);
                openUrl(CONFIG.github);
                console.log(`${c.dim}   ${CONFIG.github}${c.reset}\n`);
                break;

            case '2':
                await wakeAndOpen();
                break;

            case '3':
                showHowItWorks();
                break;

            case '4':
                console.log(`\n${c.magenta}Thanks for visiting! See you around.${c.reset}\n`);
                break;

            default:
                console.log(`\n${c.yellow}Invalid choice. Please run again.${c.reset}\n`);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 Entry Point
// ═══════════════════════════════════════════════════════════════════════════════
showMenu();
