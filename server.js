const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path');
const cors = require('cors');


app.use(cors());
app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile)
//app.set('view engine', 'html')
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
 res.render('index')
})
 app.get('/:roomid', (req, res) => {
   res.render('room', {roomid:req.params.roomid})
 })
 const mongoose = require("mongoose"),
  { Schema } = require("mongoose");
const mongoClient = require('mongodb').MongoClient;
//const database = "mongodb://prakriti19439:BqN3o9*&@clusterprakriti-shard-00-00.joqkb.mongodb.net:27017,clusterprakriti-shard-00-01.joqkb.mongodb.net:27017,clusterprakriti-shard-00-02.joqkb.mongodb.net:27017/videoapp?ssl=true&replicaSet=atlas-mc201n-shard-0&authSource=admin&retryWrites=true&w=majority";
var database = "mongodb://prakriti19439:BqN3o9*&@clusterprakriti-shard-00-00.joqkb.mongodb.net:27017,clusterprakriti-shard-00-01.joqkb.mongodb.net:27017,clusterprakriti-shard-00-02.joqkb.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-mc201n-shard-0&authSource=admin&retryWrites=true&w=majority";

const dbname = "test";
const chatcollection = "devices";
  //mongoose.connect("mongodb://localhost:3000", {useNewUrlParser: true});

const messageSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    
  },
  roomidsch: {
    type: String,
    required: true
  }
}, { timestamps: true });
const moment = require('moment');
module.exports = mongoose.model('Message', messageSchema);
const formatMessage = (data) => {
    msg = {
        content:data.content,
        userName:data.userName,
        roomid:data.roomid,
        date: moment().format("YYYY-MM-DD"),
        time: moment().format("hh:mm a")
    }
    return msg;
}
module.exports=formatMessage;
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    
    
mongoClient.connect(database, (err,db) => {
  var chat = db.db(dbname).collection(chatcollection);
    chat.find({'roomid' : { '$in': [roomId] }}
  ,{projection: {_id:0}}).toArray((err,res) => {
                    if(err)
                        throw err;
                    else {
                        console.log(res);
                        socket.emit('output',res); //emits the entire chat history to client
                    }
                });
            
  });socket.join(roomId)
  socket.to(roomId).emit('user-connected', userId)

    socket.on('send',(data) => {
      var m = formatMessage(data);
      mongoClient.connect(database, (err,db) => {
      var chat = db.db(dbname).collection(chatcollection);  
      
                chat.insertOne(m, (err,res) => { //inserts message to into the database
                    if(err) throw err;
                    
  
      //io.emit("message", messageAttributes);
      //socket.to(roomId).emit('receive',{message:data.message,name:data.name})
      socket.to(roomId).emit('receive',{content:data.content,userName:data.userName});

})
})
    })
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT || 3000)




