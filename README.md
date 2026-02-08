# Integrated Pet Wellness and Service Platform

A comprehensive platform for pet owners, veterinarians, and service providers.

## Tech Stack
- **Backend**: Spring Boot (Maven)
- **Database**: MongoDB Atlas
- **Security**: Spring Security & JWT
- **Build Tool**: Maven

## Key Features
- **User Authentication**: Secure JWT-based registration and login.
- **Pet Profiles**: Comprehensive management of your pets.
- **Health Records**: Track medical history and vaccinations.
- **Appointment Scheduling**: Book and manage veterinary consultations.
- **Pet Marketplace**: Integrated store for pet products with stock management.

## Project Structure
- `backend/`: Spring Boot Application (Java 22)
- `docs/`: Technical documentation and setup guides.
- `postman/`: API test collections for all modules.

## Getting Started
1. Clone the repository.
2. Configure `application.properties` with your MongoDB Atlas string.
3. Run `mvn spring-boot:run` from the `backend/` directory.
4. Import the Postman collections from the `postman/` folder.
