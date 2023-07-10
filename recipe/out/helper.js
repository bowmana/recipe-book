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
exports.getUsersSocialRecipes = exports.getTotalSocialRecipesCount = exports.getPaginatedSocialRecipes = exports.insertSocialRecipe = exports.recipeShared = exports.deleteRecipeImage = exports.imageExists = exports.deleteUserRecipe = exports.deleteRecipeImages = exports.getRecipeImages = exports.createRecipeImage = exports.deleteRecipe = exports.getRecipeItems = exports.getRecipeById = exports.deleteRecipeItems = exports.updateRecipe = exports.recipeExists = exports.getUserRecipes = exports.createRecipeItem = exports.userExists = exports.createRecipe = exports.createUser = void 0;
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
const createRecipe = (user_id, recipe_name, recipe_cuisine, recipe_type, recipe_description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        INSERT INTO recipe_table (recipe_name, recipe_cuisine, recipe_type, recipe_description)
        VALUES ($1, $2, $3, $4)
        RETURNING recipe_id
        `, [recipe_name, recipe_cuisine, recipe_type, recipe_description]);
        const recipe_id = result.rows[0].recipe_id;
        yield dbConn.pool.query(`
        INSERT INTO user_recipes (user_id, recipe_id)
        VALUES ($1, $2)
        RETURNING recipe_id
        `, [user_id, recipe_id]);
        return { recipe_id, recipe_name, recipe_cuisine, recipe_type, recipe_description };
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "createRecipe"');
        console.log(error);
    }
});
exports.createRecipe = createRecipe;
// const createRecipeItem = async (recipe_id: number, recipe_item: string) => {
//     try {
//         const result: QueryResult = await dbConn.pool.query(`
//         INSERT INTO items (recipe_item)
//         VALUES ($1)
//         RETURNING recipe_item_id
//         `, [recipe_item]);
//         const recipe_item_id = result.rows[0].recipe_item_id;
//         await dbConn.pool.query(`
//         INSERT INTO recipe_items (recipe_id, recipe_item_id)
//         VALUES ($1, $2)
//         `, [recipe_id, recipe_item_id]);
//         return { recipe_item_id, recipe_item };
//     } catch (error) {
//         console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "createRecipeItem"');
//         console.log(error);
//     }
// };
const createRecipeItem = (recipe_id, recipe_item, portion_size) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        INSERT INTO items (recipe_item, portion_size)
        VALUES ($1, $2)
        RETURNING recipe_item_id
        `, [recipe_item, portion_size]);
        const recipe_item_id = result.rows[0].recipe_item_id;
        yield dbConn.pool.query(`
        INSERT INTO recipe_items (recipe_id, recipe_item_id)
        VALUES ($1, $2)
        `, [recipe_id, recipe_item_id]);
        return { recipe_item_id, recipe_item, portion_size };
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "createRecipeItem"');
        console.log(error);
    }
});
exports.createRecipeItem = createRecipeItem;
const createRecipeImage = (recipe_id, recipe_image) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        INSERT INTO recipe_images (recipe_id, recipe_image)
        VALUES ($1, $2)
        `, [recipe_id, recipe_image]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "createRecipeImage"');
        console.log(error);
    }
});
exports.createRecipeImage = createRecipeImage;
//get user recipes INCLUDING recipe items
const getUserRecipes = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
            SELECT recipe_table.recipe_id, recipe_table.recipe_name, recipe_table.recipe_cuisine, recipe_table.recipe_type, recipe_table.recipe_description, 
            ARRAY_AGG(recipe_images.recipe_image) AS recipe_images
            FROM recipe_table
            INNER JOIN user_recipes
            ON recipe_table.recipe_id = user_recipes.recipe_id
            LEFT JOIN recipe_images
            ON recipe_table.recipe_id = recipe_images.recipe_id
            WHERE user_recipes.user_id = $1
            GROUP BY recipe_table.recipe_id
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
const updateRecipe = (recipe_id, recipe_name, recipe_cuisine, recipe_type, recipe_description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE recipe_table
        SET recipe_name = $1, recipe_cuisine = $2, recipe_type = $3, recipe_description = $5
        WHERE recipe_id = $4
      `, [recipe_name, recipe_cuisine, recipe_type, recipe_id, recipe_description]);
        const updatedRecipeResult = yield dbConn.pool.query(`
        SELECT recipe_name, recipe_cuisine, recipe_type, recipe_description
        FROM recipe_table
        WHERE recipe_id = $1
      `, [recipe_id]);
        const updatedRecipe = updatedRecipeResult.rows[0];
        return {
            recipe_id,
            recipe_name: updatedRecipe.recipe_name,
            recipe_cuisine: updatedRecipe.recipe_cuisine,
            recipe_type: updatedRecipe.recipe_type,
            recipe_description: updatedRecipe.recipe_description,
        };
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "updateRecipe"');
        console.log(error);
        throw error;
    }
});
exports.updateRecipe = updateRecipe;
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
const deleteRecipeImages = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        DELETE FROM recipe_images
        WHERE recipe_id = $1
      `, [recipe_id]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "deleteRecipeImages"');
        console.log(error);
        throw error;
    }
});
exports.deleteRecipeImages = deleteRecipeImages;
const deleteRecipeImage = (recipe_id, recipe_image) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield dbConn.pool.query(`
        DELETE FROM recipe_images
        WHERE recipe_id = $1 AND recipe_image = $2
      `, [recipe_id, recipe_image]);
        const deletedImage = res.rows[0];
        console.log(deletedImage), "deleted from db";
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "deleteRecipeImage"');
        console.log(error);
        throw error;
    }
});
exports.deleteRecipeImage = deleteRecipeImage;
const imageExists = (recipe_id, recipe_image) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        SELECT recipe_image
        FROM recipe_images
        WHERE recipe_id = $1 AND recipe_image = $2
      `, [recipe_id, recipe_image]);
        if (result.rows.length > 0) {
            console.log('Image exists');
            return true;
        }
        else {
            console.log('Image does not exist');
            return false;
        }
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "imageExists"');
        console.log(error);
        throw error;
    }
});
exports.imageExists = imageExists;
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
            recipe_cuisine: recipe.recipe_cuisine,
            recipe_type: recipe.recipe_type,
            recipe_description: recipe.recipe_description,
        };
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getRecipeById"');
        console.log(error);
        throw error;
    }
});
exports.getRecipeById = getRecipeById;
//delete from user recipes table
const deleteUserRecipe = (user_id, recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        DELETE FROM user_recipes
        WHERE user_id = $1 AND recipe_id = $2
        `, [user_id, recipe_id]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "deleteRecipe"');
        console.log(error);
        throw error;
    }
});
exports.deleteUserRecipe = deleteUserRecipe;
const getRecipeItems = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        SELECT items.recipe_item, items.portion_size, items.recipe_item_id
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
const getRecipeImages = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        SELECT recipe_image
        FROM recipe_images
        WHERE recipe_id = $1
      `, [recipe_id]);
        return result.rows;
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getRecipeImages"');
        console.log(error);
        throw error;
    }
});
exports.getRecipeImages = getRecipeImages;
const deleteRecipe = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        DELETE FROM user_recipes
        WHERE recipe_id = $1
      `, [recipe_id]);
        yield dbConn.pool.query(`
        DELETE FROM recipe_table
        WHERE recipe_id = $1
      `, [recipe_id]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "deleteRecipe"');
        console.log(error);
        throw error;
    }
});
exports.deleteRecipe = deleteRecipe;
const insertSocialRecipe = (user_id, recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        INSERT INTO social_table (user_id, recipe_id)
        VALUES ($1, $2)
      `, [user_id, recipe_id]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "insertSocialRecipe"');
        console.log(error);
        throw error;
    }
});
exports.insertSocialRecipe = insertSocialRecipe;
const getUsersSocialRecipes = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT * FROM social_table
      WHERE user_id = $1
    `, [user_id]);
        return result.rows;
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getUsersSocialRecipes"');
        console.log(error);
        throw error;
    }
});
exports.getUsersSocialRecipes = getUsersSocialRecipes;
const getPaginatedSocialRecipes = (offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT
      recipe_table.recipe_id,
      recipe_table.recipe_name,
      recipe_table.recipe_cuisine,
      recipe_table.recipe_type,
      recipe_table.recipe_description,
      ARRAY_AGG(recipe_images.recipe_image) AS recipe_images
    FROM
      recipe_table
      INNER JOIN recipe_images ON recipe_table.recipe_id = recipe_images.recipe_id
      INNER JOIN social_table ON recipe_table.recipe_id = social_table.recipe_id
    GROUP BY
      recipe_table.recipe_id,
      recipe_table.recipe_name,
      recipe_table.recipe_cuisine,
      recipe_table.recipe_type,
      recipe_table.recipe_description
    ORDER BY
      recipe_table.recipe_id DESC
    OFFSET $1 LIMIT $2
    `, [offset, limit]);
        const recipes = result.rows;
        const recipesWithItems = yield Promise.all(recipes.map((recipe) => __awaiter(void 0, void 0, void 0, function* () {
            const recipeItems = yield getRecipeItems(recipe.recipe_id);
            recipe.recipe_items = recipeItems;
            return recipe;
        })));
        return recipesWithItems;
    }
    catch (error) {
        console.log("\nCouldn't execute query because the pool couldn't connect to the database 'getPaginatedSocialRecipes'");
        console.log(error);
        throw error;
    }
});
exports.getPaginatedSocialRecipes = getPaginatedSocialRecipes;
const getTotalSocialRecipesCount = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT COUNT(*) FROM social_table
    `);
        return parseInt(result.rows[0].count);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getTotalSocialRecipesCount"');
        console.log(error);
        throw error;
    }
});
exports.getTotalSocialRecipesCount = getTotalSocialRecipesCount;
const recipeShared = (user_id, recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT * FROM social_table
      WHERE user_id = $1 AND recipe_id = $2
    `, [user_id, recipe_id]);
        if (result.rows.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "recipeShared"');
        console.log(error);
        throw error;
    }
});
exports.recipeShared = recipeShared;
