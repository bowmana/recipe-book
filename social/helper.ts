import { SocialDataBaseConnection } from "./db/db";
import { QueryResult } from 'pg';


const dbConn = new SocialDataBaseConnection();
dbConn.connect();


const userExists = async (user_id: number) => {
    try {
        const result: QueryResult = await dbConn.pool.query(`
        SELECT user_id
        FROM recipe_users_table
        WHERE user_id = $1
        `, [user_id]);
        if (result.rows.length > 0) {
            console.log('User exists');
            return true;
        } else {
            console.log('User does not exist');
            return false;
        }
    } catch (error) {
        console.log(error);
        console.log('Error checking if user exists in database');
    }
}

const recipeExists = async (recipe_id: number) => {
    try {
        const result: QueryResult = await dbConn.pool.query(`
        SELECT recipe_id
        FROM recipe_table
        WHERE recipe_id = $1
        `, [recipe_id]);
        if (result.rows.length > 0) {
            console.log('Recipe exists');
            return true;
        } else {
            console.log('Recipe does not exist');
            return false;
        }
    } catch (error) {
        console.log(error);
        console.log('Error checking if recipe exists in database');
    }
}




export {
    userExists,
    recipeExists
}