"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
const port = 4005;
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.post("/events", (req, res) => {
    const event = req.body;
    console.log("Event Received", event.type);
    if (event.type === "UserCreated") {
        console.log("Processing event", event.type);
        console.log(event.data);
    }
    res.status(200).send({});
});
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
