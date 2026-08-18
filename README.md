# 🎓 GradeTracker

> **Full-Stack GPA Tracker & Simulator for BICT Students**
>
> An all-in-one CLI tool and modern Web Dashboard to track university courses, calculate semester and cumulative GPA on the Sri Lankan 4.0 scale, and project final graduation targets.

---

## ✨ Features

- 📚 **Course Management**: Add, update, set grades, and delete courses across multiple academic years and semesters.
- 🎯 **Sri Lankan 4.0 GPA Calculation**: Precise semester GPA and Cumulative Grade Point Average (CGPA) calculations.
- 🔮 **"What-If" GPA Projection**: Calculate required average GPA across remaining credits to reach target graduation CGPAs (e.g. First Class / Second Upper).
- 📊 **Interactive Web Dashboard**:
  - **GPA Trend Analysis**: Dynamic line chart tracking semester-by-semester and cumulative GPA progressions.
  - **Grade Distribution Chart**: Interactive doughnut chart breaking down letter grade distributions.
  - **Live Simulator**: Real-time final GPA calculator with achievability indicators.
- 💾 **Universal Isomorphic Storage**:
  - CLI persists data locally to JSON (`~/.gradetracker/data.json`).
  - Web dashboard uses `localStorage` for offline persistence.
- 📤 **Data Export**: Export academic records to **JSON** or **CSV** formats for backups or transcripts.

---

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| **Monorepo** | npm Workspaces, [Turborepo 2.x](https://turbo.build/) |
| **Core Engine** | TypeScript, [tsup](https://tsup.egoist.dev/) (dual ESM/CJS), [Vitest](https://vitest.dev/) |
| **CLI App** | [Commander.js](https://github.com/tj/commander.js), Chalk, Ora, Table |
| **Web Dashboard** | React 19, [Vite 5](https://vitejs.dev/), Chart.js, react-chartjs-2, Tailwind CSS |
| **Code Quality & CI** | [Biome](https://biomejs.dev/), TypeScript Compiler (`tsc`), GitHub Actions |

---

## 🚀 Quick Start

### 1. Installation

Clone repository and install dependencies:

```bash
git clone https://github.com/username/GradeTracker.git
cd GradeTracker
npm install
```

### 2. Build Packages

Build `@gradetracker/core`, `@gradetracker/cli`, and `@gradetracker/web`:

```bash
npm run build
```

---

## 💻 CLI Usage

You can run CLI commands using `npm run cli -- <command>` from the workspace root or by using the built binary:

### Available Commands

| Command | Description | Example |
|---|---|---|
| `add-course` | Add a new course record | `npm run cli -- add-course -c ICT143 -n "OOP" -s 1 -y 2025 -d 3 -g A` |
| `set-grade` | Set or update a course grade | `npm run cli -- set-grade ICT143 A+` |
| `calc-gpa` | Calculate cumulative or semester GPA | `npm run cli -- calc-gpa` |
| `project` | Project required GPA for remaining credits | `npm run cli -- project 3.7 30` |
| `list` | Display courses in formatted table | `npm run cli -- list` |
| `export` | Export course records to JSON or CSV | `npm run cli -- export -f csv -o grades.csv` |

### CLI Examples & Options

#### Add Course
```bash
# Add a completed course with grade
npm run cli -- add-course --code ICT143 --name "Object Oriented Programming" --semester 1 --year 2025 --credits 3 --grade A

# Add an in-progress course without grade
npm run cli -- add-course --code ICT144 --name "Data Structures & Algorithms" --semester 1 --year 2025 --credits 4
```

#### List Courses
```bash
# List all courses
npm run cli -- list

# Filter completed courses in Semester 1, Year 2025
npm run cli -- list -s 1 -y 2025 --completed
```

#### Calculate GPA
```bash
# Calculate Cumulative CGPA and semester breakdown
npm run cli -- calc-gpa

# Calculate GPA for a specific semester
npm run cli -- calc-gpa -s 1 -y 2025
```

#### Project Final GPA
```bash
# Target 3.70 CGPA with 30 remaining credits
npm run cli -- project 3.70 30
```

---

## 🌐 Web Dashboard

Start the local development server:

```bash
npm run dev:web
```

Open **`http://localhost:5173/`** in your browser to view the interactive dashboard.

---

## 📐 Sri Lankan 4.0 GPA Grading Scale

GradeTracker uses the standard Sri Lankan university grading scale:

| Letter Grade | Grade Point | Description |
|:---:|:---:|:---|
| **A+** | 4.00 | Excellent |
| **A** | 4.00 | Excellent |
| **A-** | 3.70 | Very Good |
| **B+** | 3.30 | Good |
| **B** | 3.00 | Good |
| **B-** | 2.70 | Satisfactory |
| **C+** | 2.30 | Satisfactory |
| **C** | 2.00 | Pass |
| **C-** | 1.70 | Pass |
| **D+** | 1.30 | Weak Pass |
| **D** | 1.00 | Weak Pass |
| **E** | 0.00 | Fail |
| **F** | 0.00 | Fail |

---

## 📂 Project Structure

```
GradeTracker/
├── packages/
│   ├── core/                  # Shared domain logic, types, and storage
│   │   ├── src/
│   │   │   ├── types.ts       # Grade scale, Course, and GPA interfaces
│   │   │   ├── gpa.ts         # Semester, CGPA, and Projection algorithms
│   │   │   ├── storage.ts     # Isomorphic Storage Adapters (Node/Browser/Memory)
│   │   │   └── index.ts       # Main export
│   │   └── package.json
│   │
│   ├── cli/                   # Commander CLI Application
│   │   ├── src/
│   │   │   ├── commands/      # add-course, set-grade, calc-gpa, project, etc.
│   │   │   └── index.ts       # CLI entry point
│   │   └── package.json
│   │
│   └── web/                   # React 19 + Vite Web Dashboard
│       ├── src/
│       │   ├── App.tsx        # Dashboard, Analytics Charts, Modals
│       │   ├── main.tsx       # Root React bootstrap
│       │   └── styles.css     # Theme & design tokens
│       ├── index.html
│       └── package.json
│
├── .github/workflows/         # CI Workflow (lint, typecheck, test, build)
├── biome.json                 # Biome formatter & linter configuration
├── turbo.json                 # Turborepo task pipeline
└── package.json               # Monorepo root configuration
```

---

## 🧪 Testing & Code Quality

Run tests, linting, and typechecking across all workspace packages:

```bash
# Run Vitest test suites
npm test

# Run Biome linter & formatting check
npm run lint

# Run TypeScript typechecks
npm run typecheck

# Format codebase
npx @biomejs/biome format --write .
```

---

## 📄 License

MIT © [GradeTracker Contributors](LICENSE)