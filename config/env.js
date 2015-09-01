var util = require(__dirname + '/../libs/util.js'),
    exphbs  = require('express-handlebars');

module.exports = function (express, app) {

    // Common configuration
    app.configure(function () {

        app.engine('html', exphbs({defaultLayout: 'main', extname: '.html'}));
        app.set('view engine', 'html');

        app.use(app.router);

        // Make sure build folders exist
        util.mkdir(__dirname + '/../build');
        util.mkdir(__dirname + '/../build/css');

        // Configure LESS compiler
+       app.use('/css', require('less-middleware')(__dirname + '/../src/less', {
            dest: __dirname + '/../build/css'
        }, {}, {
          compress: false
        }));

        // Create static file servers for the build and public folders
        app.use(express.static(__dirname + '/../build'));
        app.use(express.static(__dirname + '/../public'));
    });

    // Development specific configuration
    app.configure('development', function () {
        app.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    });

    // Production specific configuration
    app.configure('production', function () {
        app.use(express.errorHandler());
    });

};
