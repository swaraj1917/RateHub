require("dotenv").config();

const app = require("./app");

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const prisma = require("./config/prisma");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`RateHub API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();