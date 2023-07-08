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
exports.recipeExists = exports.userExists = void 0;
const db_1 = require("./db/db");
const dbConn = new db_1.SocialDataBaseConnection();
dbConn.connect();
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
