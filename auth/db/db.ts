import {Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({path: "../.env"});

const connectionStrng: string | undefined = process.env.DEV_AUTH_POSTGRES_STRING;

export class DataBaseConnection {
    pool!: Pool;
    constructor() {
        try{
            console.log("Attempting to connect to database" + connectionStrng);
            this.pool = new Pool({ connectionString: connectionStrng });
        }
        catch(err){
            console.log("Error connecting to database: " + err);
        }
    }

    connect = async () => {
        try{
            await this.pool.connect();
            console.log("Connected to database");
            this.pool.query(`
           
            CREATE TABLE IF NOT EXISTS users (
                user_id BIGSERIAL PRIMARY KEY,
                email VARCHAR,
                password VARCHAR,
                role INT DEFAULT 0,
                token VARCHAR
            );`);
        }
        catch(err){
            console.log("Error connecting to database: " + err);
        }
    }

    disconnect = async () => {
        try{
            await this.pool.end();
            console.log("Disconnected from database");
        }
        catch(err){
            console.log("Error disconnecting from database: " + err);
        }
    }

}