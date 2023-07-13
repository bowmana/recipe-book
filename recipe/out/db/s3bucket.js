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
exports.S3Bucket = void 0;
const dotenv = __importStar(require("dotenv"));
const lib_storage_1 = require("@aws-sdk/lib-storage");
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
dotenv.config({ path: '../.env' });
class S3Bucket {
    constructor() {
        this.s3 = new client_s3_1.S3({
            region: process.env.AWS_BUCKET_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        this.bucketName = process.env.AWS_BUCKET_NAME;
    }
    checkConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.s3.headBucket({ Bucket: this.bucketName });
                console.log(`S3 bucket "${this.bucketName}" connection successful.`);
                return true;
            }
            catch (error) {
                console.error('Failed to establish S3 bucket connection:', error);
                return false;
            }
        });
    }
    //upload as blob
    uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const upload = new lib_storage_1.Upload({
                client: this.s3,
                params: {
                    Bucket: this.bucketName,
                    Key: (0, crypto_1.randomBytes)(16).toString("hex") + path_1.default.extname(file.originalname),
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }
            });
            const result = yield upload.done();
            const url = result.Location;
            return url;
        });
    }
    duplicateFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });
            const existingFile = yield this.s3.send(command);
            const newKey = (0, crypto_1.randomBytes)(16).toString("hex") + path_1.default.extname(key);
            const upload = new lib_storage_1.Upload({
                client: this.s3,
                params: {
                    Bucket: this.bucketName,
                    Key: newKey,
                    Body: existingFile.Body,
                    ContentType: existingFile.ContentType
                }
            });
            const result = yield upload.done();
            const url = result.Location;
            return url;
        });
    }
    fileExists(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });
            try {
                yield this.s3.send(command);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    deleteFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });
            try {
                yield this.s3.send(command);
                console.log(`S3 bucket "${this.bucketName}" file deleted.`);
            }
            catch (error) {
                console.error('Failed to delete S3 bucket file:', error);
            }
        });
    }
    getFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });
            return yield this.s3.send(command);
        });
    }
}
exports.S3Bucket = S3Bucket;
