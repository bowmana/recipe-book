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
const express_1 = __importDefault(require("express"));
const helper = __importStar(require("./helper"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 4003;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/events", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    console.log('Received Event', event.type);
    if (event.type === "RecipeShared") {
        console.log("RecipeShared", event.data);
        res.redirect(307, '/recipeShared');
        return;
    }
    res.send({});
}));
app.post("/recipeShared", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    const user_id = parseInt(event.data.user_id);
    const recipe_id = parseInt(event.data.recipe_id);
    const { recipe_name, recipe_cuisine, recipe_type, recipe_description, recipe_items, recipe_images } = event.data;
    console.log('Received Event', event.type);
    console.log(event.data, 'event data');
    try {
        const userExists = yield helper.userExists(user_id);
        if (!userExists) {
            res.status(404).send("User does not exist");
            return;
        }
        const recipeExists = yield helper.recipeExists(recipe_id);
        if (!recipeExists) {
            res.status(404).send("Recipe does not exist");
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
}));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
