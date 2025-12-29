# Deploying the AI Resume Editor to AWS

This guide outlines the steps to deploy the serverless resume editor to your AWS account.

## Prerequisites

1.  **AWS CLI**: Installed and configured with your credentials (`aws configure`).
2.  **AWS SAM CLI**: Installed.
3.  **Docker**: Running (required for building the Python Lambda functions).
4.  **GitHub Token**: A Personal Access Token (classic) with `repo` scope.

## Step 1: Enable Model Access

Before deploying, ensure you have access to the **Qwen3 32B Instruct** model in AWS Bedrock.

1.  Go to the [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess).
2.  Select **Model access** from the sidebar.
3.  Click **enable specific models**.
4.  Find **Qwen** or **Qwen3 32B Instruct** and check the box.
5.  Click **Next** and submit the request. Access is usually granted instantly.

## Step 2: Build the Application

Build the serverless application container images and artifacts.

```bash
sam build --use-container
```

*Note: `--use-container` is recommended to ensure the Python environment matches AWS Lambda.*

## Step 3: Deploy

Deploy the application stack. You will be prompted for parameters.

```bash
sam deploy --guided
```

### Configuration Prompts:

*   **Stack Name**: `resume-editor` (or your preference)
*   **AWS Region**: `us-east-1` (Must match where Bedrock is available)
*   **Parameter GitHubToken**: Paste your GitHub Personal Access Token (hidden input).
*   **Parameter GitHubRepo**: `Vishhh03/Latex-Resume` (Adjust if different).
*   **Confirm changes before deploy**: `y`
*   **Allow SAM CLI IAM role creation**: `y`
*   **Disable rollback**: `n`
*   **Save arguments to configuration file**: `y`

## Step 4: Verify

Once deployed, SAM will output the **ApiUrl**.

You can test the workflow by sending a POST request to that URL:

```json
POST /update
{
    "instruction": "Update my resume to emphasize my experience with AWS Lambda."
}
```

## Step 5: Run the Web Frontend

1.  Navigate to the `web` directory:
    ```bash
    cd web
    ```
2.  Create a `.env.local` file with your API URL:
    ```bash
    echo "NEXT_PUBLIC_API_URL=https://<your-api-id>.execute-api.us-east-1.amazonaws.com/Prod/update" > .env.local
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploying the Frontend

You can deploy the `web` folder to **Vercel** or **AWS Amplify**.
- **Vercel**: Import the repository, set the Root Directory to `web`, and add the `NEXT_PUBLIC_API_URL` environment variable.

