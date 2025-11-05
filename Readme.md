
## INSTRUCTION TO USE PRISMA ON YOUR NODEJS, MYSQL AND TYPESCRIPT APPLICATION

### 1. INSTALL DEPENDENCIES
##### . npm install prisma --save-dev
##### . npm install @prisma/client

### 2. CREATE PRISMA.CONFIG.TS FILE, .ENV FILE AND PRISMA/SCHEMA.PRISMA FILE
##### . npx prisma init 

### Note: 
##### Make sure to edit the prism/schema.prisma file to add the model and add dotenv to prisma.config.ts file before proceeding with step 3

### 3. RUN PRISMA MIGRATION
##### . npx prisma migration dev --name init
#### This will:
##### . Create a prisma/migrations folder
##### . Push your schema to the MySQL database
##### . Generate the Prisma client

### 4. REGENERATE PRISMA SCHEMA WHEN THE PRISMA/SCHEMA.PRIMA FILE IS EDITED
##### . npx prisma generate
#### Run npx prisma generate whenever you edit the code on the prisma/schema/prisma file to keep your client updated with your db models