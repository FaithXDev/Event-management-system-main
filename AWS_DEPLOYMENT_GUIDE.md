# AWS Production Deployment Guide - Event Management System

This document outlines the architecture, prerequisites, and step-by-step instructions for deploying the Event Management System to AWS for a production environment.

## 1. Architecture Overview
For a highly available and scalable production deployment on AWS, we recommend the following architecture:

*   **Frontend (Vite/React)**: Hosted as a static website on **Amazon S3** and distributed globally via **Amazon CloudFront** (CDN).
*   **Backend (Node.js/Express)**: Containerized and orchestrated using **Amazon ECS (Elastic Container Service) with AWS Fargate** (Serverless Compute for containers) or **AWS Elastic Beanstalk**. A single **EC2 instance with Docker Compose** is an acceptable alternative for smaller scale or cost-sensitive deployments.
*   **Database**: **MongoDB Atlas** (Managed MongoDB on AWS). This is highly recommended over self-hosting MongoDB on EC2 to reduce maintenance overhead.
*   **DNS & SSL**: **Amazon Route 53** for domain management and **AWS Certificate Manager (ACM)** for free SSL certificates.

## 2. Prerequisites
1.  **AWS Account**: Administrator access.
2.  **MongoDB Atlas Cluster**: A production-ready cluster (M10 or higher for production traffic). Whitelist the AWS VPC NAT Gateway IP or use VPC Peering.
3.  **Domain Name**: Managed via AWS Route 53 (e.g., `eventone.com`).
4.  **SMTP Provider**: Credentials for sending emails (e.g., Amazon SES, SendGrid, Mailgun).
5.  **Docker & AWS CLI**: Installed on the deployment machine.

## 3. Environment Variables
You will need to set these in your deployment environments.

### Backend (`backend/.env`)
```env
NODE_ENV=production
PORT=5050
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/event_mgmt?retryWrites=true&w=majority
JWT_SECRET=your_super_strong_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://www.yourdomain.com
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_user
SMTP_PASS=your_ses_smtp_password
EMAIL_FROM=EventOne <no-reply@yourdomain.com>
```

### Frontend (`Frontendd/.env`)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

> [!WARNING]
> **CRITICAL: Local Uploads vs Cloud Storage**
> The backend currently uses `multer` to save uploaded files (like event posters) to the local disk in the `/uploads` directory.
> * If you deploy to a multi-instance environment (like ECS or Elastic Beanstalk with Auto Scaling), local file uploads **will break** (images uploaded to Server A won't be visible when traffic routes to Server B, and will be lost on container restart).
> * **Action Required for DevOps/Dev Team**: If you plan to scale horizontally, the development team must refactor the upload logic (in `backend/src/utils/upload.js` and `eventRoutes.js`) to stream files directly to an **Amazon S3 Bucket** using `multer-s3` instead of the local filesystem. Alternatively, if deploying to a single EC2 instance, ensure an EBS volume is attached and mapped to the `/uploads` directory to persist files across restarts.

## 4. Frontend Deployment (AWS S3 + CloudFront)

1. **Build the Application**:
   Navigate to the `Frontendd` folder and create a `.env` file containing the production `VITE_API_BASE_URL` (e.g., `https://api.yourdomain.com`).
   ```bash
   cd Frontendd
   npm ci
   npm run build
   ```
   This generates a `dist` folder.

2. **Create an S3 Bucket**:
   * Go to S3, create a bucket (e.g., `app.yourdomain.com`).
   * Uncheck "Block all public access" (or rely on OAC/OAI from CloudFront).
   * Enable Static Website Hosting (Index document: `index.html`, Error document: `index.html` - essential for React Router).

3. **Upload Files to S3**:
   Sync the `dist` folder to your S3 bucket:
   ```bash
   aws s3 sync dist/ s3://app.yourdomain.com --delete
   ```

4. **Set up CloudFront (CDN)**:
   * Create a CloudFront distribution pointing to the S3 bucket website endpoint.
   * Redirect HTTP to HTTPS.
   * Attach your custom SSL Certificate from ACM (requested for `www.yourdomain.com` or `app.yourdomain.com`).
   * Setup a custom error response: Map `403` and `404` errors to return `/index.html` with a `200` OK status. (Required for SPA routing).

5. **Route 53**:
   Create an Alias `A` record in Route 53 pointing `www.yourdomain.com` to the CloudFront distribution.

## 5. Backend Deployment (Docker on ECS or EC2)

The frontend project contains a `Dockerfile`, but the backend currently does not.

### Creating the Backend Dockerfile
Create a file named `Dockerfile` in the `backend/` directory:

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create uploads directory if using local file storage
RUN mkdir -p uploads

EXPOSE 5050

CMD ["npm", "start"]
```

### Option A: AWS Elastic Container Service (ECS Fargate) - Recommended for Scale
1. Build the backend image and push it to Amazon Elastic Container Registry (ECR).
2. Create an ECS Task Definition using Fargate. Map port `5050` and attach the environment variables (via AWS Secrets Manager or Systems Manager Parameter Store).
3. Create an Application Load Balancer (ALB). Attach an SSL certificate to the ALB listener on port 443.
4. Route `api.yourdomain.com` in Route 53 to the ALB.
5. Launch an ECS Service using the Task Definition, placing it behind the ALB.

### Option B: AWS EC2 with Docker Compose (Cost Effective for MVP)
For a simpler setup, you can run a single EC2 instance using Docker Compose.

1. Provision an Ubuntu EC2 instance (t3.micro or t3.small).
2. Install Docker and Docker Compose.
3. Use a `docker-compose.yml` file on the server:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    restart: always
    env_file: ./backend/.env
    ports:
      - "5050:5050"
    volumes:
      - ./backend/uploads:/app/uploads # Persist uploads to host disk
```
4. Set up an **Nginx** reverse proxy on the EC2 instance to forward `api.yourdomain.com` to `localhost:5050`.
5. Use **Certbot (Let's Encrypt)** to provision SSL for Nginx.

## 6. Pre-Flight Checklist
- [ ] **CORS**: The backend `CLIENT_URL` strictly matches the deployed frontend URL (e.g., `https://www.yourdomain.com`).
- [ ] **MongoDB Network**: Ensure MongoDB Atlas network access (IP Whitelist) allows connections from your EC2 Instance, VPC NAT Gateway, or via VPC Peering.
- [ ] **Frontend Env Vars**: The `VITE_API_BASE_URL` in the frontend `.env` is correctly pointing to the backend load balancer / domain over HTTPS (e.g., `https://api.yourdomain.com`). Avoid trailing slashes.
- [ ] **WebSockets**: If using websockets (`socket.io`), ensure your Load Balancer (ALB or Nginx) supports WebSockets (HTTP/1.1 upgrade).
