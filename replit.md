# Dating App - Full Stack Platform

## Overview

This is a comprehensive dating application built with a modern full-stack architecture. The platform features a detailed 7-step onboarding process that collects user preferences, interests, lifestyle choices, and relationship goals to enable intelligent matching. The application uses React with TypeScript for the frontend, Express.js for the backend API, and PostgreSQL with Drizzle ORM for data persistence. The UI is built using shadcn/ui components with Radix UI primitives and styled with Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with **React 18** and **TypeScript**, utilizing modern patterns and best practices. The application uses **Wouter** for lightweight client-side routing instead of React Router, providing a minimal footprint. State management is handled through React's built-in hooks with **TanStack Query** (React Query) for server state management, caching, and synchronization. The component architecture follows a modular approach with reusable UI components built on top of **Radix UI** primitives and styled with **Tailwind CSS**. The application is bundled with **Vite** for fast development and optimized production builds.

### Backend Architecture
The server follows a **RESTful API** architecture built with **Express.js** and **TypeScript**. The application uses a modular structure with separate concerns for routing, database operations, and business logic. The storage layer is abstracted through an interface pattern, allowing for flexibility in data access implementations. File uploads are handled through **Multer** middleware with proper validation and storage management. The server includes comprehensive error handling and logging middleware for debugging and monitoring.

### Database Design
The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations. The schema is designed to support complex user profiles with separate tables for different aspects of user data: basic profiles, interests, lifestyle preferences, values and beliefs, dealbreakers, partner preferences, and photo storage. The database uses proper foreign key relationships and supports the complete onboarding flow data structure. Drizzle provides compile-time type safety and excellent developer experience with automatic migrations.

### Authentication & Session Management
The current implementation includes placeholder authentication middleware that can be easily replaced with production-ready authentication systems. The architecture supports session-based or JWT-based authentication patterns. The Express server is configured with session middleware using PostgreSQL session storage for scalability.

### UI/UX Design System
The application implements a comprehensive design system using **shadcn/ui** components, which provide a consistent and accessible user interface. The design system includes custom components for the onboarding flow, form handling with **React Hook Form**, and **Zod** for schema validation. The UI supports responsive design patterns and includes proper accessibility features through Radix UI primitives.

### File Handling & Storage
Photo uploads are managed through a structured system that validates file types and sizes, processes uploads through Multer middleware, and stores metadata in the database. The system supports multiple photo uploads per user with proper ordering and validation.

## External Dependencies

### Core Framework Dependencies
- **Neon Database**: Serverless PostgreSQL database hosting with WebSocket support for real-time features
- **Drizzle ORM**: Type-safe ORM for PostgreSQL with automatic migrations and excellent TypeScript integration
- **TanStack Query**: Powerful data synchronization library for server state management, caching, and background updates

### UI/UX Libraries
- **Radix UI**: Comprehensive set of low-level UI primitives providing accessibility and keyboard navigation
- **shadcn/ui**: Pre-built component library built on Radix UI with consistent styling and behavior
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent design systems
- **Lucide React**: Modern icon library providing scalable SVG icons

### Development & Build Tools
- **Vite**: Fast build tool and development server with Hot Module Replacement (HMR)
- **TypeScript**: Static type checking for enhanced developer experience and code quality
- **React Hook Form**: Performant form library with minimal re-renders and excellent validation support
- **Zod**: Schema validation library for runtime type checking and form validation

### Server Dependencies
- **Express.js**: Web application framework for Node.js providing robust HTTP server capabilities
- **Multer**: Middleware for handling multipart/form-data for file uploads
- **ws**: WebSocket library for real-time communication features

### Location Services
The application includes a location service system designed to handle country, state, and city selection through cascading dropdowns. The current implementation uses mock data but is structured to easily integrate with external location APIs or services.