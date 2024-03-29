import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const connectionString: string | undefined = process.env.NODE_ENV === 'production' ?
  process.env.PROD_RECIPE_POSTGRES_STRING :
  process.env.DEV_RECIPE_POSTGRES_STRING;

    
export class RecipeDataBaseConnection {
    pool!: Pool;

    constructor() {
        try {
            this.pool = new Pool({connectionString});
        } catch (error) {
            console.log('Pool could not be created');
        }
    }



    connect = async () => {
        try {
            await this.pool.connect();
            this.pool.query(`
            
            CREATE TABLE IF NOT EXISTS recipe_users_table (
              user_id BIGSERIAL PRIMARY KEY,
              email VARCHAR,
              user_name VARCHAR,
              password VARCHAR,
              role INT DEFAULT 0,
              token VARCHAR,
              profile_image VARCHAR
            );
           
            CREATE TABLE IF NOT EXISTS recipe_table (
              recipe_id BIGSERIAL PRIMARY KEY,
          
              recipe_name VARCHAR,
              recipe_cuisine VARCHAR,
              recipe_type VARCHAR,
              recipe_description TEXT,
              u_id BIGINT REFERENCES recipe_users_table(user_id),
              u_name VARCHAR,
              original_u_id BIGINT REFERENCES recipe_users_table(user_id),
              original_u_name VARCHAR,
              shared BOOLEAN DEFAULT FALSE
            );
           
            CREATE TABLE IF NOT EXISTS user_recipes (
              user_id BIGINT REFERENCES recipe_users_table(user_id),
              recipe_id BIGINT REFERENCES recipe_table(recipe_id),
              PRIMARY KEY (user_id, recipe_id)
            );
        
            CREATE TABLE IF NOT EXISTS items (
              recipe_item_id BIGSERIAL PRIMARY KEY,
              recipe_item VARCHAR,
              portion_size VARCHAR
            );
            CREATE TABLE IF NOT EXISTS instructions (
              recipe_id BIGINT REFERENCES recipe_table(recipe_id),
              instruction_id BIGSERIAL PRIMARY KEY,
              instruction VARCHAR,
              instruction_order INT
             
            );

          
        
            CREATE TABLE IF NOT EXISTS recipe_items (
              recipe_id BIGINT REFERENCES recipe_table(recipe_id),
              recipe_item_id BIGINT REFERENCES items(recipe_item_id),
              PRIMARY KEY (recipe_id, recipe_item_id)
            );
      
            CREATE TABLE IF NOT EXISTS recipe_images (
              recipe_id BIGINT REFERENCES recipe_table(recipe_id),
              recipe_image_id BIGSERIAL PRIMARY KEY,
              recipe_image VARCHAR
            );

 
            CREATE TABLE IF NOT EXISTS social_table (
              user_id BIGINT REFERENCES recipe_users_table(user_id),
              recipe_id BIGINT REFERENCES recipe_table(recipe_id),
              PRIMARY KEY (user_id, recipe_id)
            );


            `);
        } catch (error) {
            console.log('\nThere was an error connecting to the database');
            console.log(error);
          }
        }
      
        disconnect = async () => {
          await this.pool.end();
        }
      }