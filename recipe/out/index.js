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
app.use((0, cors_1.default)({ credentials: true, origin: ["http://127.0.0.1:5173"]
}));
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
            if (!freshData || freshData.length === 0) {
                // Handle empty fresh data here
                // For example, you can return an empty array
                return resolve([]);
            }
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
    // const page: number = parseInt(req.query.page as string) || 1;
    // const limit: number = parseInt(req.query.limit as string) || 5;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    console.log(page, "page");
    console.log(limit, "limit");
    const cacheKey = `user:${user_id}:recipes`;
    console.log(cacheKey, "cacheKey");
    const cachedData = yield getOrSetCache(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
        const userRecipes = yield helper.getUserRecipes(user_id);
        console.log(userRecipes, "userRecipes-1");
        if (!userRecipes) {
            res.status(500).send("There was an error getting the recipes");
            return [];
        }
        console.log(userRecipes, "userRecipes-2");
        return userRecipes;
    }));
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = cachedData.slice(startIndex, endIndex);
    const totalCount = cachedData.length;
    res.status(200).json({ recipes: results, totalCount });
}));
//upload the images to s3 bucket
app.post("/:user_id/recipes", upload.array("recipe_images"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recipe_name, recipe_cuisine, recipe_type, recipe_description, u_name, original_u_name } = req.body;
    const u_id = parseInt(req.body.u_id);
    const original_u_id = parseInt(req.body.original_u_id);
    console.log(u_id, "u_id");
    const recipe_items = req.body.recipe_items;
    const recipe_instructions = req.body.recipe_instructions;
    console.log(recipe_description, "recipe_description");
    console.log(recipe_items, "recipe_items");
    console.log(recipe_name, recipe_cuisine, recipe_type, "recipe_name, recipe_cuisine, recipe_type");
    const recipe_images = req.files;
    console.log(recipe_images, "recipe_images");
    const user_id = parseInt(req.params.user_id);
    try {
        const userExists = yield helper.userExists(user_id);
        if (!userExists) {
            res.status(404).send("User does not exist");
            return;
        }
        const recipe = yield helper.createRecipe(user_id, recipe_name, recipe_cuisine, recipe_type, recipe_description, original_u_id, original_u_name, u_name, u_id);
        if (!recipe) {
            res.status(500).send("There was an error creating the recipe");
            return;
        }
        const uploadPromises = recipe_images.map((recipe_image) => __awaiter(void 0, void 0, void 0, function* () {
            const getUrl = () => __awaiter(void 0, void 0, void 0, function* () {
                if (yield s3Bucket.fileExists(`recipe-images/${recipe_image.originalname}`)) {
                    console.log("image exists", recipe_image.originalname);
                    return "https://d1uvjvhzktlyb3.cloudfront.net/recipe-images/" + path_1.default.basename(yield s3Bucket.duplicateFile(`recipe-images/${recipe_image.originalname}`)); //in the case where we add a recipe TO personal recipes FROM social recipes
                }
                else {
                    return "https://d1uvjvhzktlyb3.cloudfront.net/recipe-images/" + path_1.default.basename(yield s3Bucket.uploadFile(recipe_image)); //in the case where we simply add a recipe TO personal recipes
                }
            });
            const url = yield getUrl();
            console.log(url, "url");
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
            const { recipe_item, portion_size } = recipe_items[i];
            try {
                yield helper.createRecipeItem(recipe.recipe_id, recipe_item, portion_size);
            }
            catch (err) {
                console.log("Error creating recipe item: " + err);
            }
        }
        for (let i = 0; i < recipe_instructions.length; i++) {
            const { instruction, instruction_order } = recipe_instructions[i];
            try {
                console.log(instruction, "instruction");
                console.log(instruction_order, "instruction_order");
                yield helper.createInstruction(recipe.recipe_id, instruction, instruction_order);
            }
            catch (err) {
                console.log("Error creating instruction: " + err);
            }
        }
        const recipeItems = yield helper.getRecipeItems(recipe.recipe_id);
        const recipeInstructions = yield helper.getRecipeInstructions(recipe.recipe_id);
        console.log(recipeItems, "recipeItems");
        console.log(recipeInstructions, "recipeInstructions");
        const cacheKey = `user:${user_id}:recipes`;
        yield redisClient.del(cacheKey);
        const cachedData = yield getOrSetCache(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
            const userRecipes = yield helper.getUserRecipes(user_id);
            if (!userRecipes) {
                res.status(500).send("There was an error getting the recipes");
                return [];
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
                recipe_images: image_urls,
                u_id: recipe.u_id,
                u_name: recipe.u_name,
                original_u_id: recipe.original_u_id,
                original_u_name: recipe.original_u_name,
                recipe_instructions: recipeInstructions,
                recipe_description: recipe.recipe_description
            }
        });
        res.status(201).send({ recipe_id: recipe.recipe_id, recipe_name: recipe.recipe_name, recipe_cuisine: recipe.recipe_cuisine, recipe_type: recipe.recipe_type, recipe_items: recipeItems, recipe_images: image_urls, u_id: recipe.u_id, u_name: recipe.u_name, original_u_id: recipe.original_u_id, original_u_name: recipe.original_u_name, recipe_instructions: recipeInstructions, recipe_description: recipe.recipe_description });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("There was an error creating the recipe");
    }
}));
app.get("/:user_id/cacheData", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const { recipe_name, recipe_cuisine, recipe_type } = req.query;
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
                const cachedData = JSON.parse(data);
                let filteredRecipes;
                if (recipe_name && recipe_cuisine && recipe_type) {
                    filteredRecipes = cachedData.filter((recipe) => recipe.recipe_name.toLowerCase().includes(recipe_name.toLowerCase()) &&
                        recipe.recipe_cuisine.toLowerCase().includes(recipe_cuisine.toLowerCase()) &&
                        recipe.recipe_type.toLowerCase().includes(recipe_type.toLowerCase()));
                }
                else if (recipe_name && recipe_cuisine) {
                    filteredRecipes = cachedData.filter((recipe) => recipe.recipe_name.toLowerCase().includes(recipe_name.toLowerCase()) &&
                        recipe.recipe_cuisine.toLowerCase().includes(recipe_cuisine.toLowerCase()));
                }
                else if (recipe_name && recipe_type) {
                    filteredRecipes = cachedData.filter((recipe) => recipe.recipe_name.toLowerCase().includes(recipe_name.toLowerCase()) &&
                        recipe.recipe_type.toLowerCase().includes(recipe_type.toLowerCase()));
                }
                else if (recipe_cuisine && recipe_type) {
                    filteredRecipes = cachedData.filter((recipe) => recipe.recipe_cuisine.toLowerCase().includes(recipe_cuisine.toLowerCase()) &&
                        recipe.recipe_type.toLowerCase().includes(recipe_type.toLowerCase()));
                }
                else if (recipe_name) {
                    filteredRecipes = cachedData.filter((recipe) => recipe.recipe_name.toLowerCase().includes(recipe_name.toLowerCase()));
                }
                else if (recipe_cuisine) {
                    filteredRecipes = cachedData.filter((recipe) => recipe.recipe_cuisine.toLowerCase().includes(recipe_cuisine.toLowerCase()));
                }
                else if (recipe_type) {
                    filteredRecipes = cachedData.filter((recipe) => recipe.recipe_type.toLowerCase().includes(recipe_type.toLowerCase()));
                }
                else {
                    filteredRecipes = cachedData;
                }
                console.log("Cached data:", cachedData);
                console.log("Filtered data:", filteredRecipes);
                res.status(200).json(filteredRecipes);
            }
            catch (error) {
                console.error("Error parsing cache data:", error);
                res.status(500).send("Error parsing cache data");
            }
        }
        else {
            res.status(404).send("Cache data not found");
        }
    });
}));
app.put("/:user_id/recipes/:recipe_id", upload.array("recipe_images"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe_id = parseInt(req.params.recipe_id);
    const { recipe_name, recipe_cuisine, recipe_type, recipe_description, u_name } = req.body;
    const recipe_items = req.body.recipe_items;
    const recipe_instructions = req.body.recipe_instructions;
    const user_id = parseInt(req.params.user_id);
    const u_id = parseInt(req.body.u_id);
    try {
        const recipeExists = yield helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }
        const recipe_images = req.files;
        console.log(recipe_images, "recipe_images yoo");
        const recipeImages = yield helper.getRecipeImages(recipe_id);
        function getMissingImages() {
            // Extract the image URLs from recipe_images
            const existingImages = recipeImages.map((image) => image.recipe_image);
            const newImages = recipe_images.map((image) => image.originalname);
            console.log(existingImages, "existingImages");
            console.log(newImages, "newImages");
            const deletedImages = existingImages.filter((url) => !newImages.includes(url.split("/").pop()));
            return deletedImages;
        }
        const recipeImagesToDelete = getMissingImages();
        for (let i = 0; i < recipeImagesToDelete.length; i++) {
            const filename = 'recipe-images/' + recipeImagesToDelete[i].split("/").pop();
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
                console.log("invalidated");
            }
            catch (error) {
                console.log(error, "error invalidating");
            }
            try {
                yield s3Bucket.deleteFile(filename);
                yield helper.deleteRecipeImage(recipe_id, recipeImagesToDelete[i]);
                console.log("deleted from s3");
            }
            catch (error) {
                console.log(error, "error deleting from s3");
            }
        }
        const uploadPromises = recipe_images.map((recipe_image) => __awaiter(void 0, void 0, void 0, function* () {
            const cloudFrontDomain = "https://d1uvjvhzktlyb3.cloudfront.net/recipe-images/";
            const imageExists = yield helper.imageExists(recipe_id, cloudFrontDomain + path_1.default.basename(recipe_image.originalname));
            if (imageExists) {
                console.log("image exists", cloudFrontDomain + path_1.default.basename(recipe_image.originalname));
                return;
                ;
            }
            console.log("new image added");
            const url = "https://d1uvjvhzktlyb3.cloudfront.net/recipe-images/" + path_1.default.basename(yield s3Bucket.uploadFile(recipe_image));
            if (!url) {
                throw new Error("There was an error uploading the image");
            }
            yield helper.createRecipeImage(recipe_id, url);
            return url;
        }));
        try {
            yield Promise.all(uploadPromises);
        }
        catch (err) {
            res.status(500).send("There was an error with Promis");
            return;
        }
        const updatedRecipe = yield helper.updateRecipe(recipe_id, recipe_name, recipe_cuisine, recipe_type, recipe_description, u_id, u_name);
        yield helper.deleteRecipeItems(recipe_id);
        yield helper.deleteInstructions(recipe_id);
        for (let i = 0; i < recipe_items.length; i++) {
            const { recipe_item, portion_size } = recipe_items[i];
            yield helper.createRecipeItem(recipe_id, recipe_item, portion_size);
        }
        for (let i = 0; i < recipe_instructions.length; i++) {
            const { instruction, instruction_order } = recipe_instructions[i];
            yield helper.createInstruction(recipe_id, instruction, instruction_order);
        }
        const updatedRecipeItems = yield helper.getRecipeItems(recipe_id);
        const cacheKey = `user:${user_id}:recipes`;
        yield redisClient.del(cacheKey);
        const cachedData = yield getOrSetCache(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
            const userRecipes = yield helper.getUserRecipes(user_id);
            if (!userRecipes) {
                res.status(500).send("There was an error getting the recipes");
                return [];
            }
            return userRecipes;
        }));
        if (!cachedData) {
            res.status(500).send("There was an error setting the cache");
            return;
        }
        res.status(200).send({
            recipe_id: updatedRecipe.recipe_id,
            recipe_name: updatedRecipe.recipe_name,
            recipe_items: updatedRecipeItems,
            recipe_cuisine: updatedRecipe.recipe_cuisine,
            recipe_type: updatedRecipe.recipe_type,
            recipe_description: updatedRecipe.recipe_description,
            recipe_images: recipeImages,
            u_id: updatedRecipe.u_id,
            u_name: updatedRecipe.u_name,
        });
    }
    catch (error) {
        res.status(500).send("Error updating the recipe");
    }
}));
const deleteRecipeImages = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    const recipeImages = yield helper.getRecipeImages(recipe_id);
    console.log(recipeImages, "recipeImages");
    for (let i = 0; i < recipeImages.length; i++) {
        const { recipe_image } = recipeImages[i];
        const filename = 'recipe-images/' + recipe_image.split("/").pop();
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
            console.log("invalidated");
        }
        catch (error) {
            console.log(error, "error invalidating");
        }
        try {
            yield s3Bucket.deleteFile(filename);
            console.log("deleted from s3");
        }
        catch (error) {
            console.log(error, "error deleting from s3");
        }
    }
});
app.post('/events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    console.log('Received Event', event.type);
    if (event.type === "UserCreated") {
        console.log("UserCreated", event.data);
        res.redirect(307, '/usercreated');
        return;
    }
    if (event.type === "ProfileImageUpload") {
        console.log("ProfileImageUpload", event.data);
        res.redirect(307, '/profileimageupload');
        return;
    }
    if (event.type === 'UsernameUpdated') {
        const { user_id, user_name } = event.data;
        yield helper.updateUserName(user_id, user_name);
        res.status(200).send('Username updated');
        return;
    }
    if (event.type === 'EmailUpdated') {
        const { user_id, email } = event.data;
        yield helper.updateEmail(user_id, email);
        res.status(200).send('Email updated');
        return;
    }
    res.status(200).send('Event received');
    return;
}));
app.post('/usercreated', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    console.log(event, 'event is here on the usercreated route');
    const user_id = event.data.user_id;
    const email = event.data.email;
    const user_name = event.data.user_name;
    console.log(typeof user_id, typeof email, 'user_id and email');
    if (!user_id || !email || !user_name) {
        res.status(400).send('user_id or email is missing');
        return;
    }
    try {
        yield helper.createUser(user_id, email, user_name);
        console.log('user created with id', user_id, 'and email', email, 'and user_name', user_name);
        res.status(200).send({ user_id: user_id, email: email, user_name: user_name });
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
        const recipeInstructions = yield helper.getRecipeInstructions(recipe_id);
        const recipeImages = yield helper.getRecipeImages(recipe_id);
        console.log(recipeImages, "recipeImages");
        res.status(200).send({
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name,
            recipe_items: recipeItems,
            recipe_cuisine: recipe.recipe_cuisine,
            recipe_type: recipe.recipe_type,
            recipe_description: recipe.recipe_description,
            recipe_images: recipeImages,
            u_id: recipe.u_id,
            u_name: recipe.u_name,
            original_u_id: recipe.original_u_id,
            original_u_name: recipe.original_u_name,
            recipe_instructions: recipeInstructions
        });
    }
    catch (error) {
        res.status(500).send("Error retrieving the recipe");
    }
}));
app.post("/profileimageupload", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    console.log(event, 'event is here on the profileimageupload route');
    const user_id = parseInt(event.data.user_id);
    const profile_image = event.data.profile_image;
    console.log(typeof user_id, typeof profile_image, 'user_id and profile_image');
    const userExists = yield helper.userExists(user_id);
    if (!userExists) {
        res.status(404).send("User does not exist");
        return;
    }
    if (!user_id || !profile_image) {
        res.status(400).send('user_id or profile_image is missing');
        return;
    }
    try {
        yield helper.updateProfileImage(user_id, profile_image);
        console.log('profile image updated with id', user_id, 'and profile_image', profile_image);
        res.status(200).send({ user_id: user_id, profile_image: profile_image });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).send('There was an error updating the profile image');
        return;
    }
}));
//   .delete(`http://localhost:4000/recipes/${recipeId}`)
app.delete("/recipes/:user_id/delete/:recipe_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe_id = parseInt(req.params.recipe_id);
    const user_id = parseInt(req.params.user_id);
    if (!user_id || !recipe_id) {
        res.status(400).send("user_id or recipe_id is missing");
        return;
    }
    try {
        const recipeExists = yield helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }
        if (yield helper.recipeShared(user_id, recipe_id)) {
            console.log("recipe deleted, shared");
            yield helper.deleteSocialRecipe(user_id, recipe_id);
        }
        yield helper.deleteUserRecipe(user_id, recipe_id);
        deleteRecipeImages(recipe_id);
        yield helper.deleteRecipeItems(recipe_id);
        yield helper.deleteRecipeImages(recipe_id);
        yield helper.deleteRecipe(recipe_id);
        const cacheKey = `user:${user_id}:recipes`;
        yield redisClient.del(cacheKey);
        const cachedData = yield getOrSetCache(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
            const userRecipes = yield helper.getUserRecipes(user_id);
            if (!userRecipes) {
                res.status(500).send("There was an error getting the recipes");
                return [];
            }
            return userRecipes;
        }));
        if (!cachedData) {
            res.status(500).send("There was an error setting the cache");
            return;
        }
        res.status(200).send("Recipe deleted");
    }
    catch (error) {
        res.status(500).send("Error deleting the recipe");
    }
}));
//-------------------------------------Recipe social --------------------------------------------------
app.post("/recipes/:user_id/share/:recipe_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const recipe_id = parseInt(req.params.recipe_id);
    //insert into shared_recipes table and social_recipes table
    try {
        const recipeExists = yield helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }
        const recipeShared = yield helper.recipeShared(user_id, recipe_id);
        if (recipeShared) {
            console.log("Recipe already shared");
            return;
        }
        yield helper.insertSocialRecipe(user_id, recipe_id);
        //set the recipe as shared
        yield helper.setRecipeShared(recipe_id, true);
        //clear cache
        const cacheKey = `user:${user_id}:recipes`;
        yield redisClient.del(cacheKey);
        res.status(200).send("Recipe shared");
    }
    catch (error) {
        res.status(500).send("Error sharing the recipe");
    }
}));
app.get("/social-recipes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lastItemId = parseInt(req.query.lastItemId);
        const limit = parseInt(req.query.limit);
        const recipeName = req.query.recipe_name;
        const recipeCuisine = req.query.recipe_cuisine;
        const recipeType = req.query.recipe_type;
        console.log(lastItemId, "lastItemId");
        console.log(limit, "limit");
        console.log(recipeName, "recipeName");
        console.log(recipeCuisine, "recipeCuisine");
        console.log(recipeType, "recipeType");
        if ((recipeName !== null && recipeName !== void 0 ? recipeName : false) && (recipeCuisine !== null && recipeCuisine !== void 0 ? recipeCuisine : false) && (recipeType !== null && recipeType !== void 0 ? recipeType : false)) {
            console.log("all query params");
            const socialRecipes = yield helper.getSocialRecipesAfterId(lastItemId, limit, recipeName, recipeCuisine, recipeType);
            const totalCount = yield helper.getTotalSocialRecipesCount(recipeName, recipeCuisine, recipeType);
            console.log(socialRecipes, "socialRecipes all query params");
            console.log(totalCount, "totalCount all query params");
            res.status(200).send({
                recipes: socialRecipes,
                totalCount: totalCount,
            });
        }
        else if ((recipeName !== null && recipeName !== void 0 ? recipeName : false) && (recipeCuisine !== null && recipeCuisine !== void 0 ? recipeCuisine : false)) {
            const socialRecipes = yield helper.getSocialRecipesAfterId(lastItemId, limit, recipeName, recipeCuisine, undefined);
            const totalCount = yield helper.getTotalSocialRecipesCount(recipeName, recipeCuisine, undefined);
            console.log(socialRecipes, "socialRecipes name and cuisine");
            console.log(totalCount, "totalCount name and cuisine");
            res.status(200).send({
                recipes: socialRecipes,
                totalCount: totalCount,
            });
        }
        else if ((recipeName !== null && recipeName !== void 0 ? recipeName : false) && (recipeType !== null && recipeType !== void 0 ? recipeType : false)) {
            const socialRecipes = yield helper.getSocialRecipesAfterId(lastItemId, limit, recipeName, undefined, recipeType);
            const totalCount = yield helper.getTotalSocialRecipesCount(recipeName, undefined, recipeType);
            console.log(socialRecipes, "socialRecipes name and type");
            console.log(totalCount, "totalCount name and type");
            res.status(200).send({
                recipes: socialRecipes,
                totalCount: totalCount,
            });
        }
        else if (recipeCuisine !== undefined && recipeCuisine !== '' && recipeType !== undefined && recipeType !== '') {
            const socialRecipes = yield helper.getSocialRecipesAfterId(lastItemId, limit, undefined, recipeCuisine, recipeType);
            const totalCount = yield helper.getTotalSocialRecipesCount(undefined, recipeCuisine, recipeType);
            const checkCuisine = yield helper.recipeCuisineExists(recipeCuisine);
            const checkType = yield helper.recipeTypeExists(recipeType);
            console.log(checkCuisine, "checkCuisine");
            console.log(checkType, "checkType");
            console.log(socialRecipes, "socialRecipes cuisine and type");
            console.log(totalCount, "totalCount cuisine and type");
            res.status(200).send({
                recipes: socialRecipes,
                totalCount: totalCount,
            });
        }
        else if (recipeName !== null && recipeName !== void 0 ? recipeName : false) {
            console.log("recipeName only");
            const socialRecipes = yield helper.getSocialRecipesAfterId(lastItemId, limit, recipeName, undefined, undefined);
            const totalCount = yield helper.getTotalSocialRecipesCount(recipeName, undefined, undefined);
            console.log(socialRecipes, "socialRecipes name");
            console.log(totalCount, "totalCount name");
            res.status(200).send({
                recipes: socialRecipes,
                totalCount: totalCount,
            });
        }
        else if (recipeCuisine !== null && recipeCuisine !== void 0 ? recipeCuisine : false) {
            console.log("recipeCuisine only");
            const socialRecipes = yield helper.getSocialRecipesAfterId(lastItemId, limit, undefined, recipeCuisine, undefined);
            const totalCount = yield helper.getTotalSocialRecipesCount(undefined, recipeCuisine, undefined);
            console.log(socialRecipes, "socialRecipes cuisine");
            console.log(totalCount, "totalCount cuisine");
            res.status(200).send({
                recipes: socialRecipes,
                totalCount: totalCount,
            });
        }
        else if (recipeType !== null && recipeType !== void 0 ? recipeType : false) {
            const socialRecipes = yield helper.getSocialRecipesAfterId(lastItemId, limit, undefined, undefined, recipeType);
            const totalCount = yield helper.getTotalSocialRecipesCount(undefined, undefined, recipeType);
            console.log(socialRecipes, "socialRecipes type");
            console.log(totalCount, "totalCount type");
            res.status(200).send({
                recipes: socialRecipes,
                totalCount: totalCount,
            });
        }
        else {
            console.log("no query params");
            const socialRecipes = yield helper.getSocialRecipesAfterId(lastItemId, limit);
            const totalCount = yield helper.getTotalSocialRecipesCount();
            console.log(socialRecipes, "socialRecipes no query params");
            console.log(totalCount, "totalCount no query params");
            res.status(200).send({
                recipes: socialRecipes,
                totalCount: totalCount,
            });
        }
    }
    catch (error) {
        res.status(500).send("Error retrieving the social recipes");
    }
}));
app.get("/:user_id/getsharedrecipes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    try {
        const lastItemId = parseInt(req.query.lastItemId);
        const limit = parseInt(req.query.limit);
        const recipeName = req.query.recipe_name;
        const recipeCuisine = req.query.recipe_cuisine;
        const recipeType = req.query.recipe_type;
        console.log(lastItemId, "lastItemId");
        console.log(limit, "limit");
        console.log(recipeName, "recipeName");
        console.log(recipeCuisine, "recipeCuisine");
        console.log(recipeType, "recipeType");
        if ((recipeName !== null && recipeName !== void 0 ? recipeName : false) && (recipeCuisine !== null && recipeCuisine !== void 0 ? recipeCuisine : false) && (recipeType !== null && recipeType !== void 0 ? recipeType : false)) {
            console.log("all query params");
            const sharedRecipes = yield helper.getSharedRecipesAfterId(user_id, lastItemId, limit, recipeName, recipeCuisine, recipeType);
            const totalCount = yield helper.getTotalSharedRecipesCount(user_id, recipeName, recipeCuisine, recipeType);
            console.log(sharedRecipes, "sharedRecipes all query params");
            console.log(totalCount, "totalCount all query params");
            res.status(200).send({
                recipes: sharedRecipes,
                totalCount: totalCount,
            });
        }
        else if ((recipeName !== null && recipeName !== void 0 ? recipeName : false) && (recipeCuisine !== null && recipeCuisine !== void 0 ? recipeCuisine : false)) {
            const sharedRecipes = yield helper.getSharedRecipesAfterId(user_id, lastItemId, limit, recipeName, recipeCuisine, undefined);
            const totalCount = yield helper.getTotalSharedRecipesCount(user_id, recipeName, recipeCuisine, undefined);
            console.log(sharedRecipes, "sharedRecipes name and cuisine");
            console.log(totalCount, "totalCount name and cuisine");
            res.status(200).send({
                recipes: sharedRecipes,
                totalCount: totalCount,
            });
        }
        else if ((recipeName !== null && recipeName !== void 0 ? recipeName : false) && (recipeType !== null && recipeType !== void 0 ? recipeType : false)) {
            const sharedRecipes = yield helper.getSharedRecipesAfterId(user_id, lastItemId, limit, recipeName, undefined, recipeType);
            const totalCount = yield helper.getTotalSharedRecipesCount(user_id, recipeName, undefined, recipeType);
            console.log(sharedRecipes, "sharedRecipes name and type");
            console.log(totalCount, "totalCount name and type");
            res.status(200).send({
                recipes: sharedRecipes,
                totalCount: totalCount,
            });
        }
        else if (recipeCuisine !== undefined && recipeCuisine !== '' && recipeType !== undefined && recipeType !== '') {
            const sharedRecipes = yield helper.getSharedRecipesAfterId(user_id, lastItemId, limit, undefined, recipeCuisine, recipeType);
            const totalCount = yield helper.getTotalSharedRecipesCount(user_id, undefined, recipeCuisine, recipeType);
            const checkCuisine = yield helper.recipeCuisineExists(recipeCuisine);
            const checkType = yield helper.recipeTypeExists(recipeType);
            console.log(checkCuisine, "checkCuisine");
            console.log(checkType, "checkType");
            console.log(sharedRecipes, "sharedRecipes cuisine and type");
            console.log(totalCount, "totalCount cuisine and type");
            res.status(200).send({
                recipes: sharedRecipes,
                totalCount: totalCount,
            });
        }
        else if (recipeName !== null && recipeName !== void 0 ? recipeName : false) {
            console.log("recipeName only");
            const sharedRecipes = yield helper.getSharedRecipesAfterId(user_id, lastItemId, limit, recipeName, undefined, undefined);
            const totalCount = yield helper.getTotalSharedRecipesCount(user_id, recipeName, undefined, undefined);
            console.log(sharedRecipes, "sharedRecipes name");
            console.log(totalCount, "totalCount name");
            res.status(200).send({
                recipes: sharedRecipes,
                totalCount: totalCount,
            });
        }
        else if (recipeCuisine !== null && recipeCuisine !== void 0 ? recipeCuisine : false) {
            console.log("recipeCuisine only");
            const sharedRecipes = yield helper.getSharedRecipesAfterId(user_id, lastItemId, limit, undefined, recipeCuisine, undefined);
            const totalCount = yield helper.getTotalSharedRecipesCount(user_id, undefined, recipeCuisine, undefined);
            console.log(sharedRecipes, "sharedRecipes cuisine");
            console.log(totalCount, "totalCount cuisine");
            res.status(200).send({
                recipes: sharedRecipes,
                totalCount: totalCount,
            });
        }
        else if (recipeType !== null && recipeType !== void 0 ? recipeType : false) {
            const sharedRecipes = yield helper.getSharedRecipesAfterId(user_id, lastItemId, limit, undefined, undefined, recipeType);
            const totalCount = yield helper.getTotalSharedRecipesCount(user_id, undefined, undefined, recipeType);
            console.log(sharedRecipes, "sharedRecipes type");
            console.log(totalCount, "totalCount type");
            res.status(200).send({
                recipes: sharedRecipes,
                totalCount: totalCount,
            });
        }
        else {
            console.log("no query params");
            const sharedRecipes = yield helper.getSharedRecipesAfterId(user_id, lastItemId, limit);
            const totalCount = yield helper.getTotalSharedRecipesCount(user_id);
            console.log(sharedRecipes, "sharedRecipes no query params");
            console.log(totalCount, "totalCount no query params");
            res.status(200).send({
                recipes: sharedRecipes,
                totalCount: totalCount,
            });
        }
    }
    catch (error) {
        res.status(500).send("Error retrieving the social recipes");
    }
}));
// app.get("/:user_id/getsharedrecipes", async (req: Request, res: Response) => {
//     const user_id: number = parseInt(req.params.user_id);
//     try {
//         const page: number = parseInt(req.query.page as string) || 1;
//         const limit: number = parseInt(req.query.limit as string) || 10;
//         const offset: number = (page - 1) * limit;
//         const sharedRecipes = await helper.getPaginatedSharedRecipes(user_id, offset, limit);
//         const totalCount = await helper.getTotalSharedRecipesCount(user_id);
//         const totalPages = Math.ceil(totalCount / limit);
//         res.status(200).send({
//             recipes: sharedRecipes,
//             total_count: totalCount,
//             total_pages: totalPages
//         });
//     } catch (error) {
//         res.status(500).send("Error retrieving the shared recipes");
//     }
// });
// // await axios.delete(`http://localhost:4000/${user_id}/deletesharedrecipe/${recipe_id}`
app.delete("/:user_id/deletesharedrecipe/:recipe_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const recipe_id = parseInt(req.params.recipe_id);
    try {
        const recipeExists = yield helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist for the user");
            return;
        }
        const recipeShared = yield helper.recipeShared(user_id, recipe_id);
        if (!recipeShared) {
            res.status(404).send("Recipe is not shared");
            return;
        }
        yield helper.setRecipeShared(recipe_id, false);
        yield helper.deleteSocialRecipe(user_id, recipe_id);
        //delete from cache
        const cacheKey = `user:${user_id}:recipes`;
        yield redisClient.del(cacheKey);
        res.status(200).send("Recipe deleted");
    }
    catch (error) {
        res.status(500).send("Error deleting the recipe");
    }
}));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
