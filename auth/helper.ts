
import bcrypt from "bcrypt";
import { DataBaseConnection } from "./db/db";
import { QueryResult } from "pg";


const dbConn = new DataBaseConnection();
dbConn.connect();


const getUserByID = async (user_id: number) => {
  try {

    const result: QueryResult = await dbConn.pool.query(`
      SELECT
        *
      FROM
        users
      WHERE
        user_id = $1
    ;`, [user_id]);

    return result.rowCount === 0 ? false : result.rows[0];

  } catch (error) {

    console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database');
    console.log(error);

  }
};


const userExists = async (email: string) => {
    try {
  
      const result: QueryResult = await dbConn.pool.query(`
        SELECT
          *
        FROM
          users
        WHERE
          email = $1
      ;`, [email.toLowerCase()]);
  
      return result.rowCount === 0 ? false : result.rows[0];
  
    } catch (error) {
  
      console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database');
      console.log(error);
  
    }
  }

const createUser = async (email: string, user_name: string, password: string) => {
    const salt: string = await bcrypt.genSalt(10);
    const hash: string = await bcrypt.hash(password, salt);

    try {
      const result: QueryResult = await dbConn.pool.query(`
        INSERT INTO
          users(email, user_name, password)
        VALUES
          ($1, $2, $3)
        RETURNING *
      ;`, [email.toLowerCase(), user_name, hash]);

      return result.rowCount === 0 ? false : result.rows[0];

    } catch (error) {

      console.log('\nCouldn\'t execute query because the pool couldn\'t connect to the database');
      console.log(error);

    }
  };


  const setToken = async (user_id: number, token: string) => {
    try {
  
      await dbConn.pool.query(`
        UPDATE
          users
        SET
          token = $1
        WHERE
          user_id = $2
      ;`, [token, user_id]);
  
    } catch (error) {
  
      console.log('\nThere was an error setting the user\'s token');
      console.log(error);
      
    }
  };

  const setProfileImage = async (user_id: number, profile_image: string) => {
    try {

      await dbConn.pool.query(`
        UPDATE
          users
        SET
          profile_image = $1
        WHERE
          user_id = $2
      ;`, [profile_image, user_id]);

    } catch (error) {


      console.log('\nThere was an error setting the user\'s profile image');
      console.log(error);

    }
  };

  const getProfileImage = async (user_id: number) => {
    try {

      const result: QueryResult = await dbConn.pool.query(`
        SELECT
          profile_image
        FROM
          users
        WHERE
          user_id = $1
      ;`, [user_id]);

      return result.rowCount === 0 ? false : result.rows[0].profile_image;

    } catch (error) {

      console.log('\nThere was an error getting the user\'s profile image');
      console.log(error);

    }
  };
const getProfileImageKey = async (user_id: number) => {
  try {

    const result: QueryResult = await dbConn.pool.query(`
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
  } catch (error) {
    console.error('Error while getting the profile image key:', error);
    return null;
  }
};








  const matchPassword = (password: string, hashPassword: string) => {

    const match = bcrypt.compare(password, hashPassword);
    return match;
  
  };
  // await helper.updateUserName(user_id, user_name);

  const updateUserName = async (user_id: number, user_name: string) => {
    try {

      await dbConn.pool.query(`
        UPDATE
          users
        SET
          user_name = $1
        WHERE
          user_id = $2
      ;`, [user_name, user_id]);

    } catch (error) {

      console.log('\nThere was an error updating the user\'s username');
      console.log(error);

    }
  };

  const updateEmail = async (user_id: number, email: string) => {
    try {

      await dbConn.pool.query(`
        UPDATE
          users
        SET
          email = $1
        WHERE
          user_id = $2
      ;`, [email, user_id]);

    } catch (error) {

      console.log('\nThere was an error updating the user\'s email');
      console.log(error);

    }
  };



  export {createUser, userExists, setToken, getUserByID, matchPassword, setProfileImage, getProfileImage, getProfileImageKey, updateUserName, updateEmail};