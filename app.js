let express = require( 'express' );
let app = express();
let server = require( 'http' ).Server( app );
let io = require( 'socket.io' )( server );
let path = require( 'path' );

const { v4: uuidv4 } = require('uuid');
app.set('view engine', 'ejs')
app.use(express.static( 'public'));

app.get('/', (req, res) => {
res.redirect(`/${uuidv4()}`);
});
app.get('/:room', (req, res) => {
res.render('room', { roomId: req.param.room });
});

io.on('connection', (socket) => {
socket.on('join-room', (roomId, userId) => {
console.log("HI");
socket.join(roomId);
socket.broadcast.emit('user-connected', userId)
        socket.on('disconnect', () => {
            socket.broadcast.emit('user-disconnected', userId)
        })
});
});
server.listen( 3000 );
