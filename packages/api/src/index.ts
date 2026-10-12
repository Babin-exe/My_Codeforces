import express from "express";
import { authRouter } from "./routes/auth.route.ts";
import { errorHandler } from "./middleware/error.middleware.ts";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 4000;

app.use("/api/auth", authRouter);


app.get("/", (req, res) => {
    console.log("Request from the user...");
    return res.status(200).json({ success: true, message: "Hehe" });
});



app.use(errorHandler);

app.listen(PORT, () => {
    console.log("Hello world");
});
