# Deployment Guide for Talent Analytics ML Service

This guide explains how to deploy the `ml-service` to [Render](https://render.com).

## Prerequisites

1.  A [Render](https://render.com) account.
2.  The code pushed to a GitHub repository (public or private).

## Option 1: Automatic Deployment (Recommended)

This project includes a `render.yaml` Blueprint file for easy deployment.

1.  Log in to your Render Dashboard.
2.  Click **"New +"** and select **"Blueprint"**.
3.  Connect your GitHub repository `Talent-Analytics`.
4.  Render will automatically detect the `render.yaml` file.
5.  Give the blueprint a name (e.g., `talent-analytics-ml`).
6.  Click **"Apply"**.
7.  Render will start building and deploying the `talent-analytics-ml-service`.

## Option 2: Manual Deployment

If you prefer to configure manually or don't want to use Blueprints:

1.  Log in to your Render Dashboard.
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect your GitHub repository `Talent-Analytics`.
4.  Configure the service:
    *   **Name:** `talent-analytics-ml-service`
    *   **Root Directory:** `ml-service` (Important!)
    *   **Runtime:** `Python 3`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
5.  Scroll down and click **"Create Web Service"**.

## Verification

Once deployment is complete (check the "Logs" tab for "Service is live"), you can test the API:

1.  Get the URL from the dashboard (e.g., `https://talent-analytics-ml-service.onrender.com`).
2.  Visit `https://<YOUR-APP-URL>/health` to check the status.
3.  Visit `https://<YOUR-APP-URL>/docs` to see the interactive API documentation.

## Troubleshooting

*   **Build Failures:** Check the "Logs" tab. Ensure `requirements.txt` in `ml-service` has all necessary dependencies.
*   **Startup Failures:** Ensure the `Start Command` is exactly: `uvicorn app:app --host 0.0.0.0 --port $PORT`. The `$PORT` variable is automatically injected by Render.
