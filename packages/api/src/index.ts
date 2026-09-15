import express from "express";


const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;


app.get("/", (req, res) => {
    console.log("Request from the user...");
    return res.status(200).json({ success: true, message: "Hehe" });
});


app.listen(PORT, () => {
    console.log("Hello world");
});