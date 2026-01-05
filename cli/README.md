# latex-resume-cli

Interactive terminal to launch the AI Resume Editor.

```bash
npx latex-resume-cli
```

## What it does

An interactive terminal experience that lets you:
- 📂 **View the GitHub repo** - Explore the source code
- 🚀 **Launch the AI Resume Editor** - Spins up an AWS ECS container on-demand

## Architecture

This CLI triggers an AWS Lambda function that boots a Fargate Spot container running:
- Next.js frontend (static export)
- Bun backend with TeX Live (pdflatex)
- Amazon Bedrock AI for resume editing
- Cloudflare Tunnel for secure access

## Publishing

```bash
cd cli
npm login
npm publish
```

## License

MIT
