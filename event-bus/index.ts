

import axios, {AxiosError, AxiosResponse} from "axios";
import express, {Express,Request, Response} from "express";
import logger from "morgan";


const app: Express = express();
const port: number = 4005;
app.use(express.json());

app.use(logger("dev"));

app.post("/events", (req, res) => {
    const event = req.body;
    console.log("Event Received", event.type);
    if (event.type === "UserCreated") {
        console.log("Processing event", event.type);
        console.log(event.data);
       
    }

    res.status(200).send({});
});





app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    });
    