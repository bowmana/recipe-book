"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helper = __importStar(require("./helper"));
const client_cloudfront_1 = require("@aws-sdk/client-cloudfront");
const s3bucket_1 = require("./db/s3bucket");
const path_1 = __importDefault(require("path"));
const s3Bucket = new s3bucket_1.S3Bucket();
s3Bucket.checkConnection();
// s3Bucket.updatePolicy();
const multer_1 = __importDefault(require("multer"));
const ioredis_1 = __importDefault(require("ioredis"));
const app = (0, express_1.default)();
const port = 4000;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const cloudFront = new client_cloudfront_1.CloudFront({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const redisURL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redisClient = new ioredis_1.default(redisURL);
redisClient.on("error", (err) => {
    console.error("Error connecting to Redis:", err);
});
app.use((0, cors_1.default)({ credentials: true, origin: ["http://127.0.0.1:5173"] }));
app.use(express_1.default.json());
const DEFAULT_EXPIRATION = 60 * 60 * 24;
function getOrSetCache(key, cb) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, data) => __awaiter(this, void 0, void 0, function* () {
            if (err)
                return reject(err);
            if (data != null) {
                console.log('Cached data:', data);
                try {
                    const parsedData = JSON.parse(data);
                    return resolve(parsedData);
                }
                catch (error) {
                    // Handle JSON parsing error
                    return reject(error);
                }
            }
            const freshData = yield cb();
            redisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
            resolve(freshData);
        }));
    });
}
app.get("/:user_id/getrecipes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const userExists = yield helper.userExists(user_id);
    if (!userExists) {
        res.status(404).send("User does not exist");
        return;
    }
    const cacheKey = `user:${user_id}:recipes`;
    const cachedData = yield getOrSetCache(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
        const userRecipes = yield helper.getUserRecipes(user_id);
        if (!userRecipes) {
            res.status(500).send("There was an error getting the recipes");
            return;
        }
        return userRecipes;
    }));
    if (!cachedData) {
        res.status(500).send("There was an error getting the recipes");
        return;
    }
    res.status(200).send(cachedData);
}));
//upload the images to s3 bucket
app.post("/:user_id/recipes", upload.array("recipe_images"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recipe_name, recipe_cuisine, recipe_type } = req.body;
    const recipe_items = req.body.recipe_items;
    console.log(recipe_items, "recipe_items");
    console.log(recipe_name, recipe_cuisine, recipe_type, "recipe_name, recipe_cuisine, recipe_type");
    const recipe_images = req.files;
    const user_id = parseInt(req.params.user_id);
    try {
        const userExists = yield helper.userExists(user_id);
        if (!userExists) {
            res.status(404).send("User does not exist");
            return;
        }
        const recipe = yield helper.createRecipe(user_id, recipe_name, recipe_cuisine, recipe_type);
        if (!recipe) {
            res.status(500).send("There was an error creating the recipe");
            return;
        }
        const uploadPromises = recipe_images.map((recipe_image) => __awaiter(void 0, void 0, void 0, function* () {
            const url = "https://d1uvjvhzktlyb3.cloudfront.net/" + path_1.default.basename(yield s3Bucket.uploadFile(recipe_image));
            if (!url) {
                throw new Error("There was an error uploading the image");
            }
            yield helper.createRecipeImage(recipe.recipe_id, url);
            return url;
        }));
        let image_urls;
        try {
            image_urls = yield Promise.all(uploadPromises);
        }
        catch (err) {
            res.status(500).send("There was an error with Promis");
            return;
        }
        for (let i = 0; i < recipe_items.length; i++) {
            const recipe_item = recipe_items[i];
            try {
                yield helper.createRecipeItem(recipe.recipe_id, recipe_item);
            }
            catch (err) {
                console.log("Error creating recipe item: " + err);
            }
        }
        const recipeItems = yield helper.getRecipeItems(recipe.recipe_id);
        console.log(recipeItems, "recipeItems");
        const cacheKey = `user:${user_id}:recipes`;
        yield redisClient.del(cacheKey);
        const cachedData = yield getOrSetCache(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
            const userRecipes = yield helper.getUserRecipes(user_id);
            if (!userRecipes) {
                res.status(500).send("There was an error getting the recipes");
                return;
            }
            return userRecipes;
        }));
        if (!cachedData) {
            res.status(500).send("There was an error setting the cache");
            return;
        }
        yield axios_1.default.post("http://localhost:4005/events", {
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
    catch (err) {
        console.log(err);
        res.status(500).send("There was an error creating the recipe");
    }
}));
app.put("/recipes/:recipe_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe_id = parseInt(req.params.recipe_id);
    const { recipe_name, recipe_items, recipe_cuisine, recipe_type } = req.body;
    console.log(recipe_items, "recieved recipe_items");
    try {
        const recipeExists = yield helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }
        const updatedRecipe = yield helper.updateRecipe(recipe_id, recipe_name, recipe_cuisine, recipe_type);
        yield helper.deleteRecipeItems(recipe_id);
        for (let i = 0; i < recipe_items.length; i++) {
            const { recipe_item } = recipe_items[i];
            yield helper.createRecipeItem(recipe_id, recipe_item);
        }
        const updatedRecipeItems = yield helper.getRecipeItems(recipe_id);
        res.status(200).send({
            recipe_id: updatedRecipe.recipe_id,
            recipe_name: updatedRecipe.recipe_name,
            recipe_items: updatedRecipeItems,
            recipe_cuisine: updatedRecipe.recipe_cuisine,
            recipe_type: updatedRecipe.recipe_type
        });
    }
    catch (error) {
        res.status(500).send("Error updating the recipe");
    }
}));
app.post("/recipes/:recipe_id/additem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe_id = parseInt(req.params.recipe_id);
    const { recipe_item } = req.body;
    try {
        const recipeExists = yield helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }
        const recipeItem = yield helper.createRecipeItem(recipe_id, recipe_item);
        if (!recipeItem) {
            res.status(500).send("There was an error adding the recipe item");
            return;
        }
        console.log(recipeItem, "recipeItem");
        res.status(201).send(recipeItem);
    }
    catch (error) {
        res.status(500).send("Error adding the recipe item");
    }
}));
app.post('/events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    console.log('Received Event', event.type);
    if (event.type === "UserCreated") {
        console.log("UserCreated", event.data);
        res.redirect(307, '/usercreated');
        return;
    }
    res.send({});
}));
app.post('/usercreated', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    console.log(event, 'event is here on the usercreated route');
    const user_id = event.data.user_id;
    const email = event.data.email;
    console.log(typeof user_id, typeof email, 'user_id and email');
    if (!user_id || !email) {
        res.status(400).send('user_id or email is missing');
        return;
    }
    try {
        yield helper.createUser(user_id, email);
        console.log('user created with id', user_id, 'and email', email);
        res.status(200).send({ user_id: user_id, email: email });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).send('There was an error creating the user');
        return;
    }
}));
//get recipe by recipe_id
app.get("/recipes/:recipe_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe_id = parseInt(req.params.recipe_id);
    try {
        const recipe = yield helper.getRecipeById(recipe_id);
        if (!recipe) {
            res.status(404).send("Recipe not found");
            return;
        }
        const recipeItems = yield helper.getRecipeItems(recipe_id);
        res.status(200).send({
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name,
            recipe_items: recipeItems,
            recipe_cuisine: recipe.recipe_cuisine,
            recipe_type: recipe.recipe_type
        });
    }
    catch (error) {
        res.status(500).send("Error retrieving the recipe");
    }
}));
//   .delete(`http://localhost:4000/recipes/${recipeId}`)
app.delete("/recipes/delete/:recipe_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe_id = parseInt(req.params.recipe_id);
    try {
        const recipeExists = yield helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }
        const recipeImages = yield helper.getRecipeImages(recipe_id);
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
            const invalidationCommand = new client_cloudfront_1.CreateInvalidationCommand(invalidationParams);
            try {
                yield cloudFront.send(invalidationCommand);
            }
            catch (error) {
                console.log(error, "error invalidating");
            }
            try {
                yield s3Bucket.deleteFile(filename);
            }
            catch (error) {
                console.log(error, "error deleting from s3");
            }
        }
        yield helper.deleteRecipeItems(recipe_id);
        yield helper.deleteRecipeImages(recipe_id);
        yield helper.deleteRecipe(recipe_id);
        res.status(200).send("Recipe deleted");
    }
    catch (error) {
        res.status(500).send("Error deleting the recipe");
    }
}));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
