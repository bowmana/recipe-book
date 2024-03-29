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
exports.deleteInstructions = exports.getRecipeInstructions = exports.createInstruction = exports.setRecipeShared = exports.updateUserName = exports.updateEmail = exports.updateProfileImage = exports.recipeNameExists = exports.recipeTypeExists = exports.recipeCuisineExists = exports.getSocialRecipesAfterId = exports.getTotalSharedRecipesCount = exports.getSharedRecipesAfterId = exports.deleteSocialRecipe = exports.getUsersSocialRecipes = exports.getTotalSocialRecipesCount = exports.getPaginatedSocialRecipes = exports.insertSocialRecipe = exports.recipeShared = exports.deleteRecipeImage = exports.imageExists = exports.deleteUserRecipe = exports.deleteRecipeImages = exports.getRecipeImages = exports.createRecipeImage = exports.deleteRecipe = exports.getRecipeItems = exports.getRecipeById = exports.deleteRecipeItems = exports.updateRecipe = exports.recipeExists = exports.getUserRecipes = exports.createRecipeItem = exports.userExists = exports.createRecipe = exports.createUser = void 0;
const db_1 = require("./db/db");
const dbConn = new db_1.RecipeDataBaseConnection();
dbConn.connect();
const createUser = (user_id, email, user_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        INSERT INTO recipe_users_table (user_id, email, user_name)
        VALUES ($1, $2, $3)
        `, [user_id, email.toLowerCase(), user_name]);
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
const updateProfileImage = (user_id, profile_image) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE recipe_users_table
        SET profile_image = $1
        WHERE user_id = $2
        `, [profile_image, user_id]);
    }
    catch (error) {
        console.log('\nError inserting profile image into database');
        console.log(error);
    }
});
exports.updateProfileImage = updateProfileImage;
// await helper.updateUserName(user_id, user_name);
const updateUserName = (user_id, user_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE recipe_users_table
        SET user_name = $1
        WHERE user_id = $2
        `, [user_name, user_id]);
    }
    catch (error) {
        console.log('\nError updating username in database');
        console.log(error);
    }
});
exports.updateUserName = updateUserName;
const updateEmail = (user_id, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE recipe_users_table
        SET email = $1
        WHERE user_id = $2
        `, [email, user_id]);
    }
    catch (error) {
        console.log('\nError updating email in database');
        console.log(error);
    }
});
exports.updateEmail = updateEmail;
const createRecipe = (user_id, recipe_name, original_u_id, original_u_name, u_name, u_id, recipe_cuisine, recipe_type, recipe_description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        INSERT INTO recipe_table (recipe_name, recipe_cuisine, recipe_type, recipe_description, u_id, u_name, original_u_id, original_u_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING recipe_id
        `, [recipe_name, recipe_cuisine, recipe_type, recipe_description, u_id, u_name, original_u_id, original_u_name]);
        const recipe_id = result.rows[0].recipe_id;
        yield dbConn.pool.query(`
        INSERT INTO user_recipes (user_id, recipe_id)
        VALUES ($1, $2)
        RETURNING recipe_id
        `, [user_id, recipe_id]);
        return { recipe_id, recipe_name, recipe_cuisine, recipe_type, recipe_description, u_id, u_name, original_u_id, original_u_name };
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "createRecipe"');
        console.log(error);
    }
});
exports.createRecipe = createRecipe;
const setRecipeShared = (recipe_id, val) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sharedValue = val ? 'TRUE' : 'FALSE';
        yield dbConn.pool.query(`
        UPDATE recipe_table
        SET shared = $1
        WHERE recipe_id = $2
        `, [sharedValue, recipe_id]);
    }
    catch (error) {
        console.log('\nError setting recipe to shared in database');
        console.log(error);
    }
});
exports.setRecipeShared = setRecipeShared;
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
const createInstruction = (recipe_id, instruction, instruction_order) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      INSERT INTO instructions (recipe_id, instruction, instruction_order)
      VALUES ($1, $2, $3)
      RETURNING instruction_id;
      `, [recipe_id, instruction, instruction_order]);
        const instruction_id = result.rows[0].instruction_id;
        return { instruction_id, instruction };
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "createInstruction"');
        console.log(error);
    }
});
exports.createInstruction = createInstruction;
const deleteInstructions = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
    DELETE FROM instructions
    WHERE recipe_id = $1
    `, [recipe_id]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "deleteInstructions"');
        console.log(error);
    }
});
exports.deleteInstructions = deleteInstructions;
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
            SELECT recipe_table.recipe_id, recipe_table.recipe_name, recipe_table.recipe_cuisine, recipe_table.recipe_type, recipe_table.recipe_description, recipe_table.u_id, recipe_table.u_name, recipe_table.original_u_id, recipe_table.original_u_name, recipe_table.shared,
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
            const recipeInstructions = yield getRecipeInstructions(recipe.recipe_id);
            recipe.recipe_instructions = recipeInstructions;
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
const updateRecipe = (recipe_id, recipe_name, recipe_cuisine, recipe_type, recipe_description, u_id, u_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE recipe_table
        SET recipe_name = $1, recipe_cuisine = $2, recipe_type = $3, recipe_description = $4, u_id = $5, u_name = $6
        WHERE recipe_id = $7
      `, [recipe_name, recipe_cuisine, recipe_type, recipe_description, u_id, u_name, recipe_id]);
        const updatedRecipeResult = yield dbConn.pool.query(`
        SELECT recipe_name, recipe_cuisine, recipe_type, recipe_description, u_id, u_name
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
            u_id: updatedRecipe.u_id,
            u_name: updatedRecipe.u_name
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
            u_id: recipe.u_id,
            u_name: recipe.u_name,
            original_u_id: recipe.original_u_id,
            original_u_name: recipe.original_u_name
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
const getRecipeInstructions = (recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT instruction_id, instruction, instruction_order
      FROM instructions
      WHERE recipe_id = $1;
      `, [recipe_id]);
        return result.rows;
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getRecipeInstructions"');
        console.log(error);
        throw error;
    }
});
exports.getRecipeInstructions = getRecipeInstructions;
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
const deleteSocialRecipe = (user_id, recipe_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        DELETE FROM social_table
        WHERE user_id = $1 AND recipe_id = $2
      `, [user_id, recipe_id]);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "deleteSocialRecipe"');
        console.log(error);
        throw error;
    }
});
exports.deleteSocialRecipe = deleteSocialRecipe;
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
      recipe_table.u_id,
      recipe_table.u_name,
      recipe_table.original_u_id,
      recipe_table.original_u_name,
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
      recipe_table.recipe_description,
      recipe_table.u_id,
      recipe_table.u_name,
      recipe_table.original_u_id,
      recipe_table.original_u_name
    ORDER BY
      recipe_table.recipe_id DESC
    OFFSET $1 LIMIT $2
    `, [offset, limit]);
        const recipes = result.rows;
        const recipesWithItems = yield Promise.all(recipes.map((recipe) => __awaiter(void 0, void 0, void 0, function* () {
            const recipeItems = yield getRecipeItems(recipe.recipe_id);
            recipe.recipe_items = recipeItems;
            const recipeInstructions = yield getRecipeInstructions(recipe.recipe_id);
            recipe.recipe_instructions = recipeInstructions;
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
const getSocialRecipesAfterId = (lastItemId, limit, recipeName, recipeCuisine, recipeType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let params = [];
        let query = `
      SELECT
        recipe_table.recipe_id,
        recipe_table.recipe_name,
        recipe_table.recipe_cuisine,
        recipe_table.recipe_type,
        recipe_table.recipe_description,
        recipe_table.u_id,
        recipe_users_u.profile_image AS u_profile_image,
        recipe_table.u_name,
        recipe_table.original_u_id,
        recipe_users_original_u.profile_image AS original_u_profile_image,
        recipe_table.original_u_name,
        ARRAY_AGG(recipe_images.recipe_image) AS recipe_images
      FROM
        recipe_table
        INNER JOIN recipe_images ON recipe_table.recipe_id = recipe_images.recipe_id
        INNER JOIN social_table ON recipe_table.recipe_id = social_table.recipe_id
        LEFT JOIN recipe_users_table AS recipe_users_u ON recipe_table.u_id = recipe_users_u.user_id
        LEFT JOIN recipe_users_table AS recipe_users_original_u ON recipe_table.original_u_id = recipe_users_original_u.user_id
  
      WHERE
        recipe_table.recipe_id < $1`;
        params = [lastItemId];
        if (recipeType) {
            console.log('recipeType herrre', recipeType);
            const typeExists = yield recipeTypeExists(recipeType);
            if (typeExists) {
                query += ` AND recipe_table.recipe_type ILIKE $${params.length + 1}`;
                params.push(`%${recipeType}%`);
            }
            else {
                // Handle case when the provided type does not exist
                console.log('Recipe type does not exist');
                return [];
            }
        }
        if (recipeCuisine) {
            console.log('recipeCuisine herrre', recipeCuisine);
            const cuisineExists = yield recipeCuisineExists(recipeCuisine);
            if (cuisineExists) {
                query += ` AND recipe_table.recipe_cuisine ILIKE $${params.length + 1}`;
                params.push(`%${recipeCuisine}%`);
            }
            else {
                // Handle case when the provided cuisine does not exist
                console.log('Recipe cuisine does not exist');
                return [];
            }
        }
        if (recipeName) {
            query += ` AND recipe_table.recipe_name ILIKE $${params.length + 1}`;
            params.push(`%${recipeName}%`);
        }
        query += `
      GROUP BY
        recipe_table.recipe_id,
        recipe_table.recipe_name,
        recipe_table.recipe_cuisine,
        recipe_table.recipe_type,
        recipe_table.recipe_description,
        recipe_table.u_id,
        recipe_users_u.profile_image,
        recipe_table.u_name,
        recipe_table.original_u_id,
        recipe_users_original_u.profile_image,
        recipe_table.original_u_name


      ORDER BY
        recipe_table.recipe_id DESC
      LIMIT $${params.length + 1}
    `;
        params.push(limit);
        const result = yield dbConn.pool.query(query, params);
        const recipes = result.rows;
        const recipesWithItems = yield Promise.all(recipes.map((recipe) => __awaiter(void 0, void 0, void 0, function* () {
            const recipeItems = yield getRecipeItems(recipe.recipe_id);
            recipe.recipe_items = recipeItems;
            const recipeInstructions = yield getRecipeInstructions(recipe.recipe_id);
            recipe.recipe_instructions = recipeInstructions;
            return recipe;
        })));
        return recipesWithItems;
    }
    catch (error) {
        console.log("\nCouldn't execute query because the pool couldn't connect to the database 'getSocialRecipesAfterId'");
        console.log(error);
        throw error;
    }
});
exports.getSocialRecipesAfterId = getSocialRecipesAfterId;
const recipeNameExists = (recipe_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT recipe_name
      FROM recipe_table
      WHERE recipe_name ILIKE $1
    `, [`%${recipe_name}%`]);
        if (result.rows.length > 0) {
            console.log('Recipe name exists');
            return true;
        }
        else {
            console.log('Recipe name does not exist');
            return Promise.reject('Recipe name does not exist');
        }
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "recipeNameExists"');
        console.log(error);
        throw error;
    }
});
exports.recipeNameExists = recipeNameExists;
const recipeCuisineExists = (recipe_cuisine) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT recipe_cuisine
      FROM recipe_table
      WHERE recipe_cuisine ILIKE $1
    `, [`%${recipe_cuisine}%`]);
        if (result.rows.length > 0) {
            console.log('Recipe cuisine exists');
            return true;
        }
        else {
            console.log('Recipe cuisine does not exist');
            return Promise.reject('Recipe cuisine does not exist');
        }
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "recipeCuisineExists"');
        console.log(error);
        throw error;
    }
});
exports.recipeCuisineExists = recipeCuisineExists;
const recipeTypeExists = (recipe_type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT recipe_type
      FROM recipe_table
      WHERE recipe_type ILIKE $1
    `, [`%${recipe_type}%`]);
        if (result.rows.length > 0) {
            console.log('Recipe type exists');
            return true;
        }
        else {
            console.log('Recipe type does not exist');
            return Promise.reject('Recipe type does not exist');
        }
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "recipeTypeExists"');
        console.log(error);
        throw error;
    }
});
exports.recipeTypeExists = recipeTypeExists;
const getTotalSocialRecipesCount = (recipeName, recipeCuisine, recipeType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //up to 3 additional conditions can be added to the query (recipeName, recipeCuisine, recipeType), not all of them have to be used if not passed in.
        let query = `
      SELECT COUNT(*) FROM social_table
    `;
        let params = [];
        if (recipeName) {
            query = `
        SELECT COUNT(*) FROM recipe_table
        WHERE recipe_name ILIKE $1
      `;
            params = [`%${recipeName}%`];
            if (recipeCuisine) {
                query = `
          SELECT COUNT(*) FROM recipe_table
          WHERE recipe_name ILIKE $1 AND recipe_cuisine ILIKE $2
        `;
                params = [`%${recipeName}%`, `%${recipeCuisine}%`];
                if (recipeType) {
                    query = `
            SELECT COUNT(*) FROM recipe_table
            WHERE recipe_name ILIKE $1 AND recipe_cuisine ILIKE $2 AND recipe_type ILIKE $3
          `;
                    params = [`%${recipeName}%`, `%${recipeCuisine}%`, `%${recipeType}%`];
                }
            }
        }
        const result = yield dbConn.pool.query(query, params);
        return parseInt(result.rows[0].count);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getTotalSocialRecipesCount"');
        console.log(error);
        throw error;
    }
});
exports.getTotalSocialRecipesCount = getTotalSocialRecipesCount;
const getSharedRecipesAfterId = (user_id, lastItemId, limit, recipeName, recipeCuisine, recipeType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let params = [];
        let query = `
      SELECT
        recipe_table.recipe_id,
        recipe_table.recipe_name,
        recipe_table.recipe_cuisine,
        recipe_table.recipe_type,
        recipe_table.recipe_description,
        recipe_table.u_id,
        recipe_table.u_name,
        recipe_table.original_u_id,
        recipe_table.original_u_name,
        ARRAY_AGG(recipe_images.recipe_image) AS recipe_images
      FROM
        recipe_table
        INNER JOIN recipe_images ON recipe_table.recipe_id = recipe_images.recipe_id
        INNER JOIN social_table ON recipe_table.recipe_id = social_table.recipe_id
      WHERE
        recipe_table.recipe_id < $1 AND social_table.user_id = $2`;
        params = [lastItemId, user_id];
        if (recipeType) {
            console.log('recipeType herrre', recipeType);
            const typeExists = yield recipeTypeExists(recipeType);
            if (typeExists) {
                query += ` AND recipe_table.recipe_type ILIKE $${params.length + 1}`;
                params.push(`%${recipeType}%`);
            }
            else {
                // Handle case when the provided type does not exist
                console.log('Recipe type does not exist');
                return [];
            }
        }
        if (recipeCuisine) {
            console.log('recipeCuisine herrre', recipeCuisine);
            const cuisineExists = yield recipeCuisineExists(recipeCuisine);
            if (cuisineExists) {
                query += ` AND recipe_table.recipe_cuisine ILIKE $${params.length + 1}`;
                params.push(`%${recipeCuisine}%`);
            }
            else {
                // Handle case when the provided cuisine does not exist
                console.log('Recipe cuisine does not exist');
                return [];
            }
        }
        if (recipeName) {
            query += ` AND recipe_table.recipe_name ILIKE $${params.length + 1}`;
            params.push(`%${recipeName}%`);
        }
        query += `
      GROUP BY
        recipe_table.recipe_id,
        recipe_table.recipe_name,
        recipe_table.recipe_cuisine,
        recipe_table.recipe_type,
        recipe_table.recipe_description,
        recipe_table.u_id,
        recipe_table.u_name,
        recipe_table.original_u_id,
        recipe_table.original_u_name
      ORDER BY
        recipe_table.recipe_id DESC
      LIMIT $${params.length + 1}
    `;
        params.push(limit);
        const result = yield dbConn.pool.query(query, params);
        const recipes = result.rows;
        const recipesWithItems = yield Promise.all(recipes.map((recipe) => __awaiter(void 0, void 0, void 0, function* () {
            const recipeItems = yield getRecipeItems(recipe.recipe_id);
            recipe.recipe_items = recipeItems;
            const recipeInstructions = yield getRecipeInstructions(recipe.recipe_id);
            recipe.recipe_instructions = recipeInstructions;
            return recipe;
        })));
        return recipesWithItems;
    }
    catch (error) {
        console.log("\nCouldn't execute query because the pool couldn't connect to the database 'getSharedRecipesAfterId'");
        console.log(error);
        throw error;
    }
});
exports.getSharedRecipesAfterId = getSharedRecipesAfterId;
const getTotalSharedRecipesCount = (user_id, recipeName, recipeCuisine, recipeType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //up to 3 additional conditions can be added to the query (recipeName, recipeCuisine, recipeType), not all of them have to be used if not passed in.
        let query = `
      SELECT COUNT(*) FROM social_table
      WHERE user_id = $1
    `;
        let params = [user_id];
        if (recipeName) {
            query = `
        SELECT COUNT(*) FROM recipe_table
        INNER JOIN social_table ON recipe_table.recipe_id = social_table.recipe_id
        WHERE social_table.user_id = $1 AND recipe_name ILIKE $2
      `;
            params = [user_id, `%${recipeName}%`];
            if (recipeCuisine) {
                query = `
          SELECT COUNT(*) FROM recipe_table
          INNER JOIN social_table ON recipe_table.recipe_id = social_table.recipe_id
          WHERE social_table.user_id = $1 AND recipe_name ILIKE $2 AND recipe_cuisine ILIKE $3
        `;
                params = [user_id, `%${recipeName}%`, `%${recipeCuisine}%`];
                if (recipeType) {
                    query = `
            SELECT COUNT(*) FROM recipe_table
            INNER JOIN social_table ON recipe_table.recipe_id = social_table.recipe_id
            WHERE social_table.user_id = $1 AND recipe_name ILIKE $2 AND recipe_cuisine ILIKE $3 AND recipe_type ILIKE $4
          `;
                    params = [user_id, `%${recipeName}%`, `%${recipeCuisine}%`, `%${recipeType}%`];
                }
            }
        }
        const result = yield dbConn.pool.query(query, params);
        return parseInt(result.rows[0].count);
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getTotalSharedRecipesCount"');
        console.log(error);
        throw error;
    }
});
exports.getTotalSharedRecipesCount = getTotalSharedRecipesCount;
// // getPaginatedSharedRecipes(user_id, offset, limit);
// const getPaginatedSharedRecipes = async (user_id: number, offset: number, limit: number) => {
//   try {
//     const result = await dbConn.pool.query(
//       `
//       SELECT
//       recipe_table.recipe_id,
//       recipe_table.recipe_name,
//       recipe_table.recipe_cuisine,
//       recipe_table.recipe_type,
//       recipe_table.recipe_description,
//       recipe_table.u_id,
//       recipe_table.u_name,
//       recipe_table.original_u_id,
//       recipe_table.original_u_name,
//       ARRAY_AGG(recipe_images.recipe_image) AS recipe_images
//     FROM
//       recipe_table
//       INNER JOIN recipe_images ON recipe_table.recipe_id = recipe_images.recipe_id
//       INNER JOIN social_table ON recipe_table.recipe_id = social_table.recipe_id
//     WHERE
//       social_table.user_id = $1
//     GROUP BY
//       recipe_table.recipe_id,
//       recipe_table.recipe_name,
//       recipe_table.recipe_cuisine,
//       recipe_table.recipe_type,
//       recipe_table.recipe_description,
//       recipe_table.u_id,
//       recipe_table.u_name,
//       recipe_table.original_u_id,
//       recipe_table.original_u_name
//     ORDER BY
//       recipe_table.recipe_id DESC
//     OFFSET $2 LIMIT $3
//     `,
//       [user_id, offset, limit]
//     );
//     const recipes = result.rows;
//     const recipesWithItems = await Promise.all(
//       recipes.map(async (recipe: any) => {
//         const recipeItems = await getRecipeItems(recipe.recipe_id);
//         recipe.recipe_items = recipeItems;
//         return recipe;
//       })
//     );
//     return recipesWithItems;
//   } catch (error) {
//     console.log(
//       "\nCouldn't execute query because the pool couldn't connect to the database 'getPaginatedSharedRecipes'"
//     );
//     console.log(error);
//     throw error;
//   }
// };
// const getTotalSharedRecipesCount = async (user_id: number) => {
//   try {
//     const result = await dbConn.pool.query(
//       `
//       SELECT COUNT(*) FROM social_table
//       WHERE user_id = $1
//     `,
//       [user_id]
//     );
//     return parseInt(result.rows[0].count);
//   } catch (error) {
//     console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database "getTotalSharedRecipesCount"');
//     console.log(error);
//     throw error;
//   }
// };
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
