import axios, {AxiosError, AxiosResponse} from "axios";
import express, {Express,Request, Response} from "express";

import cors from "cors";
import { randomBytes } from "crypto";
import * as helper from "./helper";
import { Event, UserCreated, Recipe, RecipeItem } from "./event_types";
import { parse } from "path";


const app: Express = express();
const port: number = 4000;
app.use(express.json());
app.use(cors({credentials: true, origin: ["http://127.0.0.1:5173"] }));



const recipes: any = {};


app.get("/:user_id/getrecipes", async (req: Request, res: Response) => {
    const user_id : number = parseInt(req.params.user_id);
    console.log(user_id, "user_id");
    const userExists = helper.userExists(user_id);
    if (!userExists) {
        res.status(404).send("User does not exist");
        return;
    }
    
   try{
    const userRecipes =await helper.getUserRecipes(user_id);
    console.log(userRecipes, "userRecipes");
    res.status(200).send(userRecipes);
    //sends back   {
//     recipe_items: [ [Object], [Object] ],
//     recipe_id: '19',
//     recipe_name: 'abc'
//   }
   }
    catch(err) {
        console.log(err);
    }
    
});



app.post("/:user_id/recipes",async (req: Request, res: Response) => {

  
    const { recipe_name, recipe_items, recipe_cuisine, recipe_type} : {recipe_name: string, recipe_items: RecipeItem[] , recipe_cuisine: string, recipe_type: string} = req.body;
    console.log(recipe_name, recipe_items, recipe_cuisine, recipe_type, "recipe_name, recipe_items, recipe_cuisine, recipe_type");
    const user_id : number = parseInt(req.params.user_id);

    const userExists = await helper.userExists(user_id);
    if (!userExists) {
        res.status(404).send("User does not exist");
        return;
    }

    const recipe= await helper.createRecipe(user_id, recipe_name, recipe_cuisine, recipe_type)
    if (!recipe) {
        res.status(500).send("There was an error creating the recipe");
        return;
    }
    for (let i = 0; i < recipe_items.length; i++) {
        const { recipe_item } = recipe_items[i];
        await helper.createRecipeItem(recipe.recipe_id, recipe_item);
    
    }
    const recipeItems = await helper.getRecipeItems(recipe.recipe_id);
    await axios.post("http://localhost:4005/events", {
        type: "RecipeCreated",
        data: {
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name,
            recipe_cuisine: recipe.recipe_cuisine,
            recipe_type: recipe.recipe_type,
            recipe_items: recipeItems
        }
    }).catch((err) => {
        console.log(err.message);
    });
    res.status(201).send({recipe_id: recipe.recipe_id, recipe_name: recipe.recipe_name, recipe_cuisine: recipe.recipe_cuisine, recipe_type: recipe.recipe_type, recipe_items: recipeItems});
});





app.put("/recipes/:recipe_id", async (req: Request, res: Response) => {
 
    const recipe_id: number = parseInt(req.params.recipe_id);
    const { recipe_name, recipe_items, recipe_cuisine, recipe_type }: { recipe_name: string; recipe_items: RecipeItem[] , recipe_cuisine: string, recipe_type: string} = req.body;
    console.log(recipe_items, "recieved recipe_items")

    try {
      const recipeExists = await helper.recipeExists(recipe_id);
      if (!recipeExists) {
        res.status(404).send("Recipe does not exist for the user");
        return;
      }
  
      const updatedRecipe = await helper.updateRecipe(recipe_id, recipe_name, recipe_cuisine, recipe_type);
  
      await helper.deleteRecipeItems(recipe_id);
  
      for (let i = 0; i < recipe_items.length; i++) {
        const { recipe_item } = recipe_items[i];
        await helper.createRecipeItem(recipe_id, recipe_item);
      }
  
      const updatedRecipeItems = await helper.getRecipeItems(recipe_id);
  
      res.status(200).send({
        recipe_id: updatedRecipe.recipe_id,
        recipe_name: updatedRecipe.recipe_name,
        recipe_items: updatedRecipeItems,
        recipe_cuisine: updatedRecipe.recipe_cuisine,
        recipe_type: updatedRecipe.recipe_type
      });
    } catch (error) {
      res.status(500).send("Error updating the recipe");
    }
  });
  


app.post("/recipes/:recipe_id/additem", async (req: Request, res: Response) => {
    const recipe_id: number = parseInt(req.params.recipe_id);
    const { recipe_item }: { recipe_item: string } = req.body;

    try {
        const recipeExists = await helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }

        const recipeItem = await helper.createRecipeItem(recipe_id, recipe_item);
        if (!recipeItem) {
            res.status(500).send("There was an error adding the recipe item");
            return;
        }
        console.log(recipeItem, "recipeItem");
        res.status(201).send(recipeItem);
    } catch (error) {
        res.status(500).send("Error adding the recipe item");
    }
});




app.post('/events', async (req: Request, res: Response) => {
    const event : Event = req.body;
    console.log('Received Event', event.type);
    if (event.type === "UserCreated") {
        console.log("UserCreated", event.data);
        res.redirect(307, '/usercreated');
        
        return;
    }
    res.send({});


});

app.post('/usercreated', async (req: Request, res: Response) => {
    const event : UserCreated = req.body;
    console.log(event, 'event is here on the usercreated route');
    const user_id : number = event.data.user_id;
    const email : string = event.data.email;
    console.log(typeof user_id, typeof email, 'user_id and email')

    
    if(!user_id || !email) {
        res.status(400).send('user_id or email is missing');
        return;
    }
    try{
        
         await helper.createUser(user_id, email);

        console.log('user created with id', user_id , 'and email', email);
        res.status(200).send({user_id: user_id, email: email});
        
        return;
    } catch (error) {
        console.log(error);
        res.status(500).send('There was an error creating the user');
        return;
    }
});

//get recipe by recipe_id
app.get("/recipes/:recipe_id", async (req: Request, res: Response) => {
    const recipe_id: number = parseInt(req.params.recipe_id);
  
    try {
      const recipe = await helper.getRecipeById(recipe_id);
      if (!recipe) {
        res.status(404).send("Recipe not found");
        return;
      }
  
      const recipeItems = await helper.getRecipeItems(recipe_id);
      res.status(200).send({
        recipe_id: recipe.recipe_id,
        recipe_name: recipe.recipe_name,
        recipe_items: recipeItems,
        recipe_cuisine: recipe.recipe_cuisine,
        recipe_type: recipe.recipe_type
      });
    } catch (error) {
      res.status(500).send("Error retrieving the recipe");
    }
  });


//   .delete(`http://localhost:4000/recipes/${recipeId}`)
app.delete("/recipes/delete/:recipe_id", async (req: Request, res: Response) => {
    const recipe_id: number = parseInt(req.params.recipe_id);

    try {
        const recipeExists = await helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }

        await helper.deleteRecipeItems(recipe_id);
        await helper.deleteRecipe(recipe_id);

        res.status(200).send("Recipe deleted");
    } catch (error) {

        res.status(500).send("Error deleting the recipe");
    }
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    });

