/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import multer from 'multer';
import Jimp from 'jimp';
import dotenv from 'dotenv';

dotenv.config();

// Initialize AWS S3 Client using AWS SDK v3
const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESSKEYID||'',
    secretAccessKey: process.env.SECRETACCESSKEY || '',
  },
});

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/jpg',
  'image/gif',
  'image/jfif',
];

// Multer file filter to validate file types
const fileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'نوع الملف غير صالح. يُسمح فقط بملفات PDF، JPG، PNG، WEBP، SVG، GIF، وJFIF..'
      ),
      false
    );
  }
};

// Initialize Multer middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: fileFilter,
});

// Function to convert images to WebP format using Jimp
const convertToWebP = async (inputBuffer: Buffer): Promise<Buffer> => {
  const image = await Jimp.read(inputBuffer);
  return image.getBufferAsync(Jimp.MIME_BMP);
};

// Middleware to upload a single file to S3
const uploadFileToS3 =
  (bucketName: string) =>
  async (req: any, res: express.Response, next: express.NextFunction) => {
    console.log('uploadFileToS3 middleware triggered');
    if (!req.file) {
      next();
      req.file = null;
      return;
    }

    try {
      let fileBuffer = req.file.buffer;
      const isImage = [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/jpg',
        'image/gif',
        'image/jfif',
      ].includes(req.file.mimetype);

      if (isImage) {
        fileBuffer = await convertToWebP(req.file.buffer);

        req.file.mimetype = 'image/webp';
        req.file.originalname = req.file.originalname.replace(
          /\.(jpg|jpeg|png|jfif)$/i,
          '.webp'
        );
      }

      const params = {
        Bucket: bucketName,
        Key: `${Date.now()}_${req.file.originalname}`,
        Body: fileBuffer,
        ContentType: req.file.mimetype,
      };
      console.log('Upload parameters:', params);

      // Using Upload from @aws-sdk/lib-storage for multipart uploads
      const parallelUploads3 = new Upload({
        client: s3Client,
        params: params,
      });

      // Optional: Monitor upload progress
      parallelUploads3.on('httpUploadProgress', (progress:any) => {
        console.log('Upload Progress:', progress);
      });

      const data = await parallelUploads3.done();
      req.file.s3 = data;
      next();
    } catch (err) {
      console.error('Error in uploadFileToS3:', err);
      next(err);
    }
  };

