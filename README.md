# SteamFusion Frontend - React Application

The frontend layer of SteamFusion provides a modern, responsive user interface for data visualization and analytics. Built with React, TypeScript, and Material-UI, it delivers a seamless experience for exploring complex datasets through interactive dashboards and visualizations.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Code Quality Standards](#code-quality-standards)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose

The SteamFusion frontend is a comprehensive analytics dashboard application designed to:

- **Visualize Complex Data** - Transform raw data into intuitive, interactive visualizations
- **Enable Real-Time Insights** - Display live data updates with responsive UI updates
- **Provide Geographic Context** - Integrate map-based visualization for location-aware analytics
- **Support Advanced Analysis** - Offer 3D visualization and sophisticated charting capabilities
- **Ensure Accessibility** - Deliver a responsive, accessible experience across all devices

### Key Features

- **Interactive Dashboards** - Customizable dashboard layouts with drag-and-drop widgets
- **Real-Time Charts** - Dynamic charting with Recharts and MUI X-Chart
- **Geographic Visualization** - Map-based data visualization with Mapbox GL
- **3D Rendering** - Three-dimensional data visualization with Three.js
- **Type-Safe Development** - Full TypeScript support for enhanced reliability
- **Responsive Design** - Adaptive layouts for mobile, tablet, and desktop devices
- **State Management** - Efficient state management using MobX

---

## Prerequisites

### System Requirements

- **Node.js** - v16 or higher (v18+ recommended)
- **Package Manager** - PNPM v7+ (or NPM v8+)
- **Git** - Version control
- **Modern Browser** - Chrome, Firefox, Safari, or Edge (latest versions)

### Development Tools (Recommended)

- **Visual Studio Code** - Recommended IDE with extensions:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin
  - REST Client (for API testing)

- **Browser DevTools** - React DevTools and Redux DevTools extensions

### Backend Requirements

The frontend requires a running instance of the SteamFusion backend API. Ensure the backend is available at the configured API endpoint (default: `http://localhost:5181`).

---

## Installation

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

Using PNPM (recommended):

```bash
pnpm install
```

Or using NPM:

```bash
npm install
```

### Step 3: Configure Environment

Create or update the `.env` file in the frontend directory with backend API configuration:

```env
VITE_API_URL=http://localhost:5181
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

### Step 4: Verify Installation

Ensure all dependencies are properly installed:

```bash
pnpm run build
```

This should complete without errors.

---

## Development

### Starting the Development Server

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173` (Vite default development port).

Hot module reloading (HMR) is enabled by default, allowing real-time code updates without page refresh.

> **Note**: When deployed via Docker Compose, the frontend is accessible at port 8080.

### Available Development Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server with HMR (port 5173) |
| `pnpm run build` | Create production-optimized build |
| `pnpm run preview` | Preview production build locally |
| `pnpm run lint` | Run ESLint and check code quality |
| `pnpm run lint:fix` | Automatically fix ESLint issues |

### Development Workflow

1. **Start Backend** - Ensure SteamFusion backend API is running
2. **Start Frontend** - Execute `pnpm run dev`
3. **Access Application** - Navigate to `http://localhost:5173`
4. **Make Changes** - Edit source files; changes reload automatically
5. **Check Quality** - Run `pnpm run lint` before committing

### Debugging

#### Browser DevTools

- Open browser DevTools (F12 or Cmd+Option+I)
- Use Console tab to view logs and errors
- Use Network tab to inspect API calls
- Use Application/Storage tab to inspect local storage and cookies

#### React DevTools

Install the React DevTools browser extension for component inspection:
- Inspect component hierarchy
- View component props and state
- Trace component renders

#### VS Code Debugging

Configure `.vscode/launch.json` for debugging directly in VS Code:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend",
      "sourceMapPathOverride": {
        "/src/*": "${webRoot}/src/*"
      }
    }
  ]
}
```

---

## Build & Deployment

### Production Build

Create an optimized production build:

```bash
pnpm run build
```

The build process will:
- Compile TypeScript to JavaScript
- Minify and optimize bundle size
- Generate source maps for debugging
- Output files to the `dist` directory

### Preview Production Build

Test the production build locally:

```bash
pnpm run preview
```

### Docker Deployment

The frontend can be containerized for deployment:

1. **Build Docker Image**

   ```bash
   docker build -t steamfusion-frontend:latest .
   ```

2. **Run Container**

   ```bash
   docker run -p 8080:8080 steamfusion-frontend:latest
   ```

3. **Access Application**

   Navigate to `http://localhost:8080`

### Environment-Specific Configuration

Configure environment variables per deployment target:

**Development** (`.env.development`):
```env
VITE_API_URL=http://localhost:5181
VITE_ENV=development
```

**Staging** (`.env.staging`):
```env
VITE_API_URL=https://api-staging.example.com
VITE_ENV=staging
```

**Production** (`.env.production`):
```env
VITE_API_URL=https://api.example.com
VITE_ENV=production
```

---

## Project Structure

