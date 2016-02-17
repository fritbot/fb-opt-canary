var request = require('request');
var validator = require('validator');

module.exports = {
    ping: function (route, args) {
        var uri = args[0];
        if (!validator.isIP(uri) && !validator.isURL(uri)) {
            route.send('?canary_bad_url');
            return;
        }

        if (uri.indexOf('http') !== 0) {
            uri = 'http://' + uri;
        }

        request(uri, function (err, res, body) {
            if (err) {
                if (err.code === 'ENOTFOUND') {
                    route.send('?canary_request_error', uri, 'URI Not found');
                } else {
                    route.send('?canary_request_error', uri, 'Unknown Error');
                }
            } else {
                route.send('?canary_request_success', uri, res.statusMessage, res.statusCode);
            }
        });
    }
};
