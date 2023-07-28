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
exports.updateEmail = exports.updateUserName = exports.getProfileImageKey = exports.getProfileImage = exports.setProfileImage = exports.matchPassword = exports.getUserByID = exports.setToken = exports.userExists = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db/db");
const dbConn = new db_1.DataBaseConnection();
dbConn.connect();
const getUserByID = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT
        *
      FROM
        users
      WHERE
        user_id = $1
    ;`, [user_id]);
        return result.rowCount === 0 ? false : result.rows[0];
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database');
        console.log(error);
    }
});
exports.getUserByID = getUserByID;
const userExists = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        SELECT
          *
        FROM
          users
        WHERE
          email = $1
      ;`, [email.toLowerCase()]);
        return result.rowCount === 0 ? false : result.rows[0];
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database');
        console.log(error);
    }
});
exports.userExists = userExists;
const createUser = (email, user_name, password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt(10);
    const hash = yield bcrypt_1.default.hash(password, salt);
    try {
        const result = yield dbConn.pool.query(`
        INSERT INTO
          users(email, user_name, password)
        VALUES
          ($1, $2, $3)
        RETURNING *
      ;`, [email.toLowerCase(), user_name, hash]);
        return result.rowCount === 0 ? false : result.rows[0];
    }
    catch (error) {
        console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database');
        console.log(error);
    }
});
exports.createUser = createUser;
const setToken = (user_id, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE
          users
        SET
          token = $1
        WHERE
          user_id = $2
      ;`, [token, user_id]);
    }
    catch (error) {
        console.log('\nThere was an error setting the user\'s token');
        console.log(error);
    }
});
exports.setToken = setToken;
const setProfileImage = (user_id, profile_image) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE
          users
        SET
          profile_image = $1
        WHERE
          user_id = $2
      ;`, [profile_image, user_id]);
    }
    catch (error) {
        console.log('\nThere was an error setting the user\'s profile image');
        console.log(error);
    }
});
exports.setProfileImage = setProfileImage;
const getProfileImage = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
        SELECT
          profile_image
        FROM
          users
        WHERE
          user_id = $1
      ;`, [user_id]);
        return result.rowCount === 0 ? false : result.rows[0].profile_image;
    }
    catch (error) {
        console.log('\nThere was an error getting the user\'s profile image');
        console.log(error);
    }
});
exports.getProfileImage = getProfileImage;
const getProfileImageKey = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbConn.pool.query(`
      SELECT
        profile_image
      FROM
        users
      WHERE
        user_id = $1
    ;`, [user_id]);
        if (result.rowCount === 0) {
            return false;
        }
        const url = result.rows[0].profile_image;
        const cloudfrontDomain = 'https://d1uvjvhzktlyb3.cloudfront.net/';
        const key = url.replace(cloudfrontDomain, '');
        return key;
    }
    catch (error) {
        console.error('Error while getting the profile image key:', error);
        return null;
    }
});
exports.getProfileImageKey = getProfileImageKey;
const matchPassword = (password, hashPassword) => {
    const match = bcrypt_1.default.compare(password, hashPassword);
    return match;
};
exports.matchPassword = matchPassword;
// await helper.updateUserName(user_id, user_name);
const updateUserName = (user_id, user_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE
          users
        SET
          user_name = $1
        WHERE
          user_id = $2
      ;`, [user_name, user_id]);
    }
    catch (error) {
        console.log('\nThere was an error updating the user\'s username');
        console.log(error);
    }
});
exports.updateUserName = updateUserName;
const updateEmail = (user_id, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConn.pool.query(`
        UPDATE
          users
        SET
          email = $1
        WHERE
          user_id = $2
      ;`, [email, user_id]);
    }
    catch (error) {
        console.log('\nThere was an error updating the user\'s email');
        console.log(error);
    }
});
exports.updateEmail = updateEmail;
