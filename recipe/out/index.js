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
const app = (0, express_1.default)();
const port = 4000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({ credentials: true, origin: ["http://127.0.0.1:5173"] }));
const recipes = {};
app.get("/:user_id/getrecipes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    console.log(user_id, "user_id");
    const userExists = helper.userExists(user_id);
    if (!userExists) {
        res.status(404).send("User does not exist");
        return;
    }
    try {
        const userRecipes = yield helper.getUserRecipes(user_id);
        console.log(userRecipes, "userRecipes");
        res.status(200).send(userRecipes);
        //sends back   {
        //     recipe_items: [ [Object], [Object] ],
        //     recipe_id: '19',
        //     recipe_name: 'abc'
        //   }
    }
    catch (err) {
        console.log(err);
    }
}));
app.post("/:user_id/recipes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recipe_name, recipe_items, recipe_cuisine, recipe_type } = req.body;
    console.log(recipe_name, recipe_items, recipe_cuisine, recipe_type, "recipe_name, recipe_items, recipe_cuisine, recipe_type");
    const user_id = parseInt(req.params.user_id);
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
    for (let i = 0; i < recipe_items.length; i++) {
        const { recipe_item } = recipe_items[i];
        yield helper.createRecipeItem(recipe.recipe_id, recipe_item);
    }
    const recipeItems = yield helper.getRecipeItems(recipe.recipe_id);
    yield axios_1.default.post("http://localhost:4005/events", {
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
    res.status(201).send({ recipe_id: recipe.recipe_id, recipe_name: recipe.recipe_name, recipe_cuisine: recipe.recipe_cuisine, recipe_type: recipe.recipe_type, recipe_items: recipeItems });
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
        yield helper.deleteRecipeItems(recipe_id);
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
