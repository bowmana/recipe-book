interface User {
    user_id: number;
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



const app: Express = express();
const port: number = 4001;
app.use(logger("dev"));
app.use(express.json());
app.use(cors({origin: ["http://127.0.0.1:5173"], credentials: true, exposedHeaders: ["Set-Cookie"]}));

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
    const {email, password} = req.body;
    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }
    if (await helper.userExists(email)) {
        res.status(401).send('User already exists');
        return;
      }
    const newUser: User = await helper.createUser(email, password);
 

    const token: string = jwt.sign({user_id: newUser.user_id, email: newUser.email, role: newUser.role}, process.env.JWT_SECRET as string, {expiresIn: "1hr"});
    await helper.setToken(newUser.user_id, token);
    const user: User = await helper.getUserByID(newUser.user_id);

    await axios.post("http://localhost:4005/events", {
        type: "UserCreated",
        data: {
            user_id: user.user_id,
            email: user.email,
        }
    }).catch((err) => {
        console.log(err.message);
    });
    
    res.setHeader('Access-Control-Expose-Headers', '*');
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly`);
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
                email: user.email,
            }
        });


  
        
  
      res.setHeader('Access-Control-Expose-Headers', '*');
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly`);
      res.status(200).json(user);
      return;
    }
  
    res.status(400).send('Invalid credentials');
  });
  





  app.post('/auth', verifyToken, (req: any, res: Response) => {
    res.status(200).send(req.user);
  });
  
  
  
  app.post('/logout', async (req: Request, res: Response) => {
    const token = req.headers.cookie?.split('=')[1];
  
    if (!token) {
      res.status(200).send('Already not logged in');
      return;
    }
  
    res.setHeader('Set-Cookie', 'token=expired; HttpOnly');
    res.status(200).send('Logged out');
  });
  
  
  
  app.listen(port, () => {
    console.log(`Authentication listening on ${port}`);
  })



