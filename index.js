var commands = require('./src/commands');

module.exports = {
    displayname : 'Canary',
    description : 'HTTP Status Checking',

    // init : someInitFunction,

    // web_init : someWebInitFunction,

     commands : [{
             name : 'Ping',
             description : 'Ping a given URL once, responding with the status.',
             usage : 'ping [url]',
             trigger : /ping/i,
             func : commands.ping
         }
     ]

    // listeners : [{
    //     name : 'Name',
    //     description : 'Description',
    //     trigger : /.*/,
    //     func : someListenerFunction
    // }]
};
