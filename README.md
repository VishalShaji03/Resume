# Resume Editor

```bash
npx latex-resume-cli
```

I got tired of manually tweaking my resume for every job application. So I built this.

It's a resume editor that runs on AWS. Tell it what you want in plain English ("add 2 years at Google doing Kubernetes stuff") and an AI generates the LaTeX for you. The whole thing costs $0 when you're not using it.

## Quick Start

```
You: "Add 2 years at Google doing Kubernetes stuff"
     ↓
AI generates LaTeX patch → compiles PDF → you preview it
     ↓
Accept → auto-commits to GitHub
```

The backend spins up when you need it, shuts down after 10 minutes of inactivity. No always-on servers burning money.

## What's Inside

Everything runs in one Docker container on ECS Fargate Spot:
- **Bun** - handles API requests, serves the frontend
- **Next.js** - static export, bundled into the container  
- **TeX Live** - pdflatex + latexmk for compilation
- **Cloudflare Tunnel** - exposes the service without paying for a load balancer

### Why Fargate Spot?

Lambda would've been the obvious choice, but TeX Live is huge (~2GB). Fitting it into a Lambda layer is a pain. With Docker I just `apt-get install` what I need and move on.

Fargate Spot is ~70% cheaper than regular Fargate. I only run for a few minutes at a time, so Spot interruptions are a non-issue.

### Why Bedrock?

No API keys to rotate. Bedrock runs in my VPC, auth is handled by IAM. Qwen on Bedrock is pay-per-token - way cheaper than a ChatGPT subscription for occasional resume tweaks.

### Wake-on-Demand Flow

1. **Idle** - Nothing running. Cost: $0
2. **You visit the site** - Lambda wakes up ECS (~45-60s cold start)
3. **You edit** - Backend is live
4. **10 min idle** - Container kills itself. Back to $0

## Budget Kill Switch

There's a failsafe: if AWS costs hit 80% of your monthly budget ($4 out of $5 by default), a Lambda automatically:
1. Stops all ECS tasks
2. Disables the wakeup Lambda (sets concurrency to 0)

This prevents runaway costs. To re-enable, just reset the Lambda concurrency in the AWS console.

## Setup

### You'll Need
- AWS account with admin access
- Cloudflare account (free tier works)
- Terraform installed

### Deploy

1. Fork/clone this repo

2. Add GitHub secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

3. Configure Terraform:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # edit with your values
   ```

4. Deploy:
   ```bash
   terraform init
   terraform apply
   ```

5. Push to `main` - GitHub Actions builds the image, pushes to ECR

### terraform.tfvars

```hcl
github_token            = "ghp_..."           # for committing resume changes
repo_owner              = "your-username"
repo_name               = "your-repo"
cloudflare_tunnel_token = "eyJ..."            # from Cloudflare Zero Trust
budget_alert_email      = "you@example.com"   # budget notification email
```

## Using It

1. Run `npx latex-resume-cli` (or go to your Cloudflare tunnel URL)
2. Wait ~60s for Fargate to spin up
3. Type what you want changed
4. Preview the PDF
5. Accept → commits to GitHub

## Project Layout

```
├── compute/          # Bun backend
├── web/              # Next.js frontend (static export)
├── terraform/        # All the infrastructure
├── lambda_src/       # Wake up, stop, and budget kill Lambdas
├── cli/              # The npx command
├── resume.tex        # Your resume
└── Dockerfile        # Everything bundled
```

---

Built by [Vishal Shaji](https://github.com/Vishhh03)
