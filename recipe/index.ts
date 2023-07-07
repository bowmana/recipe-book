import axios, { AxiosError, AxiosResponse } from "axios";
import express, { Express, Request, Response } from "express";

import cors from "cors";
import { randomBytes } from "crypto";
import * as helper from "./helper";
import { Event, UserCreated, Recipe, RecipeItem } from "./event_types";
import { CloudFront, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { S3Bucket } from "./db/s3bucket";
import path from "path";


const s3Bucket = new S3Bucket();
s3Bucket.checkConnection();
// s3Bucket.updatePolicy();

import multer from "multer";
import  Redis from "ioredis";

interface CachedRecipeItem {
    recipe_item: string;
    portion_size: string;
    recipe_item_id: number;
  }
  
  interface CachedRecipe {
    recipe_items: CachedRecipeItem[];
    recipe_id: number;
    recipe_name: string;
    recipe_cuisine: string;
    recipe_type: string;
    recipe_images: string[];
  }


const app: Express = express();
const port: number = 4000;
const storage = multer.memoryStorage();
const upload = multer( { storage: storage} );
const cloudFront = new CloudFront({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
});



const redisURL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redisClient = new Redis(redisURL);
redisClient.on("error", (err) => {
    console.error("Error connecting to Redis:", err);
});



app.use(cors({ credentials: true, origin: ["http://127.0.0.1:5173"] 

}));
app.use(express.json());




const DEFAULT_EXPIRATION = 60 * 60 * 24;




function getOrSetCache(key: string, cb: () => Promise<CachedRecipe[]>): Promise<CachedRecipe[]> {
    return new Promise((resolve, reject) => {
      redisClient.get(key, async (err, data) => {
        if (err) return reject(err);
        if (data != null) {
          console.log('Cached data:', data);
          try {
            const parsedData = JSON.parse(data) as CachedRecipe[];
            return resolve(parsedData);
          } catch (error) {
            // Handle JSON parsing error
            return reject(error);
          }
        }
        const freshData = await cb();
        if (!freshData || freshData.length === 0) {
          // Handle empty fresh data here
          // For example, you can return an empty array
          return resolve([]);
        }
        redisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
        resolve(freshData);
      });
    });
  }
  


app.get("/:user_id/getrecipes", async (req: Request, res: Response) => {
    const user_id: number = parseInt(req.params.user_id);
    const userExists = await helper.userExists(user_id);
    if (!userExists) {
        res.status(404).send("User does not exist");
        return;
    }

    // const page: number = parseInt(req.query.page as string) || 1;
    // const limit: number = parseInt(req.query.limit as string) || 5;
    const page: number = parseInt(req.query.page as string);
    const limit: number = parseInt(req.query.limit as string);
    console.log(page, "page");
    console.log(limit, "limit");
    const cacheKey = `user:${user_id}:recipes`;
    console.log(cacheKey, "cacheKey");
    const cachedData= await getOrSetCache(cacheKey, async (): Promise<CachedRecipe[]> => {
   

        const userRecipes = await helper.getUserRecipes(user_id);
        console.log(userRecipes, "userRecipes-1");
        if (!userRecipes) {
            res.status(500).send("There was an error getting the recipes");
            return [];
        }
        

        console.log(userRecipes, "userRecipes-2");
        return userRecipes;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = cachedData.slice(startIndex, endIndex);
    const totalCount = cachedData.length;
    res.status(200).json({recipes: results, totalCount });
});



//upload the images to s3 bucket
app.post("/:user_id/recipes", upload.array("recipe_images"), async (req: Request, res: Response) => {

    const { recipe_name, recipe_cuisine, recipe_type, recipe_description}: { recipe_name: string, recipe_cuisine: string, recipe_type: string, recipe_description: string } = req.body;
    const recipe_items: RecipeItem[] = req.body.recipe_items;
    console.log(recipe_description, "recipe_description")
    

    console.log(recipe_items, "recipe_items");
    console.log(recipe_name, recipe_cuisine, recipe_type, "recipe_name, recipe_cuisine, recipe_type");

    const recipe_images: Express.Multer.File[] = req.files as Express.Multer.File[];


    const user_id: number = parseInt(req.params.user_id);

    try{
    const userExists = await helper.userExists(user_id);
    if (!userExists) {
        res.status(404).send("User does not exist");
        return;
    }


    const recipe = await helper.createRecipe(user_id, recipe_name, recipe_cuisine, recipe_type, recipe_description)
    if (!recipe) {
        res.status(500).send("There was an error creating the recipe");
        return;
    }


    const uploadPromises = recipe_images.map(async (recipe_image) => {
        const url = "https://d1uvjvhzktlyb3.cloudfront.net/" + path.basename(await s3Bucket.uploadFile(recipe_image));
        if (!url) {
          throw new Error("There was an error uploading the image");
        }
        await helper.createRecipeImage(recipe.recipe_id, url);
        return url;
      });
      let image_urls: string[];
      try {
        image_urls = await Promise.all(uploadPromises);
      } catch (err) {
        res.status(500).send("There was an error with Promis");
        return;
      }
  
    for (let i = 0; i < recipe_items.length; i++) {
        const { recipe_item, portion_size }: { recipe_item: string, portion_size: string } = recipe_items[i];
        try {

            await helper.createRecipeItem(recipe.recipe_id, recipe_item, portion_size);
        }
        catch (err) {
            console.log("Error creating recipe item: " + err);
        }
    }


    const recipeItems = await helper.getRecipeItems(recipe.recipe_id);
    console.log(recipeItems, "recipeItems");
    const cacheKey = `user:${user_id}:recipes`;
    await redisClient.del(cacheKey);
    const cachedData = await getOrSetCache(cacheKey, async (): Promise<CachedRecipe[]> => {
        const userRecipes = await helper.getUserRecipes(user_id);
        if (!userRecipes) {
            res.status(500).send("There was an error getting the recipes");
            return [];
        }
        return userRecipes;
    });

    if(!cachedData) {
        res.status(500).send("There was an error setting the cache");
        return;
    }

    await axios.post("http://localhost:4005/events", {
        type: "RecipeCreated",
        data: {
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name,
            recipe_cuisine: recipe.recipe_cuisine,
            recipe_type: recipe.recipe_type,
            recipe_items: recipeItems,
            recipe_images: image_urls

        }
    });

    res.status(201).send({ recipe_id: recipe.recipe_id, recipe_name: recipe.recipe_name, recipe_cuisine: recipe.recipe_cuisine, recipe_type: recipe.recipe_type, recipe_items: recipeItems, recipe_images: image_urls });
    }
    catch(err) {
        console.log(err);
        res.status(500).send("There was an error creating the recipe");
    }
});

app.get("/:user_id/cacheData", async (req: Request, res: Response) => {
    const user_id: number = parseInt(req.params.user_id);
    
    const { recipe_name, recipe_cuisine, recipe_type } = req.query as { recipe_name: string, recipe_cuisine: string, recipe_type: string };
    console.log(recipe_name, recipe_cuisine, recipe_type, "recipe_name, recipe_cuisine, recipe_type");
    const cacheKey = `user:${user_id}:recipes`;
  
    redisClient.get(cacheKey, (err, data) => {
      if (err) {
        console.error("Error retrieving cache data:", err);
        res.status(500).send("Error retrieving cache data");
        return;
      }
  
      if (data) {
        try {
          const cachedData = JSON.parse(data) as CachedRecipe[];
          let filteredRecipes : CachedRecipe[];
          if (recipe_name && recipe_cuisine && recipe_type) {
            filteredRecipes = cachedData.filter(
              (recipe) =>
                recipe.recipe_name.toLowerCase().includes(recipe_name.toLowerCase()) &&
                recipe.recipe_cuisine.toLowerCase().includes(recipe_cuisine.toLowerCase()) &&
                recipe.recipe_type.toLowerCase().includes(recipe_type.toLowerCase())
            );
          } else if (recipe_name && recipe_cuisine) {
            filteredRecipes = cachedData.filter(
              (recipe) =>
                recipe.recipe_name.toLowerCase().includes(recipe_name.toLowerCase()) &&
                recipe.recipe_cuisine.toLowerCase().includes(recipe_cuisine.toLowerCase())
            );
          } else if (recipe_name && recipe_type) {
            filteredRecipes = cachedData.filter(
              (recipe) =>
                recipe.recipe_name.toLowerCase().includes(recipe_name.toLowerCase()) &&
                recipe.recipe_type.toLowerCase().includes(recipe_type.toLowerCase())
            );
          } else if (recipe_cuisine && recipe_type) {
            filteredRecipes = cachedData.filter(
              (recipe) =>
                recipe.recipe_cuisine.toLowerCase().includes(recipe_cuisine.toLowerCase()) &&
                recipe.recipe_type.toLowerCase().includes(recipe_type.toLowerCase())
            );
          } else if (recipe_name) {
            filteredRecipes = cachedData.filter((recipe) =>
              recipe.recipe_name.toLowerCase().includes(recipe_name.toLowerCase())
            );
          } else if (recipe_cuisine) {
            filteredRecipes = cachedData.filter((recipe) =>
              recipe.recipe_cuisine.toLowerCase().includes(recipe_cuisine.toLowerCase())
            );
          } else if (recipe_type) {
            filteredRecipes = cachedData.filter((recipe) =>
              recipe.recipe_type.toLowerCase().includes(recipe_type.toLowerCase())
            );
          } else {
            filteredRecipes = cachedData;
          }
          


          console.log("Cached data:", cachedData);
            console.log("Filtered data:", filteredRecipes);
          res.status(200).json(filteredRecipes);
        } catch (error) {
          console.error("Error parsing cache data:", error);
          res.status(500).send("Error parsing cache data");
        }
      } else {
        res.status(404).send("Cache data not found");
      }
    });
  });
  



app.put("/:user_id/recipes/:recipe_id", upload.array("recipe_images"), async (req: Request, res: Response) => {

    const recipe_id: number = parseInt(req.params.recipe_id);
    const { recipe_name, recipe_cuisine, recipe_type }: { recipe_name: string; recipe_cuisine: string, recipe_type: string } = req.body;
    const recipe_items: RecipeItem[] = req.body.recipe_items;
    const user_id: number = parseInt(req.params.user_id);
   

    try {
        const recipeExists = await helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }

        const recipe_images: Express.Multer.File[] = req.files as Express.Multer.File[];
        console.log(recipe_images, "recipe_images yoo");
     
    

    
        const recipeImages = await helper.getRecipeImages(recipe_id);


        function getMissingImages() {
          // Extract the image URLs from recipe_images
          const existingImages = recipeImages.map((image) => image.recipe_image);
          const newImages = recipe_images.map((image) => image.originalname);
          const deletedImages = existingImages.filter((url) => !newImages.includes(url.split("/").pop()));
          return deletedImages;
        }
        const recipeImagesToDelete = getMissingImages();
    

        for (let i = 0; i < recipeImagesToDelete.length; i++) {
          const filename = recipeImagesToDelete[i].split("/").pop();
          console.log(filename, "filename");
          const invalidationParams = {
              DistributionId: process.env.DISTRIBUTION_ID,
              InvalidationBatch: {
            
                  CallerReference: `${filename}`,
                  Paths: {
                      Quantity: 1,
                      Items: [`/${filename}`]
                  }
              }
          };
          const invalidationCommand = new CreateInvalidationCommand(invalidationParams);
          try{
          await cloudFront.send(invalidationCommand);
          console.log("invalidated");
          }catch(error){
              console.log(error,"error invalidating");
          }
          try{
          await s3Bucket.deleteFile(filename);
          
          await helper.deleteRecipeImage(recipe_id, recipeImagesToDelete[i]);
          console.log("deleted from s3");
          }catch(error){

              console.log(error,"error deleting from s3");
          }
      

      }


        const uploadPromises = recipe_images.map(async (recipe_image) => {
          const cloudFrontDomain = "https://d1uvjvhzktlyb3.cloudfront.net/";

          const imageExists = await helper.imageExists(recipe_id, cloudFrontDomain + path.basename(recipe_image.originalname));
          if (imageExists) {
              console.log("image exists", cloudFrontDomain + path.basename(recipe_image.originalname));
              return;;
          }
          console.log("new image added")
          const url = "https://d1uvjvhzktlyb3.cloudfront.net/" + path.basename(await s3Bucket.uploadFile(recipe_image));
          if (!url) {
            throw new Error("There was an error uploading the image");
          }
          await helper.createRecipeImage(recipe_id, url);
          return url;
        });
        
        try {
          await Promise.all(uploadPromises);



        } catch (err) {
          res.status(500).send("There was an error with Promis");
          return;
        }
    

        const updatedRecipe = await helper.updateRecipe(recipe_id, recipe_name, recipe_cuisine, recipe_type, "dummy_recipe_description");
      
        await helper.deleteRecipeItems(recipe_id);

        for (let i = 0; i < recipe_items.length; i++) {
            const { recipe_item, portion_size } : { recipe_item: string, portion_size: string } = recipe_items[i];
            await helper.createRecipeItem(recipe_id, recipe_item, portion_size);
        }

        const updatedRecipeItems = await helper.getRecipeItems(recipe_id);

        const cacheKey = `user:${user_id}:recipes`;
        await redisClient.del(cacheKey);
        const cachedData = await getOrSetCache(cacheKey, async (): Promise<CachedRecipe[]> => {
            const userRecipes = await helper.getUserRecipes(user_id);
            if (!userRecipes) {
                res.status(500).send("There was an error getting the recipes");
                return [];
            }
            return userRecipes;
        });
    
        if(!cachedData) {
            res.status(500).send("There was an error setting the cache");
            return;
        }

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


const deleteRecipeImages = async (recipe_id: number) => {
    const recipeImages = await helper.getRecipeImages(recipe_id);
    console.log(recipeImages, "recipeImages");
    for (let i = 0; i < recipeImages.length; i++) {
      const { recipe_image } = recipeImages[i];
      const filename = recipe_image.split("/").pop();
      console.log(filename, "filename");
      const invalidationParams = {
          DistributionId: process.env.DISTRIBUTION_ID,
          InvalidationBatch: {
        
              CallerReference: `${filename}`,
              Paths: {
                  Quantity: 1,
                  Items: [`/${filename}`]
              }
          }
      };
      const invalidationCommand = new CreateInvalidationCommand(invalidationParams);
      try{
      await cloudFront.send(invalidationCommand);
      console.log("invalidated");
      }catch(error){
          console.log(error,"error invalidating");
      }
      try{
      await s3Bucket.deleteFile(filename);
      console.log("deleted from s3");
      }catch(error){

          console.log(error,"error deleting from s3");
      }
  }
}


// app.post("/recipes/:recipe_id/additem", async (req: Request, res: Response) => {
//     const recipe_id: number = parseInt(req.params.recipe_id);
//     const { recipe_item }: { recipe_item: string } = req.body;


//     try {
//         const recipeExists = await helper.recipeExists(recipe_id);
//         if (!recipeExists) {
//             res.status(404).send("Recipe does not exist for the user");
//             return;
//         }

//         const recipeItem = await helper.createRecipeItem(recipe_id, recipe_item);
//         if (!recipeItem) {
//             res.status(500).send("There was an error adding the recipe item");
//             return;
//         }
//         console.log(recipeItem, "recipeItem");
//         res.status(201).send(recipeItem);
//     } catch (error) {
//         res.status(500).send("Error adding the recipe item");
//     }
// });




app.post('/events', async (req: Request, res: Response) => {
    const event: Event = req.body;
    console.log('Received Event', event.type);
    if (event.type === "UserCreated") {
        console.log("UserCreated", event.data);
        res.redirect(307, '/usercreated');

        return;
    }
    res.send({});


});

app.post('/usercreated', async (req: Request, res: Response) => {
    const event: UserCreated = req.body;
    console.log(event, 'event is here on the usercreated route');
    const user_id: number = event.data.user_id;
    const email: string = event.data.email;
    console.log(typeof user_id, typeof email, 'user_id and email')


    if (!user_id || !email) {
        res.status(400).send('user_id or email is missing');
        return;
    }
    try {

        await helper.createUser(user_id, email);

        console.log('user created with id', user_id, 'and email', email);
        res.status(200).send({ user_id: user_id, email: email });

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
        const recipeImages = await helper.getRecipeImages(recipe_id);
        console.log(recipeImages, "recipeImages")
        res.status(200).send({
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name,
            recipe_items: recipeItems,
            recipe_cuisine: recipe.recipe_cuisine,
            recipe_type: recipe.recipe_type,
            recipe_images: recipeImages
        });
    } catch (error) {
        res.status(500).send("Error retrieving the recipe");
    }
});


//   .delete(`http://localhost:4000/recipes/${recipeId}`)
app.delete("/recipes/:user_id/delete/:recipe_id", async (req: Request, res: Response) => {
    const recipe_id: number = parseInt(req.params.recipe_id);
    const user_id: number = parseInt(req.params.user_id);

    if(!user_id || !recipe_id){
        res.status(400).send("user_id or recipe_id is missing");
        return;
    }

    try {
        const recipeExists = await helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }
     
       deleteRecipeImages(recipe_id);

        await helper.deleteRecipeItems(recipe_id);
        await helper.deleteRecipeImages(recipe_id);
        await helper.deleteUserRecipe(user_id, recipe_id);
        await helper.deleteRecipe(recipe_id);
        
        
            const cacheKey = `user:${user_id}:recipes`;
    await redisClient.del(cacheKey);
    const cachedData = await getOrSetCache(cacheKey, async (): Promise<CachedRecipe[]> => {
        const userRecipes = await helper.getUserRecipes(user_id);
        if (!userRecipes) {
            res.status(500).send("There was an error getting the recipes");
            return [];
        }
        return userRecipes;
    });

    if(!cachedData) {
        res.status(500).send("There was an error setting the cache");
        return;
    }



        res.status(200).send("Recipe deleted");
    } catch (error) {

        res.status(500).send("Error deleting the recipe");
    }
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

