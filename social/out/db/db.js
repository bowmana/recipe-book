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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialDataBaseConnection = void 0;
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '../.env' });
const connectionString = process.env.NODE_ENV === 'production' ?
    process.env.PROD_SOCIAL_POSTGRES_STRING :
    process.env.DEV_SOCIAL_POSTGRES_STRING;
class SocialDataBaseConnection {
    constructor() {
        this.connect = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.pool.connect();
                this.pool.query(`
            
            CREATE TABLE IF NOT EXISTS recipe_users_table (
              user_id BIGSERIAL PRIMARY KEY,
              email VARCHAR,
              password VARCHAR,
              role INT DEFAULT 0,
              token VARCHAR
            );
           
            CREATE TABLE IF NOT EXISTS recipe_table (
              recipe_id BIGSERIAL PRIMARY KEY,
              recipe_name VARCHAR,
              recipe_cuisine VARCHAR,
              recipe_type VARCHAR,
              recipe_description TEXT

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


            `);
            }
            catch (error) {
                console.log('\nThere was an error connecting to the database');
                console.log(error);
            }
        });
        this.disconnect = () => __awaiter(this, void 0, void 0, function* () {
            yield this.pool.end();
        });
        try {
            this.pool = new pg_1.Pool({ connectionString });
        }
        catch (error) {
            console.log('Pool could not be created');
        }
    }
}
exports.SocialDataBaseConnection = SocialDataBaseConnection;
