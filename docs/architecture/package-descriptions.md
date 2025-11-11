# Package Descriptions - TheTrois Backend

## Overview

This document describes all packages in the TheTrois Backend architecture and their responsibilities.

## Package Descriptions

| No  | Package           | Description                                                                                                                                                                                                                                                                   |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Entry & Config    | Application entry point and configuration management. Contains `index.js` (server bootstrap), `app.js` (Express app setup), and configuration files for database, authentication, logging, and external services.                                                             |
| 02  | API Layer         | RESTful API layer containing routes and controllers. Routes define API endpoints and apply middleware/validation. Controllers handle HTTP requests and responses, orchestrating service calls.                                                                                |
| 03  | Routes            | Express route definitions for all API endpoints (v1). Maps HTTP verbs and paths to controllers, applies authentication, validation, and rate limiting middleware.                                                                                                             |
| 04  | Controllers       | HTTP request handlers that receive client requests, validate input, call appropriate services, and return formatted responses. Includes auth, user, product, category, ingredient, topping, cart, and feedback controllers.                                                   |
| 05  | Services          | Business logic layer containing core application logic. Services interact with models, external APIs, and handle complex operations like authentication, email delivery, OTP generation, and data manipulation.                                                               |
| 06  | Data Layer        | Database abstraction layer using Mongoose ODM. Contains all MongoDB models (User, Product, Category, Ingredient, Topping, Cart, Feedback, Order, OTP, Token) and reusable plugins (pagination, toJSON).                                                                       |
| 07  | Models            | Mongoose schemas defining the structure of MongoDB documents. Each model includes validation rules, methods, statics, and pre/post hooks for data integrity and business rules.                                                                                               |
| 08  | Plugins           | Reusable Mongoose plugins: `paginate` (adds pagination to queries), `toJSON` (transforms documents for API responses, removes sensitive fields).                                                                                                                              |
| 09  | Cross-cutting     | Cross-cutting concerns that span multiple layers. Includes middlewares (authentication, validation, file upload, rate limiting), validations (Joi schemas), and utility functions.                                                                                            |
| 10  | Middlewares       | Express middleware functions for request processing. Includes JWT authentication, request validation, file upload handling (Multer), error handling, and rate limiting.                                                                                                       |
| 11  | Validations       | Joi validation schemas for request data validation. Defines rules for request body, query parameters, and URL parameters for all API endpoints.                                                                                                                               |
| 12  | Utils             | Utility functions and helpers used across the application. Includes ApiError (custom error class), catchAsync (async error wrapper), googleVerify (Google OAuth token verification), facebookVerify (Facebook OAuth token verification), and pick (object property selector). |
| 13  | User Interfaces   | Client applications that consume the backend API. Includes React Web UI (web application) and React Native App (mobile application for iOS/Android).                                                                                                                          |
| 14  | External Services | Third-party services and databases integrated with the backend. Includes MongoDB (primary database), Cloudinary (image storage), SMTP/Email (Nodemailer for email delivery), Google OAuth (social login), and Facebook OAuth (social login).                                  |
| 15  | MongoDB           | NoSQL document database (MongoDB Atlas or local instance). Stores all application data including users, products, orders, carts, feedback, and authentication tokens.                                                                                                         |
| 16  | Cloudinary        | Cloud-based image and video management service. Used for storing and serving product images, user avatars, and other media assets.                                                                                                                                            |
| 17  | SMTP / Email      | Email delivery service using Nodemailer with SMTP transport. Sends transactional emails including OTP codes, password reset links, and verification emails.                                                                                                                   |
| 18  | Google OAuth      | Google OAuth 2.0 authentication provider. Allows users to sign in using their Google accounts. Backend verifies ID tokens using google-auth-library.                                                                                                                          |
| 19  | Facebook OAuth    | Facebook OAuth authentication provider. Allows users to sign in using their Facebook accounts. Backend verifies access tokens using Facebook Graph API.                                                                                                                       |

## Package Dependencies

### Key Dependency Flows:

1. **UI → API Layer**: Client applications call REST API endpoints
2. **Routes → Validations → Controllers**: Routes validate input and delegate to controllers
3. **Controllers → Services**: Controllers orchestrate business logic through services
4. **Services → Models**: Services perform database operations through Mongoose models
5. **Services → External Services**: Services integrate with Cloudinary, SMTP, OAuth providers
6. **Middlewares**: Applied at route level for auth, validation, uploads, rate limiting

## Technology Stack

- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens), Passport.js, Google OAuth, Facebook OAuth
- **Validation**: Joi
- **Email**: Nodemailer
- **File Storage**: Cloudinary with Multer
- **Security**: Helmet, XSS-Clean, Express-Mongo-Sanitize, bcryptjs
- **API Documentation**: Swagger/OpenAPI

## Architecture Pattern

The backend follows a **layered architecture** pattern:

1. **Presentation Layer** (Routes, Controllers): Handles HTTP communication
2. **Business Logic Layer** (Services): Contains core business rules
3. **Data Access Layer** (Models): Manages database operations
4. **Cross-cutting Concerns** (Middlewares, Utils, Validations): Shared functionality

This separation ensures:

- Single Responsibility Principle
- Easy testing and maintenance
- Clear dependency flow
- Scalability and extensibility
