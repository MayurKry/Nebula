import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const downloadAndSaveFile = async (url: string, prefix: string = 'asset'): Promise<string> => {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });

        const extension = url.split('.').pop()?.split('?')[0] || 'bin';
        const filename = `${prefix}_${uuidv4()}.${extension}`;
        const filePath = path.join(UPLOAD_DIR, filename);

        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                // Return the relative URL for the frontend
                const relativeUrl = `/public/uploads/${filename}`;
                resolve(relativeUrl);
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        // Fallback to original URL if download fails
        return url;
    }
};
