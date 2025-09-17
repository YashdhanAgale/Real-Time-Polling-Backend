Real-Time Polling App – Backend

This is the backend service for a real-time polling application.
It provides APIs for user authentication, poll creation, voting, and broadcasts live poll results using WebSockets.

🚀 Tech Stack

Node.js + Express

PostgreSQL (Supabase)

Prisma ORM

Socket.io (WebSockets)

⚙️ Setup

1. Clone the repo
   git clone <your-repo-url>
   cd backend

2. Install dependencies
   npm install

3. Configure environment variables

Create a .env file in the project root:

PORT=7777
JWT_SECRET="yash"
DATABASE_URL="postgresql://postgres:<your-password>@<your-supabase-host>:5432/postgres"

👉 Replace <your-password> and <your-supabase-host> with your Supabase values.

4. Push schema to database
   npx prisma generate
   npx prisma db push

5. Run the server
   npm run dev # if using nodemon

# or

node app.js

Server will start on:

http://localhost:7777

📌 API Endpoints
Auth

POST /auth/signup → create user

POST /auth/login → login user

POST /auth/logout → logout user

Polls

POST /poll → create a new poll (with options)

GET /poll/:id → get a poll with its options and votes

POST /poll/:id/vote → cast a vote

🔴 WebSockets

Clients connect via Socket.io

Join a poll room:

socket.emit("join_poll", pollId)

Receive live updates:

socket.on("poll_update", (data) => {
console.log("Updated poll:", data);
});
