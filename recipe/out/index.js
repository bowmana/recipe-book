"use strict";
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
const crypto_1 = require("crypto");
const app = (0, express_1.default)();
const port = 4000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true }));
const recipes = {};
app.get("/recipes", (req, res) => {
    res.send(recipes);
});
app.get("/edit-recipe", (req, res) => {
    res.send(recipes);
});
app.post("/recipes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = (0, crypto_1.randomBytes)(4).toString("hex");
    const { recipe_name, recipe_items } = req.body;
    recipes[id] = {
        id,
        recipe_name,
        recipe_items
    };
    console.log(recipes);
    yield axios_1.default.post("http://localhost:4005/events", {
        type: "RecipeCreated",
        data: {
            id,
            recipe_name,
            recipe_items
        }
    });
    res.status(201).send(recipes[id]);
}));
app.post('/events', (req, res) => {
    console.log('Received Event', req.body.type);
    res.send({});
});
//update recipe
app.post("/edit-recipe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, recipe_name, recipe_items } = req.body;
    recipes[id] = {
        id,
        recipe_name,
        recipe_items
    };
    console.log(recipes);
    yield axios_1.default.post("http://localhost:4005/events", {
        type: "RecipeUpdated",
        data: {
            id,
            recipe_name,
            recipe_items
        }
    });
    res.status(201).send(recipes[id]);
}));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
