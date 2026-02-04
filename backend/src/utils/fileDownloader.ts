import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const isVercel = process.env.VERCEL === '1';
const UPLOAD_DIR = isVercel ? '/tmp/uploads' : path.join(process.cwd(), 'public', 'uploads');

// Ensure directory exists - ONLY on local or as a attempt on serverless
try {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
} catch (e: any) {
    console.warn("[FileDownloader] Could not create upload directory, likely read-only filesystem:", e.message);
}

export const downloadAndSaveFile = async (url: string, prefix: string = 'asset'): Promise<string> => {
    // skip download on Vercel as we can't serve from /tmp easily without extra config
    if (isVercel) {
        console.log("[FileDownloader] Running on Vercel, skipping local save and returning original URL");
        return url;
    }
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
