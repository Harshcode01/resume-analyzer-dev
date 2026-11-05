require("dotenv").config();
const express = require("express");
const cors=require("cors");

const app = express();

const PORT = 4000;
require("./conn");

app.use(express.json());

app.use(cors({
  credentials:true,
  origin:process.env.FRONTEND_URL
}))


const UserRoutes = require("./Routes/user");
const ResumeRoutes=require("./Routes/resume")

app.use("/api/user", UserRoutes);
app.use("/api/resume",ResumeRoutes)

if (require.main === module) {
  app.listen(PORT, () => console.log("our backend is running ", PORT));
}

module.exports = app;