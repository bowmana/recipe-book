// import axios, { AxiosError, AxiosResponse } from "axios";
// import express, { Express, Request, Response } from "express";
// import { Event } from "./event_types";
// import * as helper from "./helper";
// import cors from "cors";


// const app: Express = express();
// const port: number = 4003;
// app.use(express.json());
// app.use(cors());


// app.post("/events", async (req, res) => {
 
//     const event: Event = req.body;
//     console.log('Received Event', event.type);
//     if (event.type === "RecipeShared") {
//         console.log("RecipeShared", event.data);
//         res.redirect(307, '/recipeShared');

//         return;
//     }
//     res.send({});


// });

// app.post("/recipeShared", async (req, res) => {
//     const event: Event = req.body;
//     const user_id = parseInt(event.data.user_id);
//     const recipe_id = parseInt(event.data.recipe_id);
//     const {recipe_name, recipe_cuisine, recipe_type, recipe_description, recipe_items, recipe_images} = event.data;
//     console.log('Received Event', event.type);
//     console.log(event.data, 'event data');
    
//     try{
//         const userExists = await helper.userExists(user_id);
//         if (!userExists) {
//             res.status(404).send("User does not exist");
//             return;
//         }
//         const recipeExists = await helper.recipeExists(recipe_id);
//         if (!recipeExists) {
//             res.status(404).send("Recipe does not exist");
//             return;
//         }

//         // const recipeShared = await helper.recipeShared(user_id, recipe_id, recipe_name, recipe_cuisine, recipe_type, recipe_description, recipe_items, recipe_images);
//         // if (!recipeShared) {    
//         //     res.status(500).send("Recipe could not be shared");
//         //     return;
//         // }
//         // res.status(200).send("Recipe shared");
//     }
//     catch (err) {
//         console.log(err);
//     }
//     res.send({});
// });


// app.listen(port, () => {
//     console.log(`Listening on port ${port}`);
// }
// );
