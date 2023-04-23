"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 4002;
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true }));
const recipes = {};
app.get("/recipes", (req, res) => {
    res.send(recipes);
});
app.get("/edit-recipe", (req, res) => {
    res.send(recipes);
});
app.post("/events", (req, res) => {
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
    res.send({ status: "OK" });
});
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
