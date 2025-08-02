import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import { promisify } from "util";
import path from 'path';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const unlinkFile = promisify(fs.unlink);

export const uploadOnCloudinary = async (
    filePath: string,
    folderName: string
): Promise<UploadApiResponse | null> => {
    try {
        if (!filePath) return null;

        const ext = path.extname(filePath).toLowerCase();

        // Determine Cloudinary resource type
        let resourceType: 'image' | 'video' | 'raw' = 'raw';

        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            resourceType = 'image';
        } else if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) {
            resourceType = 'video';
        }

        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: resourceType,
            folder: folderName,
        });

        await unlinkFile(filePath); // remove local file after upload
        return result;
    } catch (error) {
        if (fs.existsSync(filePath)) await unlinkFile(filePath);
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};

export const deleteFromCloudinary = (
    publicId: string
): Promise<{ result: string }> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error("Error deleting file from Cloudinary:", error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};