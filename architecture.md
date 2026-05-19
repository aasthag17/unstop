# AtomQuest In-House Goal Setting & Tracking Portal - Architecture

## High-Level Architecture Overview

This project is built using a modern, lightweight architecture to ensure high performance, cost optimization, and ease of deployment. It is designed as a **Single Page Application (SPA)** using **React** and **Vite**, with a mocked local storage backend for the hackathon demo, which can easily be swapped for a real REST/GraphQL API.

### Architecture Diagram

```mermaid
graph TD
    subgraph Client [Client Tier (Web Browser)]
        UI[React UI Components]
        State[React Hooks / Context State]
        Router[React Router (Optional)]
    end

    subgraph Logic [Application Tier (Frontend Logic)]
        Auth[Role Management (Employee, Manager, Admin)]
        Validation[Goal Validation Engine (Weightage, Limits)]
        DataService[Data Access Layer (localStorage Adapter)]
    end

    subgraph Storage [Data Tier (Mock / Production)]
        LocalDB[(localStorage / IndexedDB)]
        CloudDB[(Cloud DB - PostgreSQL / MongoDB - Future)]
    end
    
    subgraph Services [External Services (Future Scope)]
        SSO[Azure AD / Microsoft Entra ID]
        Notifications[MS Teams / Email Gateway]
    end

    UI --> State
    State --> Auth
    State --> Validation
    Validation --> DataService
    DataService --> LocalDB
    DataService -.-> CloudDB
    Auth -.-> SSO
    Validation -.-> Notifications
```

## Key Technical Decisions & Cost Optimization

1. **Frontend Framework: React + Vite**
   - **Why**: Blazing fast cold starts and HMR (Hot Module Replacement) during development. React provides a robust component-based architecture for the complex dashboards required by the 3 personas.
2. **Styling: Vanilla CSS with Custom Properties (Dark Mode Glassmorphism)**
   - **Why**: Zero-dependency styling reduces bundle size and build time. Glassmorphism UI provides the required "WOW" factor and premium feel without relying on heavy UI component libraries.
3. **State Management: React Hooks (`useState`, `useEffect`) + `localStorage`**
   - **Why**: Cost optimization. For the MVP/Hackathon scale, a backend database is mocked via browser storage to ensure 100% uptime, zero latency, and zero hosting costs. This allows evaluators to seamlessly test all personas on a single browser without configuring backend infrastructure.
4. **Data Isolation (Role-based)**
   - The UI intelligently filters data from the central store based on the active persona (`ManagerId` linking).

## User Journeys

*   **Employee**: Logs in -> Views current goals -> Creates draft goals (validation ensures 100% total weightage, min 10% each) -> Submits to Manager -> Logs quarterly progress.
*   **Manager**: Logs in -> Views Team dashboard -> Reviews submitted goals -> Approves (locks) or Returns -> Conducts quarterly check-ins with feedback.
*   **Admin/HR**: Views completion statistics -> Audits changes -> Exports achievement reports to CSV.
