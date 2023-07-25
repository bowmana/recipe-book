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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helper = __importStar(require("./helper"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const morgan_1 = __importDefault(require("morgan"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const s3bucket_1 = require("./db/s3bucket");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const s3Bucket = new s3bucket_1.S3Bucket();
s3Bucket.checkConnection();
const app = (0, express_1.default)();
const port = 4001;
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({ origin: ["http://127.0.0.1:5173"], credentials: true, exposedHeaders: ["Set-Cookie"] }));
app.use(express_1.default.json());
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.cookie) {
        const token = req.headers.cookie.split('=')[1];
        if (!token) {
            return res.status(403).send("A token is required for authentication");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, String(process.env.JWT_SECRET));
            req.user = decoded;
            if (!(yield helper.userExists(req.user.email))) {
                return res.status(401).send("Invalid Token");
            }
        }
        catch (err) {
            return res.status(401).send("Invalid Token");
        }
    }
    else {
        return res.status(403).send("A token is required for authentication");
    }
    return next();
});
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, user_name, password } = req.body;
    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }
    if (yield helper.userExists(email)) {
        res.status(401).send('User already exists');
        return;
    }
    const newUser = yield helper.createUser(email, user_name, password);
    const token = jsonwebtoken_1.default.sign({ user_id: newUser.user_id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "1hr" });
    yield helper.setToken(newUser.user_id, token);
    const user = yield helper.getUserByID(newUser.user_id);
    yield axios_1.default.post("http://localhost:4005/events", {
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
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).send('All fields required');
        return;
    }
    const user = yield helper.userExists(email);
    if (!user.user_id) {
        res.status(401).send('User not found');
        return;
    }
    if (yield helper.matchPassword(password, user.password)) {
        const token = jsonwebtoken_1.default.sign({ user_id: user.user_id, email: user.email, role: user.role }, String(process.env.JWT_SECRET), {
            expiresIn: '1hr',
        });
        yield helper.setToken(user.user_id, token);
        yield axios_1.default.post("http://localhost:4005/events", {
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
}));
app.post('/user/:user_id/profile-image', upload.single('profile_image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile_image = req.file;
    const user_id = parseInt(req.params.user_id);
    console.log(profile_image, 'file');
    if (!profile_image) {
        res.status(400).send('No image uploaded');
        return;
    }
    const url = "https://d1uvjvhzktlyb3.cloudfront.net/profile-images/" + path_1.default.basename(yield s3Bucket.uploadFile(profile_image));
    yield helper.setProfileImage(user_id, url);
    res.status(200).send(url);
    console.log(url, 'url');
    console.log(user_id, 'user_id');
}));
// await axios.put(
//   `http://localhost:4001/users/${user_id}`,
//   { email },
//   { withCredentials: true }
// );
// app.put('/user/email/:user_id', async (req: Request, res: Response) => {
//   const user_id: number = parseInt(req.params.user_id);
//   const {email} = req.body;
//   if (!email) {
//     res.status(400).send('No email provided');
//     return;
//   }
//   await helper.updateEmail(user_id, email);
//   res.status(200).send('Email updated');
//   return;
// });
// app.put('/user/username/:user_id', async (req: Request, res: Response) => {
//   const user_id: number = parseInt(req.params.user_id);
//   const {user_name} = req.body;
//   if (!user_name) {
//     res.status(400).send('No username provided');
//     return;
//   }
//   await helper.updateUserName(user_id, user_name);
//   res.status(200).send('Username updated');
//   return;
// });
app.get('/user/:user_id/profile-image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const url = yield helper.getProfileImage(user_id);
    if (!url) {
        res.status(404).send('No image found');
        return;
    }
    res.status(200).send(url);
    return;
}));
app.post('/events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    console.log('Received Event', event.type);
    if (event.type === 'UsernameUpdated') {
        const { user_id, user_name } = event.data;
        yield helper.updateUserName(user_id, user_name);
        res.status(200).send('Username updated');
        return;
    }
    if (event.type === 'EmailUpdated') {
        const { user_id, email } = event.data;
        yield helper.updateEmail(user_id, email);
        res.status(200).send('Email updated');
        return;
    }
    res.status(200).send('Event received');
    return;
}));
app.post('/auth', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield helper.getUserByID(req.user.user_id);
    req.user.user_name = user.user_name;
    res.status(200).send(req.user);
}));
app.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.cookie) === null || _a === void 0 ? void 0 : _a.split('=')[1];
    console.log(token, "token in logout pre expiration");
    res.setHeader('Set-Cookie', 'token=expired; HttpOnly; Max-Age=0; SameSite=None; Secure');
    res.status(200).send('Logged out');
}));
app.listen(port, () => {
    console.log(`Authentication listening on ${port}`);
});
