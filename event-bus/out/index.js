"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
const port = 4005;
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.post("/events", (req, res) => {
    const event = req.body;
    axios_1.default.post("http://localhost:4000/events", event).catch((err) => {
        console.log(err.message);
    });
    axios_1.default.post("http://localhost:4002/events", event).catch((err) => {
        console.log(err.message);
    });
});
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
