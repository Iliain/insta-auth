# Instagram Authenticator

## About

This app is designed to handle the login and authentication process for creating Instagram Basic Display API Access Tokens. Sites can use the `/instagram/auth` endpoint to prompt a login which will eventually return an access token.

Also included is the ability to request a User Access Token from the Facebook Graph API.

## Instagram Endpoints
### /instagram/auth

The endpoint your code will need to redirect to initially. Additionally, a URL param named `return` must be supplied in order for the app to redirect your access token to. This should be a URL that expects an incoming token and is ready to save it.

Example auth link:
```
https://auth.test.com/instagram/auth?return=https://mysite.com/auth-handler
```
The above will redirect to the following upon completion:
```
https://mysite.com/auth-handler?access_token=xxxxxxxxxxxxxxx&expires_in=5183944
```
### /instagram/auth/callback

This endpoint should not be called manually. Instead, the Instagram login will automatically redirect to this endpoint and query the Graph API for an access token.

### /instagram/auth/exchange

This endpoint should not be called manually. Instead, the app will redirect to this endpoint upon collecting a short access token and will query the Graph API for a Long Access Token. Once done, it will redirect to your originally supplied URL with the access token included as a URL param named `access_token`.

### /instagram/auth/refresh

This endpoint should be called when your current Long Lived Access Token is older than 24 hours but younger than 60 days (tokens expire after 60 days) and you want to manually refresh your token. As this query to the Graph API does not require any API credentials, only the token you wish to refresh, it is recommended you automate this on your own platform. If expired, you will instead need to reauthorise. This endpoint expects two parameters: `access_token` and `return`;

Example refresh link:
```
https://auth.test.com/instagram/auth/refresh?access_token=xxxxxxxxxxxxxxxxxxxx&return=https://mysite.com/refresh-handler
```
The above will redirect to the following upon completion:
```
https://mysite.com/refresh-handler?access_token=xxxxxxxxxxxxxxx&expires_in=5183944
```

### /instagram/deauth

TODO

## Facebook Endpoints
### /facebook/auth

The endpoint your code will need to redirect to initially. Additionally, two URL params named `state` and `return` must be supplied in order for the app to prevent CSRF and redirect your access token to. These should be a random number and URL that expects an incoming token and is ready to save it, respectively.

Example auth link:
```
https://auth.test.com/facebook/auth?state=123456&return=https://mysite.com/auth-handler
```
The above will redirect to the following upon completion:
```
https://mysite.com/auth-handler?access_token=xxxxxxxxxxxxxxx&expires_in=5183944
```
### /facebook/auth/callback

This endpoint should not be called manually. Instead, the Facebook login will automatically redirect to this endpoint and query the Graph API for an access token.

### /facebook/auth/exchange

This endpoint should not be called manually. Instead, the app will redirect to this endpoint upon collecting a short access token and will query the Graph API for a Long Access Token. Once done, it will redirect to your originally supplied URL with the access token included as a URL param named `access_token`.

## Environment

The following environment variables must be present:

```
INSTA_APP_ID=1234567890
INSTA_APP_SECRET=abcdefghijklmnopqrstuvwxyz
INSTA_REDIRECT_URI=https://localhost:3000/instagram/auth/callback
FB_APP_ID=1234567890
FB_APP_SECRET=abcdefghijklmnopqrstuvwxyz
FB_REDIRECT_URI=https://localhost:3000/facebook/auth/callback
PORT=3000
```

For a production environment, ensure that the URL is changed to match the host. Depending on where this is hosted, PORT may or may not be needed. Additionally, you should ensure that NODE_ENV has been set to "production" on the production environment.

As the Instagram API requires HTTPS, the https package has been included for local development. These are unnecessary in a production environment and should not be configured. You will need to provide a key and certificate, then specify their location:

```
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```
