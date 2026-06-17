# Task Manager API

Created by: **Gabriel Restrepo**

## About this project

Task Manager API is a production-ready backend application built with Node.js, Express, PostgreSQL, and Prisma ORM.

The application allows users to securely manage personal tasks through a RESTful API. Users can register, authenticate, create and organize tasks, perform bulk operations, access analytics endpoints, and manage deleted items through a soft-delete trash system.

The project demonstrates modern backend development practices including authentication, authorization, validation, automated testing, database migrations, cloud deployment, and security protections.

---

## Tech Stack

### Backend

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM

### Security

* JWT Authentication
* HttpOnly Cookies
* CSRF Protection
* Helmet
* XSS Protection
* bcrypt Password Hashing
* Google reCAPTCHA

### Testing

* Jest
* Supertest
* node-mocks-http

### Deployment

* Neon PostgreSQL
* Render

### Development Tools

* Postman
* Git
* GitHub
* VS Code

---

## Features

### User Authentication

* User registration
* User login
* User logout
* JWT-based authentication
* Secure cookie-based sessions
* Password hashing with bcrypt
* Google reCAPTCHA verification

### Task Management

* Create tasks
* View tasks
* Update tasks
* Delete tasks
* Task ownership validation
* Pagination support
* Search functionality
* Priority levels
* Completion tracking

### Bulk Operations

* Bulk task creation
* Bulk task updates
* Bulk task deletion

### Trash Bin System

Instead of permanently deleting records, tasks are moved to a trash state.

Features include:

* Soft delete functionality
* Trash filtering
* Viewing trashed tasks
* Bulk trash operations

### Analytics

* User statistics
* Task analytics
* Search endpoints
* Aggregated reporting data

### Security Features

* Protected routes
* JWT verification middleware
* CSRF token validation
* Ownership authorization checks
* Security headers with Helmet
* XSS protection
* Input validation using Joi schemas

---

## Database Design

### Users

The `users` table stores account information and authentication data for registered users. 
It includes the user's unique email, display name, securely hashed password, and account creation timestamp. 
In Prisma, this model is named `User`, but in the database it is mapped to the `users` table.

### Tasks

Stores task information including:

* Title
* Priority
* Completion status
* Trash status
* Ownership relationship through `user_id`
* Creation timestamp

Each task belongs to one user through the `user_id` foreign key, which references `users.id`.

### Relationship 

The database uses a one-to-many relationship: 

```txt 
users 1 ──────────────── * tasks
```

One user can have many tasks, but each task belongs to only one user.

This relationship allows the backend to filter tasks by user_id, making sure users can only access, update, complete, trash, or delete their own tasks.

---

## API Endpoints

### Authentication

| Method | Endpoint            |
| ------ | ------------------- |
| POST   | /api/users/register |
| POST   | /api/users/logon    |
| POST   | /api/users/logoff   |

### Tasks

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /api/tasks     |
| GET    | /api/tasks     |
| GET    | /api/tasks/:id |
| PATCH  | /api/tasks/:id |
| DELETE | /api/tasks/:id |

### Bulk Operations

| Method | Endpoint        |
| ------ | --------------- |
| POST   | /api/tasks/bulk |
| PATCH  | /api/tasks/bulk |
| DELETE | /api/tasks/bulk |

### Analytics

| Method | Endpoint                    |
| ------ | --------------------------- |
| GET    | /api/analytics/users        |
| GET    | /api/analytics/users/stats  |
| GET    | /api/analytics/tasks/search |

---

## Testing

The application includes comprehensive automated testing covering:

* Validation schemas
* Controllers
* Authentication flows
* Protected routes
* Authorization checks
* API endpoints
* Error handling

---

## Deployment

### Live API

https://node-homework-89.onrender.com

### Database

Hosted on Neon PostgreSQL.

---

## Key Skills Demonstrated

* REST API Design
* Authentication & Authorization
* Database Design
* Prisma ORM
* PostgreSQL
* Security Best Practices
* Automated Testing
* Cloud Deployment
* Backend Architecture
* Error Handling
* Data Validation
* API Development
