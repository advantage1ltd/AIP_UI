# Advantage One Interactive Portal (AIP)

Advantage One Interactive Portal (AIP) is an advanced, full-featured crime and incident management software designed to streamline and automate various aspects of incident reporting, management, and follow-up. Built as an API-centric solution, AIP leverages a modern technology stack including React, Vite, .NET (with Entity Framework), and MSSQL for robust, scalable, and high-performance functionality across various modules.

## Key Features

### Crime & Incident Management
- Capture, track, and resolve incidents efficiently
- Enhanced user workflows
- Comprehensive incident tracking system

### CRM (Customer Relationship Management)
- Manage client interactions
- Track communication
- Ensure smooth information flow

### CBT (Computer-Based Training)
- Implement training programs for personnel
- Ensure staff are properly equipped to handle incidents

### Additional Features
- Incident Reporting
- Satisfaction Surveys
- Advanced Reporting
- Stock Management
- Recruitment Management
- Holiday Management

## Technologies Used

### Frontend
- React with TypeScript
- Vite for fast, modern development
- TailwindCSS for styling
- React Hook Form with Zod for validation

### Backend
- .NET – Robust and scalable API
- Entity Framework for ORM
- MSSQL Database
- CORS enabled for secure cross-origin requests

## Getting Started

### Prerequisites
- Node.js 18 or later
- .NET SDK
- MSSQL Server
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dibanga2800/aip.git
```

2. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

3. Install Backend Dependencies:
```bash
cd backend
dotnet restore
```

### Configuration

1. Database Setup:
- Configure your MSSQL connection string in `appsettings.json`
- Update any necessary database migrations using Entity Framework

2. CORS Configuration:
- CORS is enabled to allow cross-origin requests
- Update CORS policy in backend if needed

### Running the Application

1. Start the Backend:
```bash
cd backend
dotnet run
```

2. Start the Frontend:
```bash
cd frontend
npm run dev
```

## Project Structure

- `frontend/` - React application with Vite
  - `src/components/` - Reusable React components
  - `src/pages/` - Main application pages
  - `src/services/` - API service layers
  - `src/types/` - TypeScript type definitions

- `backend/` - .NET API
  - `Controllers/` - API endpoints
  - `Models/` - Entity Framework models
  - `Services/` - Business logic
  - `Data/` - Database context and migrations

## Contributing

We welcome contributions to improve AIP. Please feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Contact

For questions or support:
- Open an issue on GitHub
- Email: dibanga2800@gmail.com

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
