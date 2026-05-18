# 🎯 Atom Focus Portal: In-House Goal-Setting and Tracking Portal

Welcome to the **Atom Focus Portal** (In-House Goal-Setting & Tracking Portal). Atom Focus Portal is a modern, high-performance, full-stack enterprise platform designed to streamline organization-wide goal definition, cascading key performance indicators (KPIs), manager approval workflows, and quarterly check-ins.

🚀 **Live Deployment**: [https://atom-focus-portal.vercel.app](https://atom-focus-portal.vercel.app)

This system enables a robust **Employee-Manager-HR Admin** relationship structure with premium, responsive, and tactile UI aesthetics.


---

## 🌟 Core System Roles & Capabilities

### 1. 👤 Employee Portal
*   **Drafting & Inline Modification**: Create, edit, and draft goal sheets. For any goal in `Draft` or `Rejected` status, employees can edit core parameters (Title, Description, Thrust Area, UoM, Targets) inline inside an accordion-style panel.
*   **Real-Time Sheet Validation**: Real-time checklist panel enforces company compliance criteria before a goal sheet can be submitted for review:
    1.  **Total Weightage Sum**: Across all goals must equal exactly **100%**.
    2.  **Density Limit**: An employee can create a maximum of **8 goals** per year.
    3.  **Minimum Weightage**: The minimum allowed weightage for any individual goal is strictly **10%**.
*   **Pushed Shared KPIs**: Receive Departmental KPIs assigned by Admins or Managers. These shared goals allow *Limited Editing*: Goal Title, Targets, and Thrust Areas are read-only; employees may only adjust their local weightage and add execution notes.
*   **Achievement Logging & Status Updates**: Log actual achievements against planned targets and update goal states (`Not Started`, `On Track`, `Completed`) during quarterly check-in windows.
*   **Goal Locking**: Once a sheet is approved, core objectives lock immediately to prevent unauthorized modification.

### 2. 👥 Manager Portal
*   **Centralized Team Dashboard**: Track the real-time performance, completion rates, and goal-sheet statuses of all direct reports in one unified interface.
*   **Goal Sheet Approval Workflow**: Review team goal sheets with the option to inline-edit weightages or targets, return the sheets to direct reports for rework with structured comments, or officially approve and lock them.
*   **KPI Cascading**: Push department-level key performance metrics as "Shared Goals" to multiple employees simultaneously.
*   **Quarterly Reviews**: Provide structured feedback and check-in evaluations during designated check-in review windows.

### 3. 🔑 HR Admin Portal
*   **User & Hierarchy Management**: Track reporting relationships (direct reports/reporting managers) and manage core employee-manager mappings.
*   **KPI & Master Definition Control**: Define standard "Thrust Areas", configure departmental master KPIs, and cascade them globally.
*   **Global Administrative Control**: Intervene to unlock locked goals for adjustments, reset password credentials, and view organization-wide completion reports.

### 📈 System-Computed Progress Scores
The system automatically calculates individual goal progress scores during quarterly check-ins based on the designated **Unit of Measurement (UoM)**:

1. **Min (Numeric/% - Higher is better)**:
   $$\text{Progress Score} = \left( \frac{\text{Achievement}}{\text{Target}} \right) \times 100\%$$
   *(Capped dynamically between $0\%$ and $100\%$ on the dashboard, and up to $120\%$ for check-in overachievements)*

2. **Max (Numeric/% - Lower is better)**:
   $$\text{Progress Score} = \left( \frac{\text{Target}}{\text{Achievement}} \right) \times 100\%$$
   *(Enables tracking of inverse metrics such as cost reductions or error rates, capped dynamically)*

3. **Timeline (Date-based deadline comparison)**:
   $$\text{Progress Score} = \begin{cases} 100\% & \text{if Completion Date} \le \text{Target Deadline} \\ 0\% & \text{otherwise} \end{cases}$$
   *(Ensures binary timeline compliance tracking)*

4. **Zero (Zero-based goal - Zero is success)**:
   $$\text{Progress Score} = \begin{cases} 100\% & \text{if Achievement} = 0 \\ 0\% & \text{otherwise} \end{cases}$$
   *(Ideal for zero-incident, zero-downtime, or zero-defect target scenarios)*


### 📅 Check-in Schedule Enforcement
The portal enforces strict quarterly windows for achievement capture to ensure operational compliance. Both frontend forms and backend REST endpoints enforce the following timeline checks:

| Phase / Quarter | Month Range | Enforced Window Opens | Core Activities Enforced |
| :--- | :--- | :--- | :--- |
| **Phase 1: Goal Setting** | May - June | **1st May** | Drafting, Validation checks, & Manager Approvals |
| **Q1 Check-in** | July - September | **1st July** | Planned vs. Actual progress logs & Check-in reviews |
| **Q2 Check-in** | October - December | **1st October** | Planned vs. Actual progress logs & Check-in reviews |
| **Q3 Check-in** | January - February | **1st January** | Planned vs. Actual progress logs & Check-in reviews |
| **Q4 / Annual** | March - April | **1st March** | Final achievement capture, annual score compile |

#### 🔑 Schedule Bypass & Demo Mode
For continuous testing and demonstration purposes, the system incorporates a **Demo Override Mode**:
* **Client-side Toggle**: Available in the Quarterly Check-In UI header to bypass calendar schedule validation checks.
* **HTTP Header-based Enforcement**: Uses a custom `X-Bypass-Restrictions` header. If passed, the FastAPI backend allows recording logs outside of the standard fiscal dates.

---

## 🛠️ Architecture & Tech Stack

### Backend (Python)
*   **Framework**: FastAPI for fast, asynchronous endpoints.
*   **ORM**: SQLAlchemy 2.0 (with async capabilities).
*   **Database**: PostgreSQL (via `asyncpg`) or SQLite for light, local development.
*   **Security & Auth**: JWT-token based security (via `python-jose` and `passlib[bcrypt]`).
*   **Validation**: Pydantic v2 schemas and validation settings.

### Frontend (JavaScript/React)
*   **Scaffolding**: Vite 8 (Hot Module Replacement, fast bundle builds).
*   **Library**: React 19.
*   **Styling**: Modern, elegant, curated color palettes, tailored glassmorphism, dynamic micro-animations, and custom neumorphic layout shadows.
*   **Routing**: React Router DOM v7.
*   **Icons**: Lucide React.

---

## 🚀 Getting Started

### Prerequisites
*   [Python 3.10+](https://www.python.org/downloads/)
*   [Node.js 18+](https://nodejs.org/)

### 1. Backend Setup & Configuration
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure environment variables inside `backend/.env`:
    ```ini
    DATABASE_URL=sqlite+aiosqlite:///./goals.db
    JWT_SECRET=your-jwt-signing-secret-key-change-this
    PORT=5000
    ```
5.  Initialize the database schema:
    ```bash
    python init_db.py
    ```
6.  Seed default thrust areas and test user hierarchy:
    ```bash
    python run_seed.py
    python run_shared_kpi_migration.py
    ```
7.  Run the development server:
    ```bash
    uvicorn main:app --reload
    ```
    *   API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup & Configuration
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure local environment variables (if any) or double-check the local API routing configured in `frontend/src/api/`.
4.  Start the Vite local development server:
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to `http://localhost:5173`.

### 🔑 Demo & Testing Credentials
For evaluators to easily log in and test each role without manual registration, use the following pre-seeded credentials:

| Role | Email Address | Password | Department | Target Workspace View |
| :--- | :--- | :--- | :--- | :--- |
| **HR Admin** | `aashita@gmail.com` | `Password123` | *Global* | `/admin/dashboard` |
| **Manager** | `aashi@gmail.com` | `Password123` | Sales | `/manager/dashboard` |
| **Employee** | `bhavya@gmail.com` | `Password123` | Engineering | `/employee/dashboard` |

> [NOTE]
> * You can also create brand-new test accounts dynamically with any role (Employee, Manager, or Admin) using the **"Sign up"** page available at `http://localhost:5173/signup`.
> * Newly registered Employees can be mapped to Managers and departments by accessing the HR Admin's **User & Hierarchy Management** screen.

---


## 🛡️ Reporting & Governance Deliverables

The system incorporates robust regulatory compliance and governance tools matching audit-trail standards:


1. **📊 Exportable Achievement Report (CSV/Excel)**:
   * **Route**: `/api/admin/achievement-reports/export`
   * **Payload details**: Generates a dynamically formatted, downloadable CSV record capturing Employee Name, Email, Reporting Manager, Department, Thrust Area, Goal Title, Description, UOM, Weight (%), Targets, actual logged values across all quarters (Q1–Q4), computed progress scores, and goal locked states.
   * **Integration**: Accessed via a dedicated **"Export Achievement Reports (CSV)"** download widget on the HR Admin Reports & Governance Dashboard.
   * **How to Download (Admin/HR User)**:
     1. Log in to the platform with an authorized **HR Admin** account (e.g., email: `admin@company.com`, password: `Password123`).
     2. In the Admin sidebar/navigation panel, click on **"Reports & Governance"** (or go to `http://localhost:5173/admin/reports`).
     3. Scroll to the report options and locate the **"Export Achievement Reports (CSV)"** card.
     4. Click the button; the system will query all employees' goal sheet targets and quarterly achievements, format the data, and stream the file `achievement_report.csv` directly to your browser's download folder.


2. **📜 Secure Audit Trail System**:
   * **Post-Lock Governance**: Automatically logs overrides when goals are locked or unlocked.
   * **Information Captured**: Tracks Who (authorized HR Admin), What (Lock/Unlock sheet override), When (exact timestamp), and the previous vs. updated secure locking values.
   * **Database Persistence**: Saved in the `GoalAuditLog` table and displayed on the Admin's **System Audit Trail Timeline** screen.

---

## 🗄️ Database Entity-Relationship Overview

*   **`User`**: Core user accounts. Defines `role` (`Employee`, `Manager`, `Admin`), `reporting_manager_id` (forming the corporate reporting hierarchy tree), and department.
*   **`ThrustArea`**: Top-level corporate priorities (e.g., *Sales & Revenue*, *Product Innovation*, *Customer Excellence*).
*   **`SharedKPI`**: Master departmental KPIs pushed down by admins/managers, which cascade as read-only templates to employee goal sheets.
*   **`Goal`**: Individual employee objectives. Tracks fields like status (`Draft`, `Pending`, `Approved`, `Rejected`), `weight`, `target`, `uom` (numeric, %, timeline, zero-based), and links optionally to a `SharedKPI`.
*   **`GoalTask`**: Granular, action items managed by the employee to track how goals are being executed.
*   **`GoalCheckin`**: Periodic actual progress logged by employees, with corresponding feedback notes and check-in comments added by managers.
*   **`GoalAuditLog`**: Persistent audit log of all changes made to goals after the manager locks them. Captures who made the edit (authorizing HR/Admin user), what changed (previous vs. new values and details of the action), and exactly when (UTC timestamp).


