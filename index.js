import express from 'express';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import instagram from './instagram/instagram.js';
import facebook from './facebook/facebook.js';

// Read from .env file in dev environment
if (process.env.NODE_ENV !== "production") {
    config();
}

const app = express();
const port = process.env.PORT || 3000;
app.set('trust proxy', true);

// Import app details from environment
const INSTA_APP_ID = process.env.INSTA_APP_ID;
const INSTA_APP_SECRET = process.env.INSTA_APP_SECRET;
const INSTA_REDIRECT_URI = process.env.INSTA_REDIRECT_URI;
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI;

const envData = { INSTA_APP_ID, INSTA_APP_SECRET, INSTA_REDIRECT_URI, FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI };

if ((!INSTA_APP_ID || !INSTA_APP_SECRET) || (!FB_APP_ID || !FB_APP_SECRET)) {
    console.error('Missing app details');
    process.exit(1);
}

// Begin listening
if (process.env.NODE_ENV !== "production") {
    // If in a dev environment, use server to allow for HTTPS
    if (!process.env.SSL_KEY_PATH || !process.env.SSL_CERT_PATH) {
        console.error('Please set SSL_KEY_PATH and SSL_CERT_PATH');
        process.exit(1);
    }

    const key = readFileSync(process.env.SSL_KEY_PATH);
    const cert = readFileSync(process.env.SSL_CERT_PATH);
    const server = createServer({key: key, cert: cert }, app);

    server.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
} else {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
}

app.get('/', (req, res) => {
    res.send('App is running. Please query an endpoint.');
});

instagram(app, envData);
facebook(app, envData);
