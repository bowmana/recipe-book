

import express, {Express,Request, Response} from "express";
import cors from "cors";

const app: Express = express();
const port: number = 4002;
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

app.post("/events", (req: Request, res: Response) => {
    const { type, data } = req.body;
    console.log("here2");
    if (type === "RecipeCreated") {
        const { id, recipe_name, recipe_items } = data;
        recipes[id] = {
            id,
            recipe_name,
            recipe_items
        };
    }

    if (type === "RecipeUpdated") {
        const { id, recipe_name, recipe_items } = data;
        recipes[id] = {
            id,
            recipe_name,
            recipe_items
        };
    }
    console.log(recipes);
    res.send({status: "OK"});
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    }
);
