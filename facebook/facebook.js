import axios from 'axios';

export default function(app, envData) {
    const APP_ID = envData.FB_APP_ID;
    const APP_SECRET = envData.FB_APP_SECRET;
    const REDIRECT_URI = envData.FB_REDIRECT_URI;
    let returnURL = '';
    let state = '';

    app.get('/facebook/auth', (req, res) => {
        returnURL = req.query.return;
        state = req.query.state;

        if (!returnURL) {
            res.send('Missing return URL');
            return;
        }

        if (!state) {
            res.send('Missing state');
            return;
        }

        console.log(`Facebook authentication request from ${returnURL}`);

        const authURL = `https://www.facebook.com/v15.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&scope=user_posts`;

        res.redirect(authURL);
    });

    app.get('/facebook/auth/callback', (req, res) => {
        if (req.query.state !== state) {
            res.send('State does not match');
            return;
        }

        const data = {
            client_id: APP_ID,
            client_secret: APP_SECRET,
            redirect_uri: REDIRECT_URI,
            code: req.query.code
        };

        axios.post('https://graph.facebook.com/v15.0/oauth/access_token', data, { headers: {
            'Content-Type':'multipart/form-data',
            'Access-Control-Allow-Origin': '*',
        }})
            .then((response) => {
                const token = response.data.access_token;

                if (!token) {
                    res.send('Something went wrong, no token returned.')
                } else {
                    res.redirect(`/facebook/auth/exchange?access_token=${token}`);
                }
            }).catch((err) => {
                console.log(err);
                res.send('There was an error with the callback function.');
            });
    });

    app.get('/facebook/auth/exchange', (req, res) => {
        if (!req.query.access_token) {
            res.send('Missing short-lived access token');
            return;
        }

        axios.get(`https://graph.facebook.com/v14.0/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&grant_type=fb_exchange_token&fb_exchange_token=${req.query.access_token}`)
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

    app.get('/facebook/deauth', (req, res) => {
        res.send('A user has deauthorised this app.');
    });

    app.get('/facebook/datadelete', (req, res) => {
        res.send('This app does not store any user data, but rather provides websites with access credentials. We recommend contacting any websites that utilised this app and request they delete any stored information.');
    });
}
