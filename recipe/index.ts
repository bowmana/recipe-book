import axios, {AxiosError, AxiosResponse} from "axios";
import express, {Express,Request, Response} from "express";

import cors from "cors";
import { randomBytes } from "crypto";


const app: Express = express();
const port: number = 4000;
app.use(express.json());
app.use(cors({origin: true}));



const recipes: any = {};


app.get("/recipes", (req: Request, res: Response) => {
    res.send(recipes);
}
);

app.get("/edit-recipe", (req: Request, res: Response) => {
    res.send(recipes);
}
);

app.post("/recipes",async (req: Request, res: Response) => {

    const id = randomBytes(4).toString("hex");
    const { recipe_name, recipe_items } = req.body;
    recipes[id] = {
        id,
        recipe_name,
        recipe_items
    };

    console.log(recipes);
    await axios.post("http://localhost:4005/events", {
        type: "RecipeCreated",
        data: {
            id,
            recipe_name,
            recipe_items
        }
    });
    res.status(201).send(recipes[id]);
});
app.post('/events', (req: Request, res: Response) => {
    console.log('Received Event', req.body.type);
    res.send({});
});

//update recipe
app.post("/edit-recipe", async (req: Request, res: Response) => {
    const { id, recipe_name, recipe_items } = req.body;
    recipes[id] = {
        id,
        recipe_name,
        recipe_items
    };

    console.log(recipes);
    await axios.post("http://localhost:4005/events", {
        type: "RecipeUpdated",
        data: {
            id,
            recipe_name,
            recipe_items
        }
    });
    res.status(201).send(recipes[id]);
});




app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    });

