let express = require( 'express' );
let app = express();
let server = require( 'http' ).Server( app );
let io = require( 'socket.io' )( server );
let path = require( 'path' );
app.use(express.static( path.join( __dirname, '/public')));
server.listen( 3000 );