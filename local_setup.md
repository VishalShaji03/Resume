# Local Development Setup

This guide explains how to run the AI Resume Architect locally using Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
- [Git](https://git-scm.com/) installed.

## Quick Start

1. **Build the Docker Image**
   Run following command in the root of the repository:
   ```bash
   docker build -t resume-local .
   ```

2. **Run the Container**
   Replace the placeholder values with your actual GitHub configuration:
   ```bash
   docker run --rm -p 8000:8000 \
     -e GITHUB_TOKEN=your_github_pat_token \
     -e REPO_OWNER=your_github_username \
     -e REPO_NAME=Latex-Resume \
     -e CLUSTER_NAME=local-test \
     resume-local
   ```
   
   *Note: If you are on Windows PowerShell, use backticks (`) for line continuation or put it all on one line.*

3. **Access the Application**
   Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)

## Features Available Locally for Testing

- **Dark Mode UI**: The dashboard loads with the dark theme.
- **Manual Editor**: Edit LaTeX code and see updates.
- **Auto-Compile**: Preview updates automatically ~1.5s after typing.
- **Error Handling**: Compilation errors are displayed in a red panel in the editor.
- **PDF Download**: Download the generated PDF directly.
- **Mocked AI**: The AI updates (`/update` endpoint) will try to call Bedrock. If you don't have AWS credentials configured in the container, it may fail. For full AI testing, you need to pass AWS credentials (not recommended for simple CSS/UI testing).

## Troubleshooting

- **Container crashes?** Check logs:
  ```bash
  docker logs <container_id>
  ```
- **Port 8000 already in use?**
  Identify and stop the process or run on a different port (e.g., `-p 8080:8000`).
