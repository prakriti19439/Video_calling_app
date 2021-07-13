const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const chatdiv = document.getElementById('chatdiv');
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const inviteButton = document.querySelector('addUser');
const muteButton = document.querySelector('#stopAudio');
const stopVideo = document.querySelector('#stopVideo');
const share_screen = document.querySelector('#shareScreen');
//const room_id_msg = '<%= roomid %>';
 const myPeer = new Peer({
  config: {'iceServers': [
    { url: 'stun:stun.l.google.com:19302' }
  ]}
});
const myVideo = document.createElement('video')
myVideo.muted = "muted";
let stream;
let displayMediaStream;

 const peers = {}
 navigator.mediaDevices.getUserMedia({
   video: true,
   audio: true
 }).then(stream => {
  stream=stream
   addVideoStream(myVideo, stream)
   stopVideo.onclick = function(){
  stop_the_video(stream);
}
muteButton.onclick = function(){
  stop_the_audio(stream);
}

/*share_screen.onclick = function(){
  window.alert("hi");
  console.log("hello screenshare feature");
  if (!displayMediaStream) {
      displayMediaStream =  navigator.mediaDevices.getDisplayMedia();
    }
      //displayMediaStream = navigator.mediaDevices.getDisplayMedia();
      window.alert("inside");
    peers.get(sender => sender.track.kind === 'video').replaceTrack(displayMediaStream.getTracks()[0]);
    window.alert("over");
    /*const screen_share_video = document.createElement('video')
    //addVideoStream(screen_share_video, displayMediaStream)
    screen_share_video.srcObject = displayMediaStream
     screen_share_video.addEventListener('loadedmetadata', () => {
     screen_share_video.play()
  })
   
   videoGrid.append(screen_share_video)


}
*/

   myPeer.on('call', call => {
    stream=stream
     call.answer(stream)
     const video = document.createElement('video')
     call.on('stream', userVideoStream => {
       addVideoStream(video, userVideoStream)
     })
   })
   socket.on('user-connected', userId => {
     console.log('User Connected ' + userId)
     connectToNewUser(userId, stream)
   })
 })

 socket.on('user-disconnected', userId => {
   if (peers[userId]) peers[userId].close()
 })


 myPeer.on('open', id => {
   socket.emit('join-room', ROOM_ID, id)
 })

 socket.on('receive',(data) => {           //receive implies output
  messageAppend({content:data.content,userName:data.userName},'left');     //receiver
})


form.addEventListener('submit',(e) => {
  e.preventDefault();
  const name = window.sessionStorage.getItem('name');
  const id_of_room = window.sessionStorage.getItem('id_room');
  const messageinput = messageInput.value;
  messageAppend({content:messageinput,userName:"You"},"right");       //shows to sender

  socket.emit('send',{content:messageinput,userName:name,roomid:id_of_room});
  messageInput.value='';
})

function messageAppend(message,position) {
  const messagediv = document.createElement('div');
  const spam = document.createElement('h5');
  spam.classList.add('name');
  spam.innerHTML=message.userName;
  messagediv.innerHTML=message.content;
  messagediv.classList.add('message');
  messagediv.classList.add(position);
  messagediv.append(spam);
  chatdiv.append(messagediv);
}

socket.on('output',(data) => { //recieves the entire chat history upon logging in between two users and displays them
    for(var i=0; i<data.length;i++) {
        messageAppend(data[i],'left');
    }
    chatdiv.scrollTop=chatdiv.scrollHeight;
});


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

var modal = document.getElementById("myModal");


var button = document.getElementById("msgid");
button.onclick = function(){
  modal.style.display = "flex";
}

 
var span = document.getElementsByClassName("close")[0];


span.onclick = function() {
  modal.style.display = "none";
}


var recorder;

const recordButton = document.querySelector('button#record');
recordButton.addEventListener('click', () => {
  //alert("hi");
  if (recordButton.textContent === 'Start Recording') {
    recorder = new RecordRTC_Extension();
recorder.startRecording({
    enableScreen: true,
    enableMicrophone: true,
    enableSpeakers: true
});
recordButton.textContent = 'Stop and download';

  }
   else {
    
    recorder.stopRecording(function(blob) {
        console.log(blob.size, blob);
        recordButton.textContent = 'Start Recording';
        //var url = URL.createObjectURL(blob);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  
    });

    
  }
});

socket.on("load all messages", (data) => {
  data.forEach(message => {
    messageAppend(message);
  });
});


