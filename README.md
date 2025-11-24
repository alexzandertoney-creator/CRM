# CRM Project

A Maven-based Java project for Customer Relationship Management.

---

## Prerequisites

Before running the project, make sure you have:

- Java JDK 8 or higher installed
- Maven installed
- Git installed (for cloning the repo)

---

## How to Clone the Project

Open CMD or Git Bash and run:

```bash
git clone https://github.com/alexzandertoney-creator/CRM.git
cd CRM

---
## How to run the Project

mvn clean install
mvn spring-boot:run

Run at:http://localhost:8080


Folder Structure
CRM/
├── pom.xml                # Maven project configuration
├── src/
│   ├── main/
│   │   ├── java/          # Your Java source code
│   │   └── resources/     # Config files (application.properties, etc.)
│   └── test/              # Unit tests
└── target/                # Build output (after mvn install)
