const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const config = require('../config');
const TOKEN_PATH = __dirname + '/storages/token.json'
class AuthGoogle {
    constructor() {

    }

    getAccessToken(type) {
        return new Promise((resolve, reject) => {
            const oAuth2Client = new google.auth.OAuth2(
                config.google.client_id,
                config.google.client_secret,
                config.google.redirect_url[0]
            );

            fs.readFile(TOKEN_PATH, async (err, token) => {
                if (err) {
                    let data = await this.getToken(oAuth2Client, type);
                    resolve(data);
                } else {
                    oAuth2Client.setCredentials(JSON.parse(token));
                    if (type == "token") {
                        resolve(JSON.parse(token));
                    } else if (type == "auth") {
                        resolve(oAuth2Client);
                    }
                }
            });

        });
    }

    getToken(oAuth2Client, type) {
        return new Promise((resolve, reject) => {
            const scopes = [
                'https://www.googleapis.com/auth/drive.readonly'
            ];

            const url = oAuth2Client.generateAuthUrl({
                access_type: 'offline', // gets refresh_token
                scope: scopes
            });

            console.log('Authorize this app by visiting this url:', url);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) return console.error('Error retrieving access token', err);
                    oAuth2Client.setCredentials(token);
                    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                        if (err) reject(err);
                        console.log('Token stored to', TOKEN_PATH);
                        if (type == "token") {
                            resolve(token);
                        } else if (type == "auth") {
                            resolve(oAuth2Client);
                        }
                    });
                });
            });
        })
    }


}
module.exports = AuthGoogle;