// Middleware to upload multiple files to S3
const uploadFilesToS3 =
  (bucketName: string) =>
  async (req: any, res: express.Response, next: express.NextFunction) => {
    const uploadedFiles: any[] = [];

    if (!req.files) {
      req.files = {};
    }

    if (!req.files['file'] && !req.files['documents'] && !req.files['cover']) {
      req.files.uploadedToS3 = uploadedFiles;
      next();
      return;
    }

    try {
      if (req.files['file']) {
        const file = req.files['file'][0];
        let fileBuffer = file.buffer;

        const isImage = [
          'image/jpeg',
          'image/png',
          'image/svg+xml',
          'image/jpg',
          'image/gif',
          'image/jfif',
        ].includes(file.mimetype);

        if (isImage) {
          fileBuffer = await convertToWebP(file.buffer);
          file.mimetype = 'image/webp';
          file.originalname = file.originalname.replace(
            /\.(jpg|jpeg|png|jfif)$/i,
            '.webp'
          );
        }

        const params = {
          Bucket: bucketName,
          Key: `${Date.now()}_${file.originalname}`,
          Body: fileBuffer,
          ContentType: file.mimetype,
        };


        const parallelUploads3 = new Upload({
          client: s3Client,
          params: params,
        });

        parallelUploads3.on('httpUploadProgress', (progress: any) => {
        });

        const data = await parallelUploads3.done();
        uploadedFiles.push({ originalname: file.originalname, s3Data: data });

        if (uploadedFiles.length > 0) {
          req.body.image = uploadedFiles[0].s3Data.Location;
        }
      }

      if (req.files['cover']) {
        const coverFile = req.files['cover'][0];
        let coverBuffer = coverFile.buffer;

        const isImage = [
          'image/jpeg',
          'image/png',
          'image/svg+xml',
          'image/jpg',
          'image/gif',
          'image/jfif',
        ].includes(coverFile.mimetype);

        if (isImage) {
          coverBuffer = await convertToWebP(coverFile.buffer);
          coverFile.mimetype = 'image/webp';
          coverFile.originalname = coverFile.originalname.replace(
            /\.(jpg|jpeg|png|jfif)$/i,
            '.webp'
          );
        }

        const coverParams = {
          Bucket: bucketName,
          Key: `${Date.now()}_${coverFile.originalname}`,
          Body: coverBuffer,
          ContentType: coverFile.mimetype,
        };

        console.log('📤 تحميل غلاف بالمعلومات:', coverParams);

        const coverUpload = new Upload({
          client: s3Client,
          params: coverParams,
        });

        coverUpload.on('httpUploadProgress', (progress: any) => {
        });

        const coverData = await coverUpload.done();
        uploadedFiles.push({ originalname: coverFile.originalname, s3Data: coverData });

        if (uploadedFiles.length > 0) {
          req.body.cover = uploadedFiles[uploadedFiles.length - 1].s3Data.Location;
        }
      }

      if (req.files['documents']) {
        const documentFiles = req.files['documents'];
        const documentUploadPromises = documentFiles.map(async (docFile: any) => {
          let docBuffer = docFile.buffer;

          const isImage = [
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/jpg',
            'image/gif',
          ].includes(docFile.mimetype);

          if (isImage) {
            docBuffer = await convertToWebP(docFile.buffer);
            docFile.mimetype = 'image/webp';
            docFile.originalname = docFile.originalname.replace(
              /\.(jpg|jpeg|png)$/i,
              '.webp'
            );
          }

          const docParams = {
            Bucket: bucketName,
            Key: `${Date.now()}_${docFile.originalname}`,
            Body: docBuffer,
            ContentType: docFile.mimetype,
          };


          const parallelUploads3 = new Upload({
            client: s3Client,
            params: docParams,
          });

          parallelUploads3.on('httpUploadProgress', (progress:any) => {
            console.log('Upload Progress:', progress);
          });

          const docData = await parallelUploads3.done();
          return { originalname: docFile.originalname, s3Data: docData };
        });

        const documentUploadResults = await Promise.all(documentUploadPromises);
        uploadedFiles.push(...documentUploadResults);

        const images: string[] = uploadedFiles.map(
          (file) => file.s3Data?.Location
        );

        req.body = {
          ...req.body,
          images: images,
        };
      }
      next();
    } catch (err) {
      console.error('Error in uploadFilesToS3:', err);
      next(err);
    }
  };


// Middleware to delete a single file from S3
const deleteFileFromS3 =
  (bucketName: string) =>
  async (req: any, res: express.Response, next: express.NextFunction) => {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).send('اسم الملف مطلوب لحذفه.');
    }

    try {
      const params = {
        Bucket: bucketName,
        Key: fileName,
      };
      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
      res.send('تم حذف الملف بنجاح');
    } catch (err) {
      console.error('Error in deleteFileFromS3:', err);
      next(err);
    }
  };

// Utility function to delete a file from S3
const deleteFile = async (
  bucketName: string,
  fileName: string
): Promise<{ status: number; message: string }> => {
  try {
    if (!fileName) {
      return {
        status: 400,
        message: 'اسم الملف مطلوب لحذفه.',
      };
    }
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    return {
      status: 200,
      message: 'تم حذف الملف بنجاح',
    };
  } catch (err) {
    console.error('حدث خطأ في دالة الحذف:', err);
    return {
      status: 500,
      message: 'فشل في حذف الملف.',
    };
  }
};

// Middleware to list all files in an S3 bucket
const listFilesInS3 =
  (bucketName: string) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const params = {
        Bucket: bucketName,
      };
      const command = new ListObjectsV2Command(params);
      const data = await s3Client.send(command);
      res.json(data.Contents);
    } catch (err) {
      console.error('Error in listFilesInS3:', err);
      next(err);
    }
  };

// Exporting all functionalities
export default {
  upload,
  uploadFileToS3,
  uploadFilesToS3,
  deleteFileFromS3,
  deleteFile,
  listFilesInS3,
};
