# IDE Environment Setup

Use the values from `.env.example` in your IDE run configuration.

Use `.env.current` if you want to reproduce the currently running local setup on port `8081` with in-memory H2.

## IntelliJ IDEA

1. Open `Run > Edit Configurations`.
2. Select your Spring Boot application configuration.
3. Find `Environment variables`.
4. Paste variables in this format:

```text
DB_URL=jdbc:mysql://localhost:3306/used_car_management?createDatabaseIfNotExist=true;DB_USERNAME=root;DB_PASSWORD=;JPA_DDL_AUTO=update;JPA_SHOW_SQL=false;JPA_FORMAT_SQL=false;SESSION_EXPIRATION_MINUTES=120;NOTIFICATION_EMAIL_ENABLED=false;NOTIFICATION_EMAIL_FROM=no-reply@usedcars.local;SMTP_HOST=localhost;SMTP_PORT=1025;SMTP_USERNAME=;SMTP_PASSWORD=;SMTP_AUTH=false;SMTP_STARTTLS=false

DB_URL=jdbc:mysql://usedcars-nirvikghosh03-f523.c.aivencloud.com:15089/defaultdb?sslMode=REQUIRED;DB_USERNAME=avnadmin;DB_PASSWORD=AVNS_aGG7a9sLqe6NVXQyUR9;JPA_DDL_AUTO=update;JPA_SHOW_SQL=true;JPA_FORMAT_SQL=true;SESSION_EXPIRATION_MINUTES=120;NOTIFICATION_EMAIL_ENABLED=true;NOTIFICATION_EMAIL_FROM=chopravicky16@gmail.com;SMTP_HOST=smtp.gmail.com;SMTP_PORT=587;SMTP_USERNAME=chopravicky16@gmail.com;SMTP_PASSWORD=hvrhqnzcrngypoup;SMTP_AUTH=true;SMTP_STARTTLS=true;LOG_FILE=log.txt

```

## Eclipse / Spring Tool Suite

1. Open `Run Configurations`.
2. Select your Spring Boot app under `Spring Boot App` or `Java Application`.
3. Go to the `Environment` tab.
4. Add each variable from `.env.example` as a separate entry.

## MySQL Example

For local MySQL, create the database user/password you want and update:

```text
DB_URL=jdbc:mysql://localhost:3306/used_car_management?createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=your_password
```

## Email Example

Email is disabled by default. To enable real mail, set:

```text
NOTIFICATION_EMAIL_ENABLED=true
NOTIFICATION_EMAIL_FROM=your_email@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_AUTH=true
SMTP_STARTTLS=true
```



