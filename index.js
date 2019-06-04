const DriveHandle = require('./services/drive_handle');
class boot {
    constructor() {
        this.driveHandle = new DriveHandle();
        setTimeout(() => {
            this.start();
        }, 1000);
    }

    start() {
        this.driveHandle.downloadFolder();
        // this.driveHandle.downloadFile();
    }
}

new boot();