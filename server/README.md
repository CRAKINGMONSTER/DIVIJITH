Spring Boot backend scaffold for CryptoTracker.

Quick start:
1. Configure MySQL and create database `cryptotracker`.
2. Update `src/main/resources/application.properties` with DB credentials.
3. Build and run:

   mvn clean package
   java -jar target/cryptotracker-0.0.1-SNAPSHOT.jar

Notes:
- Endpoints are scaffolded; implement authentication, hashing, and proper JWT handling before production.
- The project includes a simple proxy controller to forward CoinGecko requests if needed.
