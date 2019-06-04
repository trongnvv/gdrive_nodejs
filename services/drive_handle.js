const AuthGoogle = require('./auth_google');
const { google } = require('googleapis');
const fs = require('fs');
const request = require('request');
const config = require('../config');
class DriveHandle {
    constructor() {
        this.authGoogle = new AuthGoogle();
        this.start();
    }

    async start() {
        let auth = await this.authGoogle.getAccessToken("auth");
        this.drive = google.drive({ version: 'v3', auth });
    }

    readFile() {
        let pageToken = null;
        this.drive.files.list({
            pageSize: 10,
            pageToken: pageToken,
            fields: "nextPageToken, files(id, name)"
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                console.log('Files:');
                files.map((file) => {
                    console.log(file);
                });
            } else {
                console.log('No files found.');
            }
        });
    }

    downloadFile() {
        let fileId = '10jUH6ZlN-3dDqMZdHpZHhzYKopHjO7Pd';
        // let dest = fs.createWriteStream(__dirname + '/storage/photo.jpg');
        // this.drive.files.get({ fileId: fileId, alt: "media" }, { responseType: "stream" },
        //     function (err, res) {
        //         res.data
        //             .on("end", () => {
        //                 console.log("Done");
        //             })
        //             .on("error", err => {
        //                 console.log("Error", err);
        //             })
        //             .pipe(dest);
        //     })



        const options = {
            url: config.google.url_v3 + "files/" + fileId + "?alt=media",
            headers: {
                'Authorization': 'Bearer' + this.authGoogle.getAccessToken("token").access_token
            }
        };

        request(options, (err, res, body) => {
            console.log(err);
            console.log(res.statusCode);
            console.log(body);
            if (!err && res.statusCode == 200) {
                console.log(body);
            }
        });
    }

}

module.exports = DriveHandle;