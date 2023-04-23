

import axios, {AxiosError, AxiosResponse} from "axios";
import express, {Express,Request, Response} from "express";
import logger from "morgan";


const app: Express = express();
const port: number = 4005;
app.use(express.json());

app.use(logger("dev"));

app.post("/events", (req, res) => {
    const event = req.body;

    axios.post("http://localhost:4000/events", event).catch((err) => {
        console.log(err.message);
    });

    axios.post("http://localhost:4002/events", event).catch((err) => {
        console.log(err.message);
    });
});





app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    });
    