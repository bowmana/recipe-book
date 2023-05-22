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
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 4005;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.post("/events", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    console.log("Event Received", event.type);
    console.log(event.data, 'event data');
    if (event.type === "UserCreated") {
        try {
            if (!event.data.user_id || !event.data.email) {
                res.status(400).send('user_id or email is missing');
            }
            // if(typeof event.data.user_id !== 'number' || typeof event.data.email !== 'string') {
            //     console.log(typeof event.data.user_id, typeof event.data.email, 'user_id and email')
            //     res.status(400).send('user_id or email is not the correct type');
            // }
            yield axios_1.default.post("http://localhost:4000/events", event);
            console.log("Event sent to recipe service");
        }
        catch (err) {
            console.log(err);
        }
    }
    res.status(200).send({});
}));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
