# 📄 AI-Powered LaTeX Resume Pipeline

A **forkable**, version-controlled LaTeX résumé with automatic PDF generation and an optional **AI-powered serverless editor**.

---

## 🚀 Features

- **Version-controlled résumé** – Track every change with Git
- **Automatic PDF builds** – Push `.tex` changes, get a fresh PDF
- **Optimized GitHub Actions** – Fast builds with Tectonic + caching
- **AI-powered editing** *(optional)* – Update your résumé with natural language via AWS Bedrock

---

## ⚙️ GitHub Actions Workflow

The workflow is optimized for speed and cost-efficiency:

| Feature | Benefit |
|---------|---------|
| **Tectonic compiler** | 10x faster than full TeX Live |
| **Package caching** | Skip re-downloading on subsequent builds |
| **Path filtering** | Only runs when `.tex` files change |
| **Concurrency control** | Cancels duplicate runs on rapid pushes |
| **5-min timeout** | Prevents runaway jobs |

```yaml
on:
  push:
    branches: [main]
    paths: ['**.tex']  # Only trigger on .tex changes

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 5
```

PDF output is pushed to a separate `pdf-output` branch.

---

## 🤖 AI Resume Editor (Optional)

An AWS serverless pipeline that lets you update your résumé with natural language:

> *"Add Python to my skills section"* → AI generates patches → commits to GitHub → triggers PDF rebuild

### Architecture
- **AWS Lambda** – Fetch, generate patches, commit
- **Amazon Bedrock** – LLM for intelligent diff generation
- **AWS Step Functions** – Orchestrates the pipeline
- **GitHub API** – Reads/writes `resume.tex` (only this file)

### Security
- LLM access is **restricted to `resume.tex`** only
- Credentials stored via SAM parameters (NoEcho)
- Patch-based editing – no arbitrary file operations

### Deploy
```bash
sam deploy --parameter-overrides \
  GitHubToken=ghp_xxxx \
  GitHubRepo=username/repo
```

---

## 🧪 Local Compilation

```bash
# Using Tectonic (recommended)
tectonic resume.tex

# Or traditional LaTeX
latexmk -pdf resume.tex
```

---

## 🤝 Fork & Customize

1. Fork this repo
2. Replace `resume.tex` with your content
3. Push to `main` – PDF auto-generates!

PRs and ideas welcome!
