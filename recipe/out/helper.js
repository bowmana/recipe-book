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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipeItems = exports.getRecipeById = exports.deleteRecipeItems = exports.updateRecipeName = exports.clearRecipe = exports.recipeExists = exports.getUserRecipes = exports.createRecipeItem = exports.userExists = exports.createRecipe = exports.createUser = void 0;
const db_1 = require("./db/db");
const dbConn = new db_1.RecipeDataBaseConnection();
dbConn.connect();
const createUser = (user_id, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        INSERT INTO recipe_users_table (user_id, email)
        VALUES ($1, $2)
        `, [user_id, email]);
    }
    catch (error) {
        console.log('\nError creating user in database');
        console.log(error);
    }
});
exports.createUser = createUser;
const userExists = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        SELECT user_id
        FROM recipe_users_table
        WHERE user_id = $1
        `, [user_id]);
        if (result.rows.length > 0) {
            console.log('User exists');
            return true;
        }
        else {
            console.log('User does not exist');
            return false;
        }
    }
    catch (error) {
        console.log(error);
        console.log('Error checking if user exists in database');
    }
});
exports.userExists = userExists;
// CREATE TABLE IF NOT EXISTS user_recipes (
//     user_id BIGINT REFERENCES recipe_users_table(user_id),
//     recipe_id BIGINT REFERENCES recipe_table(recipe_id),
//     PRIMARY KEY (user_id, recipe_id)
//   );
//   CREATE TABLE IF NOT EXISTS recipe_items (
//     recipe_id BIGINT REFERENCES recipe_table(recipe_id),
//     item_id BIGSERIAL PRIMARY KEY,
//     recipe_item VARCHAR
//   );
const createRecipe = (user_id, recipe_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        INSERT INTO recipe_table (recipe_name)
        VALUES ($1)
        RETURNING recipe_id
        `, [recipe_name]);
        const recipe_id = result.rows[0].recipe_id;
        yield dbConn.pool.query(`
        INSERT INTO user_recipes (user_id, recipe_id)
        VALUES ($1, $2)
        RETURNING recipe_id
        `, [user_id, recipe_id]);
        return { recipe_id, recipe_name };
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "createRecipe"');
        console.log(error);
    }
});
exports.createRecipe = createRecipe;
// this.pool.query(`
// CREATE TABLE IF NOT EXISTS recipe_users_table (
//   user_id BIGSERIAL PRIMARY KEY,
//   email VARCHAR,
//   password VARCHAR,
//   role INT DEFAULT 0,
//   token VARCHAR
// );
// CREATE TABLE IF NOT EXISTS recipe_table (
//   recipe_id BIGSERIAL PRIMARY KEY,
//   recipe_name VARCHAR
// );
// CREATE TABLE IF NOT EXISTS user_recipes (
//   user_id BIGINT REFERENCES recipe_users_table(user_id),
//   recipe_id BIGINT REFERENCES recipe_table(recipe_id),
//   PRIMARY KEY (user_id, recipe_id)
// );
// CREATE TABLE IF NOT EXISTS items (
//   recipe_item_id BIGSERIAL PRIMARY KEY,
//   recipe_item VARCHAR
// );
// CREATE TABLE IF NOT EXISTS recipe_items (
//   recipe_id BIGINT REFERENCES recipe_table(recipe_id),
//   recipe_item_id BIGINT REFERENCES items(recipe_item_id),
//   PRIMARY KEY (recipe_id, recipe_item_id)
// );
// `);
const createRecipeItem = (recipe_id, recipe_item) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        INSERT INTO items (recipe_item)
        VALUES ($1)
        RETURNING recipe_item_id
        `, [recipe_item]);
        const recipe_item_id = result.rows[0].recipe_item_id;
        yield dbConn.pool.query(`
        INSERT INTO recipe_items (recipe_id, recipe_item_id)
        VALUES ($1, $2)
        `, [recipe_id, recipe_item_id]);
        return { recipe_item_id, recipe_item };
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "createRecipeItem"');
        console.log(error);
    }
});
exports.createRecipeItem = createRecipeItem;
//get everything associated with recipes given user_id
//get name of recipe, recipe_id, recipe_items and their ids
const getUserRecipes = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
            SELECT recipe_table.recipe_id, recipe_table.recipe_name
            FROM recipe_table
            INNER JOIN user_recipes
            ON recipe_table.recipe_id = user_recipes.recipe_id
            WHERE user_recipes.user_id = $1
        `, [user_id]);
        const recipes = result.rows;
        const recipesWithItems = yield Promise.all(recipes.map((recipe) => __awaiter(void 0, void 0, void 0, function* () {
            const recipeItems = yield getRecipeItems(recipe.recipe_id);
            recipe.recipe_items = recipeItems;
            return recipe;
        })));
        return recipesWithItems;
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getUserRecipes"');
        console.log(error);
        throw error;
    }
});
exports.getUserRecipes = getUserRecipes;
const recipeExists = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        SELECT recipe_id
        FROM recipe_table
        WHERE recipe_id = $1
        `, [recipe_id]);
        if (result.rows.length > 0) {
            console.log('Recipe exists');
            return true;
        }
        else {
            console.log('Recipe does not exist');
            return false;
        }
    }
    catch (error) {
        console.log(error);
        console.log('Error checking if recipe exists in database');
    }
});
exports.recipeExists = recipeExists;
const updateRecipeName = (recipe_id, recipe_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE recipe_table
        SET recipe_name = $1
        WHERE recipe_id = $2
      `, [recipe_name, recipe_id]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "updateRecipeName"');
        console.log(error);
        throw error;
    }
});
exports.updateRecipeName = updateRecipeName;
const deleteRecipeItems = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        DELETE FROM recipe_items
        WHERE recipe_id = $1
      `, [recipe_id]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "deleteRecipeItems"');
        console.log(error);
        throw error;
    }
});
exports.deleteRecipeItems = deleteRecipeItems;
//get recipe name and items by recipe_id
// const getRecipe = async (recipe_id: number) => {
//     try {
//         const result: QueryResult = await dbConn.pool.query(`
//         SELECT recipe_items.recipe_item, recipe_items.recipe_id, recipe_table.recipe_name
//         FROM recipe_items
//         INNER JOIN recipe_table
//         ON recipe_items.recipe_id = recipe_table.recipe_id
//         WHERE recipe_items.recipe_id = $1
//         `, [recipe_id]);
//         const transformedData: Recipe[] = result.rows.reduce((acc: Recipe[], { recipe_item, recipe_id, recipe_name }: { recipe_item: string, recipe_id: number, recipe_name: string }) => {
//             const existingRecipe = acc.find((recipe) => recipe.recipe_id === recipe_id);
//             if (existingRecipe) {
//                 existingRecipe.recipe_items.push({ recipe_item });
//             } else {
//                 acc.push({ recipe_items: [{ recipe_item }], recipe_id, recipe_name });
//             }
//             return acc;
//         }
//         , []);
//         return transformedData;
//     } catch (error) {
//         console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getUserRecipe"');
//         console.log(error);
//     }
// };
const clearRecipe = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        DELETE FROM recipe_items
        WHERE recipe_id = $1
        `, [recipe_id]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "clearRecipe"');
        console.log(error);
    }
});
exports.clearRecipe = clearRecipe;
const getRecipeById = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        SELECT *
        FROM recipe_table
        WHERE recipe_id = $1
      `, [recipe_id]);
        if (result.rows.length === 0) {
            return null;
        }
        const recipe = result.rows[0];
        return {
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name,
        };
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getRecipeById"');
        console.log(error);
        throw error;
    }
});
exports.getRecipeById = getRecipeById;
const getRecipeItems = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        SELECT items.recipe_item, items.recipe_item_id
        FROM items
        INNER JOIN recipe_items
        ON items.recipe_item_id = recipe_items.recipe_item_id
        WHERE recipe_items.recipe_id = $1
      `, [recipe_id]);
        return result.rows;
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getRecipeItems"');
        console.log(error);
        throw error;
    }
});
exports.getRecipeItems = getRecipeItems;
