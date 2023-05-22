

import axios, {AxiosError, AxiosResponse} from "axios";
import express, {Express,Request, Response} from "express";
import logger from "morgan";
import cors from "cors";


const app: Express = express();
const port: number = 4005;
app.use(express.json());
app.use(cors());

app.use(logger("dev"));


app.post("/events", async (req, res) => {
    const event = req.body;
    console.log("Event Received", event.type);
    console.log(event.data, 'event data');
    if (event.type === "UserCreated") {
        try{
            if(!event.data.user_id || !event.data.email) {
                res.status(400).send('user_id or email is missing');
            }
            // if(typeof event.data.user_id !== 'number' || typeof event.data.email !== 'string') {
            //     console.log(typeof event.data.user_id, typeof event.data.email, 'user_id and email')
            //     res.status(400).send('user_id or email is not the correct type');
            // }


            await axios.post("http://localhost:4000/events", event);
            console.log("Event sent to recipe service");
        }
        catch (err) {
            console.log(err);
        }
   
   
         
        



       
    }

    res.status(200).send({});
});





app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    });
    