class Notifications {
    // Send a success message
    static success(message, duration = 3000) {
        this.sendNotification(message, 'success', duration);
    }
    // Send an error message
    static error(message, duration = 3000) {
        this.sendNotification(message, 'error', duration);
    }
    // Send an error message
    static info(message, duration = 3000) {
        this.sendNotification(message, 'info', duration);
    }

    static sendNotification(message, type, duration = 3000) {
        new Noty({
            text: message,
            type: type,
            progressBar: true,
            timeout: duration,
            theme: 'bootstrap-v4',
            layout: "topLeft"
        }).show();
    }
}