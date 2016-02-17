var request = require('request');
var validator = require('validator');

module.exports = {
    ping : function (route, args) {
        var uri = args[0];
        var wait = false;

        if (uri === 'wait') {
            uri = args[1];
            wait = true;
        }

        // Scan for bad URIs
        if (!validator.isIP(uri) && !validator.isURL(uri)) {
            route.send('?canary_bad_url');
            return;
        }

        // Assume HTTP if there is no protocol. request lib requires this.
        if (uri.indexOf('http') !== 0) {
            uri = 'http://' + uri;
        }

        // Function to perform waiting for a URL to come up.
        function doWait(message, code) {
            route.send('?canary_request_waiting', uri, message, code);

            var killTimeout;
            var waitInterval = setInterval(function () {
                request(uri, function (err, res) {
                    if (res && res.statusCode < 400) {

                        // Send success message
                        route.send('?canary_wait_success', uri, res.statusMessage, res.statusCode);

                        // Clear interval & timeout
                        clearInterval(waitInterval);
                        if (killTimeout) {
                            clearTimeout(killTimeout);
                        }
                    }
                });
            }, 1000 * 5); // 5 second ping interval

            // Don't keep pinging forever.
            killTimeout = setTimeout(function () {
                route.send('?canary_wait_timeout', uri);
                clearInterval(waitInterval);
            }, 1000 * 60 * 15); // 15 minute timeout
        }

        request(uri, function (err, res) {
            if (err) {
                if (err.code === 'ENOTFOUND') {
                    // Display relevant message if address is not found and not waiting
                    if (!wait) {
                        route.send('?canary_request_error', uri, 'URI Not found');
                    } else {
                        // Otherwise, pass relevant message to wait function
                        doWait('URI Not Found', 'ENOTFOUND');
                    }
                } else {
                    // Drop unknown errors, even if we're waiting - it's probably internal error.
                    route.send('?canary_request_error', uri, 'Unknown Error');
                }
            } else {
                // If we're not waiting, or the original ping was successful, display message
                if (!wait || res.statusCode < 400) {
                    route.send('?canary_request_success', uri, res.statusMessage, res.statusCode);
                } else {
                    // Otherwise, wait.
                    doWait(res.statusMessage, res.statusCode);
                }
            }
        });
    }
};
