# 🛡️ Fraud Audit Engine

A serverless, AI-powered microservice architecture designed to detect, analyze, and log high-velocity financial transaction anomalies in real-time. 

This engine intercepts transactional event streams, processes them through a high-throughput Pub/Sub pipeline, and leverages a Large Language Model (LLM) for forensic analysis before persisting the audit trails to a cloud-native database.

## 🚀 Architecture & Tech Stack

*   **Backend Engine:** Spring Boot (Java)
*   **Frontend Dashboard:** React.js (Vite, Tailwind CSS, Lucide Icons)
*   **Event Stream (Pub/Sub):** Upstash Serverless Redis
*   **Database:** Neon Serverless PostgreSQL
*   **AI Integration:** Google Gemini 2.5 Flash via Spring AI

## ⚙️ Core Workflow

1.  **Event Ingestion:** The frontend triggers a simulated high-velocity transaction bundle.
2.  **Stream Processing:** The event is published to an Upstash Redis topic.
3.  **Consumption:** The Spring Boot backend consumes the payload instantly via a Redis Message Listener.
4.  **Forensic Analysis:** The payload is injected into a Gemini AI prompt to generate a highly detailed, executive-level fraud vector analysis.
5.  **Persistence:** The final incident report, complete with the AI-generated forensic audit, is committed to the Neon PostgreSQL database.
6.  **Real-Time Monitoring:** The React dashboard dynamically polls and visualizes throughput, latency, and pipeline sync status.

## 🛠️ Local Setup & Execution

### Prerequisites
*   Java 17+
*   Node.js 18+
*   Maven Wrapper (Included)

### 1. Configure Environment Variables
This application requires external API keys and cloud passwords to function. Set the following environment variables in your terminal before launching the backend:
*   `GEMINI_API_KEY`
*   `NEON_DB_PASSWORD`
*   `UPSTASH_REDIS_PASSWORD`

### 2. Boot the Backend (Spring Boot)
```bash
cd fraud-audit-engine
./mvnw clean install -DskipTests
./mvnw spring-boot:run

### 3. Launch the Frontend (React / Vite)
```bash
cd fraud-audit-frontend
npm install
npm run dev

👨‍💻 Author
Pritish Kumar Sahoo