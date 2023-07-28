interface User {
    user_id: number;
    user_name: string;
    email: string;
    password: string;
    role: number;
    token: string;
  }


import express, {Express,Request, Response} from "express";
import * as helper from "./helper";
import axios from "axios";
import cors from "cors";
import jwt from "jsonwebtoken";
import logger from 'morgan';
import { parse } from "dotenv";
import multer from "multer";
import path from "path";
import { S3Bucket } from "./db/s3bucket";
import { Event, UsernameUpdated, EmailUpdated} from "./event_types";

import e from "express";
const storage = multer.memoryStorage();
const upload = multer( { storage: storage} );
const s3Bucket = new S3Bucket();
s3Bucket.checkConnection();


const app: Express = express();
const port: number = 4001;
app.use(logger("dev"));

app.use(cors({origin: ["http://127.0.0.1:5173"], credentials: true, exposedHeaders: ["Set-Cookie"]}));
app.use(express.json());


const verifyToken = async (req: any, res: Response, next: any) => {
    if (req.headers.cookie) {
      const token = req.headers.cookie.split('=')[1];
  
      if (!token) {
        return res.status(403).send("A token is required for authentication");
      }
  
      try {
        const decoded = jwt.verify(token, String(process.env.JWT_SECRET));
        req.user = decoded;
    
        if (!(await helper.userExists(req.user.email))) {
          return res.status(401).send("Invalid Token");
        }
      } catch (err) {
        return res.status(401).send("Invalid Token");
      }
    } else {
      return res.status(403).send("A token is required for authentication");
    }
    
    return next();
  };


app.post("/register", async (req: Request, res: Response) => {
    const {email, user_name, password} = req.body;
    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }
    if (await helper.userExists(email)) {
        res.status(401).send('User already exists');
        return;
      }
    const newUser: User = await helper.createUser(email, user_name, password);
 

    const token = jwt.sign({user_id: newUser.user_id, email: newUser.email, role: newUser.role}, process.env.JWT_SECRET as string, {expiresIn: "1hr"});
    await helper.setToken(newUser.user_id, token);
    const user: User = await helper.getUserByID(newUser.user_id);
    

    await axios.post("http://localhost:4005/events", {
        type: "UserCreated",
        data: {
            user_id: user.user_id,
            user_name: user.user_name,
            email: user.email,
        }
    }).catch((err) => {
        console.log(err.message);
    });
    
    res.setHeader('Access-Control-Expose-Headers', '*');
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; SameSite=None; Secure`);
    res.status(201).send(user);

});


app.post('/login', async (req: Request, res: Response) => {
    const { email, password }: {email: string, password: string} = req.body;
  
    if (!email || !password) {
      res.status(400).send('All fields required');
      return;
    }
  
    const user: User = await helper.userExists(email);
  
    if (!user.user_id) {
      res.status(401).send('User not found');
      return;
    }
  
    if (await helper.matchPassword(password, user.password)) {
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        String(process.env.JWT_SECRET),
        {
          expiresIn: '1hr',
        }
      );
  
      await helper.setToken(user.user_id, token);
        

        await axios.post("http://localhost:4005/events", {
            type: "LoginSuccess",
            data: {
                user_id: user.user_id,
                user_name: user.user_name,
                email: user.email,
            }
        });

      res.setHeader('Access-Control-Expose-Headers', '*');
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; SameSite=None; Secure`);
      res.status(200).json(user);
      return;
    }
  
    res.status(400).send('Invalid credentials');
  });
  

app.post('/user/:user_id/profile-image', upload.single('profile_image'), async (req: any, res: Response) => {
  const profile_image: Express.Multer.File = req.file as Express.Multer.File;
  const user_id: number = parseInt(req.params.user_id);
  console.log(profile_image, 'file');
  if (!profile_image) {
    res.status(400).send('No image uploaded');
    return;
  }
  const existingProfileImageKey = await helper.getProfileImage(user_id);
  if (existingProfileImageKey) {
    console.log(existingProfileImageKey, 'existingProfileImageKey');
    await s3Bucket.deleteFilesWithPrefix(`profile-images/${user_id}`);
    console.log(`Existing profile picture deleted for user ${user_id}`);
  }
  const url = `https://d1uvjvhzktlyb3.cloudfront.net/profile-images/${user_id}/` + path.basename(await s3Bucket.uploadFile(profile_image, user_id))
  await helper.setProfileImage(user_id, url);
  res.status(200).send(url);

  
  console.log(url, 'url');
  console.log(user_id, 'user_id');

});


app.get('/user/:user_id/profile-image', async (req: Request, res: Response) => {
  const user_id: number = parseInt(req.params.user_id);
  const url = await helper.getProfileImage(user_id);
  if(!url) {
    res.status(200).send(undefined);
    return;
  }
  res.status(200).send(url);
  return;

});

app.post('/events', async (req: Request, res: Response) => {
  const event: Event = req.body;
  console.log('Received Event', event.type);
  if (event.type === 'UsernameUpdated') {
    const { user_id, user_name } = event.data;
    await helper.updateUserName(user_id, user_name);
    res.status(200).send('Username updated');
    return;
  }

  if (event.type === 'EmailUpdated') {
    const { user_id, email } = event.data;
    await helper.updateEmail(user_id, email);
    res.status(200).send('Email updated');
    return;
  }
  res.status(200).send('Event received');
  return;
});





  app.post('/auth', verifyToken, async(req: any, res: Response) => {
    const user: User = await helper.getUserByID(req.user.user_id);
    req.user.user_name = user.user_name;
    res.status(200).send(req.user);
  });
  
  
  
  app.post('/logout', async (req: Request, res: Response) => {
    const token = req.headers.cookie?.split('=')[1];
    console.log(token, "token in logout pre expiration");
    res.setHeader('Set-Cookie', 'token=expired; HttpOnly; Max-Age=0; SameSite=None; Secure');

    res.status(200).send('Logged out');
  });
  
  
  
  app.listen(port, () => {
    console.log(`Authentication listening on ${port}`);
  })



