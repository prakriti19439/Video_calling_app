const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const chatdiv = document.getElementById('chatdiv');
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const inviteButton = document.querySelector('addUser');
const muteButton = document.querySelector('#stopAudio');
const stopVideo = document.querySelector('#stopVideo');
const share_screen = document.querySelector('#shareScreen');
 const myPeer = new Peer({
  config: {'iceServers': [
    { url: 'stun:stun.l.google.com:19302' }
  ]}
});
const myVideo = document.createElement('video')
myVideo.muted = "muted";
let stream;

 const peers = {}
 navigator.mediaDevices.getUserMedia({
   video: true,
   audio: true
 }).then(stream => {
  stream=stream
   addVideoStream(myVideo, stream)
var interval = 100;
var timer = window.setInterval(function(){
    
muteButton.addEventListener('click', () => {
    stop_the_audio(stream)
});
share_screen.addEventListener('click', () => {
    navigator.mediaDevices.getDisplayMedia({video: false})
      .then(handleSuccess(stream));
});
}, interval);

   myPeer.on('call', call => {
    stream=stream
     call.answer(stream)
     const video = document.createElement('video')
     call.on('stream', userVideoStream => {
       addVideoStream(video, userVideoStream)
     })
   })
   socket.on('user-connected', userId => {
     console.log("User Connected " + userId)
     connectToNewUser(userId, stream)
   })
 })

 socket.on('user-disconnected', userId => {
   if (peers[userId]) peers[userId].close()
 })


 myPeer.on('open', id => {
   socket.emit('join-room', ROOM_ID, id)
 })

 socket.on('receive',(data) => {
  messageAppend({message:data.message,name:data.name},"left");
})


form.addEventListener('submit',(e) => {
  e.preventDefault();
  const name = window.sessionStorage.getItem('name');
  const messageinput = messageInput.value;
  messageAppend({message:messageinput,name:"You"},"right");
  socket.emit('send',{message:messageinput,name:name});
  messageInput.value='';
})

function messageAppend(message,position) {
  const messagediv = document.createElement('div');
  const spam = document.createElement('h5');
  spam.classList.add('name');
  spam.innerHTML=message.name;
  messagediv.innerHTML=message.message;
  messagediv.classList.add('message');
  messagediv.classList.add(position);
  messagediv.append(spam);
  chatdiv.append(messagediv);
}


 function connectToNewUser(userId, stream) {
   const call = myPeer.call(userId, stream)
   const video = document.createElement('video')
   call.on('stream', userVideoStream => {
     addVideoStream(video, userVideoStream)
   })
   call.on('close', () => {
     video.remove()
   })

   peers[userId] = call
 }

 function addVideoStream(video, stream) {
   video.srcObject = stream
   video.addEventListener('loadedmetadata', () => {
     video.play()
   })
   videoGrid.append(video)
 }

function stop_the_video(stream) {
    const enabled = stream.getVideoTracks()[0].enabled;
  if (enabled) {
    stream.getVideoTracks()[0].enabled = false;
    html = `<i class='fas fa-video-slash'></i>`;
    stopVideo.classList.toggle('background__red');
    stopVideo.innerHTML = html;
  } else {
    stream.getVideoTracks()[0].enabled = true;
    html = `<i class='fas fa-video'></i>`;
    stopVideo.classList.toggle('background__red');
    stopVideo.innerHTML = html;
  }
}

function stop_the_audio(stream) {
    const enabled = stream.getAudioTracks()[0].enabled;
  if (enabled) {
    stream.getAudioTracks()[0].enabled = false;
    html = `<i class='fas fa-microphone-slash'></i>`;
    muteButton.classList.toggle('background__red');
    muteButton.innerHTML = html;
  } else {
    stream.getAudioTracks()[0].enabled = true;
    html = `<i class='fas fa-microphone'></i>`;
    muteButton.classList.toggle('background__red');
    muteButton.innerHTML = html;
  }
}
function handleSuccess(stream) {
  const video = document.querySelector('video');
  addVideoStream(video, stream)
}
var modal = document.getElementById("myModal");


var button = document.getElementById("msgid");
button.onclick = function(){
  modal.style.display = "flex";
}

stopVideo.onclick = function(){
  stop_the_video(stream);
}
//stopVideo.addEventListener('click', () => {
//    stop_the_video(stream)
//});
 
var span = document.getElementsByClassName("close")[0];


span.onclick = function() {
  modal.style.display = "none";
}

