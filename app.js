/**************************************************************
 *                                                            *
 * Load Dependencies                                          *
 *                                                            *
 **************************************************************/

// configuration
var config         = require('./config');

// middlewares
var expressLayouts = require('express-ejs-layouts'),
	favicon        = require('serve-favicon'),
	morgan         = require('morgan'),
	bodyParser     = require('body-parser'),
	cookieParser   = require('cookie-parser'),
	session        = require('express-session');

// framework
var express	       = require('express');

// server modules
var http           = require('http'),
	https          = require('https');

// other modules
var SessionStore   = require('express-mysql-session'), // Store session in mysql database
	fs             = require("fs"),                    // To read ssl key and cert
	lessMiddleware = require('less-middleware'),
	passport       = require('passport');

/**************************************************************
 *                                                            *
 * Apply Middlewares and Configurations                       *
 *                                                            *
 **************************************************************/

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('layout', 'layout/default');
app.use(expressLayouts);                             // view layout
app.use(lessMiddleware(__dirname + '/public', {
	force: true
}));
app.use(express.static(__dirname + '/public'));      // serving static files
app.use(morgan('dev'));                              // log every request to the console
app.use(favicon(__dirname + '/public/favicon.ico')); // favicon.ico
app.use(bodyParser.urlencoded({                      // body parsing (req.body)
	extended: true
}));
app.use(bodyParser.json());
// app.use(cookieParser(config.secret.cookieSecret));   // parse cookie header (req.cookies)
app.use(session({                                    // parse session (req.session)
	secret: config.secret.sessionSecret,
	resave: true,
	saveUninitialized: true,
	store: new SessionStore({
		host: config.db.host,
	    port: config.db.port,
	    user: config.db.user,
	    password: config.db.password,
	    database: config.db.database
	})
}));
app.use(passport.initialize());
app.use(passport.session());

/**************************************************************
 *                                                            *
 * Apply Custom Middlewares                                   *
 *                                                            *
 **************************************************************/

var router = express.Router();
app.use(require('./routes/middlewares/reply'));
app.use(require('./routes/middlewares/token'));
app.use(require('./routes/middlewares/specialPage'));
app.use(router);
app.use(require('./routes/middlewares/pageNotFound'));

// // Authentication
// app.use(mw.authenticationFilter);
// // Messages
// app.use(mw.messageFilter);
// // History pages
// app.use(mw.historyPage);

var env = process.env.NODE_ENV || 'development';
if ('development' === env) {
	var errorhandler = require('errorhandler');
	app.use(errorhandler());
}

/**************************************************************
 *                                                            *
 * Routing and Validation                                     *
 *                                                            *
 **************************************************************/

// require('./routes/main/general')(app);
require('./routes/validations/user')(router);
require('./routes/main/user')(router);
require('./routes/main/user-social')(router);

/**************************************************************
 *                                                            *
 * Build Server                                               *
 *                                                            *
 **************************************************************/
// http server
http
	.createServer(app)
	.listen(config.app.port.http, function(){
		console.log('HTTP  server listening on port ' + config.app.port.http);
	});

// https server
var privateKey = fs.readFileSync('secrets/ssl_key.pem', 'utf8');       //load openssl generated privateKey
var certificate = fs.readFileSync('secrets/ssl_key_cert.pem', 'utf8'); //load openssl generated certificate
//create credentials object to create ssl
var credentials = {
	key: privateKey,
	cert: certificate
};
https
	.createServer(credentials, app)
	.listen(config.app.port.https, function () {
		console.log('HTTPS server listening on port ' + config.app.port.https);
	});