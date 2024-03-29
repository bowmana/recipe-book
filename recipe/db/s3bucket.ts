
import * as dotenv from "dotenv";
import { Upload} from "@aws-sdk/lib-storage";

import { randomBytes } from "crypto";
import path from "path";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3, GetObjectCommand, GetObjectCommandOutput, DeleteObjectCommand, PutBucketPolicyCommand, GetBucketPolicyCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";

dotenv.config({ path: '../.env' });

export class S3Bucket {
    s3: S3;
    bucketName: string;
   
    constructor() {
        this.s3 = new S3({
            region: process.env.AWS_BUCKET_REGION as string,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
            }
        });
        this.bucketName = process.env.AWS_BUCKET_NAME as string;
    }

    async checkConnection(): Promise<boolean> {
        try {
          await this.s3.headBucket({ Bucket: this.bucketName });
          console.log(`S3 bucket "${this.bucketName}" connection successful.`);
          return true;
        } catch (error) {
          console.error('Failed to establish S3 bucket connection:', error);
          return false;
        }
      }




 //upload as blob
    async uploadFile(file: Express.Multer.File): Promise<string> {
        const upload = new Upload({
            client: this.s3,
            params: {
                Bucket: this.bucketName,
                Key: `recipe-images/${randomBytes(16).toString("hex") + path.extname(file.originalname)}`,
                Body: file.buffer,
                ContentType: file.mimetype,
             
            }
        });
        const result = await upload.done() as any;
        const url = result.Location;
    


        return url;
    }


 async duplicateFile(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });
        const existingFile = await this.s3.send(command);
        const newKey = `recipe-images/${randomBytes(16).toString("hex") + path.extname(key)}`;
        const upload = new Upload({
            client: this.s3,
            params: {
                Bucket: this.bucketName,
                Key: newKey,
                Body: existingFile.Body,
                ContentType: existingFile.ContentType
            }
        });
        const result = await upload.done() as any;
        const url = result.Location;
        return url;
    }

  async fileExists(key: string): Promise<boolean> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });
        try {
            await this.s3.send(command);
            return true;
        } catch (error) {
            return false;
        }
    }



    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });
        try{
        await this.s3.send(command);
        console.log(`S3 bucket "${this.bucketName}" file deleted.`);
        } catch (error) {
            console.error('Failed to delete S3 bucket file:', error);
        }
    }

    async getFile(key: string): Promise<GetObjectCommandOutput> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });
        return await this.s3.send(command);
    }
    




  }
