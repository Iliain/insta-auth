import axios from 'axios';

export default function(app, envData) {
    const APP_ID = envData.INSTA_APP_ID;
    const APP_SECRET = envData.INSTA_APP_SECRET;
    const REDIRECT_URI = envData.INSTA_REDIRECT_URI;
    let returnURL = '';

    app.get('/instagram/auth', (req, res) => {
        returnURL = req.query.return;

        if (!returnURL) {
            res.send('Missing return URL');
            return;
        }

        console.log(`Instagram authentication request from ${returnURL}`);

        const authUrl = `https://api.instagram.com/oauth/authorize/?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media,instagram_graph_user_profile,instagram_graph_user_media&response_type=code`;
        res.redirect(authUrl);
    });

    app.get('/instagram/auth/callback', (req, res) => {
        const data = {
            client_id: APP_ID,
            client_secret: APP_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            code: req.query.code
        };

        axios.post('https://api.instagram.com/oauth/access_token', data, { headers: {
            'Content-Type':'multipart/form-data',
            'Access-Control-Allow-Origin': '*',
        }})
            .then((response) => {
                const token = response.data.access_token;

                if (!token) {
                    res.send('Something went wrong, no token returned.')
                } else {
                    res.redirect(`/instagram/auth/exchange?access_token=${token}`);
                }
            }).catch((err) => {
                console.log(err);
                res.send('There was an error with the callback function.');
            });
    });

    app.get('/instagram/auth/exchange', (req, res) => {
        if (!req.query.access_token) {
            res.send('Missing short-lived access token');
            return;
        }

        axios.get(`https://graph.instagram.com/access_token?client_secret=${APP_SECRET}&grant_type=ig_exchange_token&access_token=${req.query.access_token}`)
            .then((response) => {
                const token = response.data.access_token;

                if (!token) {
                    res.send('Something went wrong, no long lived token returned.')
                } else {
                    console.log('Authentication successful');
                    res.redirect(`${returnURL}?access_token=${token}&expires_in=${response.data.expires_in}`);
                }
            }).catch((err) => {
                console.log(err);
                res.send('There was an error with the exchange function.');
            });
    });

    app.get('/instagram/auth/refresh', (req, res) => {
        returnURL = req.query.return;
        const incomingToken = req.query.access_token;

        if (!returnURL) {
            res.send('Missing return URL');
            return;
        }
        
        if (!incomingToken) {
            res.send('Missing access token');
            return;
        }

        axios.get(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${incomingToken}`)
            .then((response) => {
                const token = response.data.access_token;

                if (!token) {
                    res.send('Something went wrong, no long lived token returned.')
                } else {
                    console.log('Refresh successful');
                    res.redirect(`${returnURL}?access_token=${token}&expires_in=${response.data.expires_in}`);
                }
            }).catch((err) => {
                console.log(err);
                res.send('There was an error with the refresh function.');
            });
    });

    app.get('/instagram/deauth', (req, res) => {
        res.send('A user has deauthorised this app.');
    });

    app.get('/instagram/datadelete', (req, res) => {
        res.send('This app does not store any user data, but rather provides websites with access credentials. We recommend contacting any websites that utilised this app and request they delete any stored information.');
    });
}
