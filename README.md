# Resume Editor

```bash
npx latex-resume-cli
```

I got tired of manually tweaking my resume for every job application. So I built this.

It's a self-healing resume editor that runs on AWS. An AI agent (Qwen 3 on Bedrock) takes plain English requests and generates LaTeX patches. The whole thing costs $0/hr when idle.

## How it works

```
You: "Add 2 years at Google doing Kubernetes stuff"
     ↓
AI generates LaTeX patch → compiles PDF → commits to GitHub
     ↓
You get a preview, accept or reject
```

The backend only runs when you're actively using it. Otherwise, it's completely off.

## Architecture

Everything runs in a single Docker container on ECS Fargate Spot:
- **Bun backend** - handles API requests, serves the frontend
- **Next.js frontend** - static export, bundled into the container
- **TeX Live** - compiles LaTeX to PDF (pdflatex + latexmk)
- **Cloudflare Tunnel** - exposes the service without a load balancer

### Why Fargate Spot?

Lambda would've been the obvious choice, but TeX Live is huge. Cramming it into a Lambda layer is painful. With Docker, I just `apt-get install` what I need.

Fargate Spot is ~70% cheaper than regular Fargate. Since the service only runs for a few minutes at a time, Spot interruptions don't matter.

### Why Bedrock?

No API keys to manage. Bedrock runs inside my VPC, auth is handled by IAM. Qwen 3 on Bedrock is pay-per-token, way cheaper than a ChatGPT subscription for occasional use.

### Wake-on-Demand

1. **Idle** - Nothing running. Cost: $0
2. **You visit the site** - Lambda wakes up the backend (~45-60s cold start)
3. **You edit your resume** - Backend is live
4. **10 min of inactivity** - Backend kills itself. Back to $0

SOCI lazy-loading is enabled, so container startup is faster than pulling the full image.

## Setup

### Prerequisites
- AWS account with admin access
- Cloudflare account (for the tunnel)
- Terraform installed locally

### Deploy

1. Clone/fork this repo

2. Set up GitHub secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

3. Configure Terraform:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # edit terraform.tfvars with your values
   ```

4. Deploy:
   ```bash
   terraform init
   terraform apply
   ```

5. The workflow triggers on push to `main`. Your image builds, pushes to ECR, and the SOCI index gets created.

### Environment Variables (terraform.tfvars)

```hcl
github_token            = "ghp_..."  # for committing resume changes
repo_owner              = "your-username"
repo_name               = "your-repo"
cloudflare_tunnel_token = "eyJ..."  # from cloudflare zero trust dashboard
```

## Usage

1. Go to your Cloudflare tunnel URL
2. Site says "Backend Sleeping" - click Wake Up
3. Wait ~60s for Fargate to spin up
4. Type something like "Add experience at Google, 2 years, Kubernetes and GKE"
5. AI generates the LaTeX, compiles, shows you the PDF
6. Accept it → commits to GitHub automatically

## Project Structure

```
├── compute/          # Bun backend (API + serves static files)
├── web/              # Next.js frontend (builds to static)
├── terraform/        # Infrastructure as code
├── lambda_src/       # Wake/stop Lambdas
├── resume.tex        # Your actual resume
└── Dockerfile        # Everything bundled together
```

---

Built by [Vishal Shaji](https://github.com/Vishhh03)
