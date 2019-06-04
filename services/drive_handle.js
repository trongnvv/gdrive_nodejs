const AuthGoogle = require('./auth_google');
const { google } = require('googleapis');
const fs = require('fs');
const delay = require('../utils/deplay');
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
        this.drive.files.list({
            pageSize: 10,
            q: "mimeType = 'application/vnd.google-apps.folder'",
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                console.log('Files:');
                files.map((file) => {
                    console.log(file);
                    return;
                });
            } else {
                console.log('No files found.');
            }
        });
    }

    fileList(option) {
        this.drive.files.list(option, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                console.log('Files:');
                files.map((file) => {
                    console.log(file);
                    return;
                });
            } else {
                console.log('No files found.');
            }
        });
    }

    downloadFile(name, id, dir = __dirname + '/storages') {
        return new Promise((resolve, reject) => {
            let dest = fs.createWriteStream(dir + "/" + name);
            this.drive.files.get({ fileId: id, alt: "media" }, { responseType: "stream" }, (err, res) => {
                if (err) reject(err);
                res.data
                    .on("end", () => {
                        console.log("Done file: ", name, dir);
                        resolve();
                    })
                    .on("error", err => {
                        console.error(err);
                        reject(err);
                    })
                    .pipe(dest);
            });
        });
    }

    async downloadFolder(id = '0ByKeZjlHtSH2NDVXWmhvUDFLV0E', dir = __dirname + '/storages') {
        let self = this;
        let option = {
            pageSize: 10,
            q: "'" + id + "'" + " in parents"
        }
        this.drive.files.list(option, async (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];

                    if (file.mimeType != "application/vnd.google-apps.folder") {
                        try {
                            await self.downloadFile(file.name, file.id, dir);
                        } catch (error) {
                            console.log(error);
                        }
                    } else {
                        let _dir = dir + '/' + file.name;

                        if (!fs.existsSync(_dir)) {
                            fs.mkdirSync(_dir);
                        }
                        // await delay(1000);
                        self.downloadFolder(file.id, _dir);

                    }
                }
            } else {
                console.log('No files found.');
            }
        });
    }


}

module.exports = DriveHandle;