```
frontend/src/
├── components/              # Reusable React components
│   ├── common/             # Shared components (Header, Footer, etc.)
│   ├── dashboard/          # Dashboard-specific components
│   ├── charts/             # Chart components
│   └── layouts/            # Layout components
│
├── pages/                   # Page-level components (routes)
│   ├── Dashboard.tsx
│   ├── Analytics.tsx
│   └── NotFound.tsx
│
├── services/               # API clients and business logic
│   ├── api/               # Axios instance and API calls
│   ├── storage/           # Local storage utilities
│   └── mapbox/            # Mapbox service
│
├── stores/                 # MobX state management
│   ├── RootStore.ts
│   ├── DashboardStore.ts
│   └── AuthStore.ts
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useFetch.ts
│   └── useLocalStorage.ts
│
├── utils/                  # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── styles/                 # Global and component styles
│   ├── globals.scss
│   ├── variables.scss
│   └── mixins.scss
│
├── types/                  # TypeScript type definitions
│   ├── api.ts
│   ├── store.ts
│   └── models.ts
│
├── App.tsx                 # Root component
├── main.tsx               # Application entry point
└── vite-env.d.ts          # Vite environment types
```

---

## Technology Stack

### Core Framework

- **React 18+** - UI library for building components
- **TypeScript** - Type-safe JavaScript for enhanced reliability
- **Vite** - Modern build tool with lightning-fast HMR

### State Management

- **MobX** - Reactive state management with minimal boilerplate
- **MobX React** - MobX integration with React

### UI Framework

- **Material-UI (MUI)** - Comprehensive React component library
- **MUI System** - Sx prop for styling components
- **Emotion** - CSS-in-JS styling

### Data Visualization

- **Recharts** - Simple, composable React charting library
- **MUI X-Chart** - Advanced charting components
- **Mapbox GL** - Interactive map visualization
- **Three.js** - 3D graphics library

### HTTP & Data Handling

- **Axios** - Promise-based HTTP client
- **Vite** - Fast module bundler

### Development Tools

- **ESLint** - Code quality and style checking
- **Prettier** - Automatic code formatting [[memory:5976804]]
- **TypeScript** - Static type checking
- **Vite** - Development server and build tooling

---

## Code Quality Standards

### TypeScript Guidelines

- **Strict Mode** - Enable TypeScript strict mode for all files
- **Type Definitions** - Define types for all function parameters and return values
- **Interface Usage** - Use interfaces for object shapes and component props
- **Avoid Any** - Never use `any` type; use `unknown` or specific types instead

Example:

```typescript
interface DashboardProps {
  title: string;
  data: DataPoint[];
  onUpdate: (data: DataPoint[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ title, data, onUpdate }) => {
  // Component implementation
};
```

### Code Style

- **ESLint** - Run `pnpm run lint` to check code quality
- **Prettier** - Run `pnpm run lint:fix` to auto-format code
- **File Naming** - Use PascalCase for components, camelCase for utilities
- **Imports** - Group imports: React, third-party, local components, utilities

### Component Best Practices

- **Functional Components** - Use React hooks instead of class components
- **Prop Drilling** - Use MobX stores to avoid excessive prop drilling
- **Re-renders** - Use React.memo for expensive components
- **Side Effects** - Manage side effects with useEffect hooks
- **Custom Hooks** - Extract reusable logic into custom hooks

### State Management with MobX

- **Observables** - Use @observable for mutable state
- **Actions** - Wrap state modifications in @action methods
- **Computed** - Use @computed for derived state
- **Reactions** - Use reaction() for side effects based on state changes

---

## Troubleshooting

### Common Issues

#### Port Already in Use

If port 8080 is already in use:

```bash
# Use a different port
pnpm run dev -- --port 3000
```

Or kill the process using the port (Linux/macOS):

```bash
lsof -ti:8080 | xargs kill -9
```

#### Dependencies Not Installing

Clear node_modules and reinstall:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### API Connection Errors

Verify backend is running and accessible:

```bash
# Check if backend is running
curl http://localhost:5181/swagger

# Update API URL in .env if needed
VITE_API_URL=http://your-backend-url
```

#### Build Errors

Clean build and rebuild:

```bash
rm -rf dist
pnpm run build
```

Check for TypeScript errors:

```bash
pnpm run lint
```

#### Module Not Found Errors

Ensure all imports are correct and files exist:

```bash
# Verify import paths match actual file locations
# Check for case sensitivity issues (important on Linux/macOS)
```

#### Hot Module Reloading Not Working

Restart the development server:

```bash
# Stop the current server (Ctrl+C)
pnpm run dev
```

### Getting Help

1. Check browser console for error messages
2. Review network requests in browser DevTools
3. Verify backend API is running and responding
4. Check `.env` configuration
5. Review application logs in terminal
6. Consult TypeScript error messages for type issues

---

## Performance Optimization

### Bundle Analysis

Analyze bundle size:

```bash
pnpm run build -- --analyze
```

### Code Splitting

Implement route-based code splitting with React.lazy:

```typescript
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Image Optimization

- Use modern image formats (WebP)
- Lazy load images below the fold
- Optimize images before adding to project

### Component Memoization

Use React.memo for expensive components:

```typescript
const DataTable = React.memo(({ data }: DataTableProps) => {
  // Component implementation
});
```

---

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com)
- [MobX Documentation](https://mobx.js.org)
- [Vite Documentation](https://vitejs.dev)

---

**Version**: 2.0  
**Last Updated**: October 2025
