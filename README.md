# Employee Diary Application

A React application for managing employee activities and records.

## Features

- View employee activities and records
- Filter activities by employee, category, or search terms
- Add new activity records
- Edit and delete existing records
- Sync with external systems (simulated)

## Tech Stack

- React with TypeScript
- Vite for frontend build and development
- Tailwind CSS for styling
- React Hook Form with Zod for form validation
- JSON Server for mock API

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the Development Server

This project uses JSON Server to simulate a backend API with the data from `db.json`.

1. Start the mock API server:

```bash
npm run mock-api
# or
yarn mock-api
```

This will start a server on http://localhost:3001

2. In a separate terminal, start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the Vite development server.

## API Endpoints

The mock API provides the following endpoints:

- `GET /employees` - List all employees
- `GET /activities` - List all activities
- `GET /activities?employeeId={id}` - List activities for a specific employee
- `POST /activities` - Create a new activity
- `PUT /activities/{id}` - Update an activity
- `DELETE /activities/{id}` - Delete an activity
- `GET /sync-status` - Get sync status for all sources

## Project Structure

- `src/components/` - Reusable React components
- `src/pages/` - Main pages of the application
- `src/services/` - Service layers for API interactions
- `src/types/` - TypeScript type definitions
- `src/config/` - Application configuration
- `db.json` - Mock database used by JSON Server
