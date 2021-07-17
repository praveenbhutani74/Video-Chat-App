const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let Mymodal=document.querySelector('modal');
let MuteVideo=document.querySelector('.Stop-video');
let Theme=document.getElementById('Theme');
let ChatButton=document.getElementById('chat-btn');
let right=document.getElementById('right');
let leave=document.getElementById('leave');
let ChatInput=document.querySelector(".chat-input");
let MuteAudio=document.querySelector('.Stop-audio');
console.log(videoGrid);

// let AudioVideo=document.getElementById('Audio-video');
// let StopVideoDiv=document.querySelector('.Stop-Video-div')

// let count=0;
let myVideoStream;
const myPeer = new Peer()

const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
   
    connectToNewUser(userId, stream)
   
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {

  socket.emit('join-room', ROOM_ID, id)

})


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



console.log(myVideoStream);
  MuteVideo.addEventListener("click",function(){
  console.log(myVideoStream);
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if(enabled||MuteVideo.innerHTML==="Stop"){
      myVideoStream.getVideoTracks()[0].enabled = false;
      StartVideoBtn();
  }
  else {
     
      myVideoStream.getVideoTracks()[0].enabled = true;
      StopVideoBtn();
      }
  
})
MuteAudio.addEventListener("click",function(){
  console.log(myVideoStream);
  let enabled = myVideoStream.getAudioTracks()[0].enabled;
  if(enabled||MuteVideo.innerHTML==="Stop"){
      myVideoStream.getAudioTracks()[0].enabled = false;
     StartAudioBtn();
  }
  else {
     
      myVideoStream.getAudioTracks()[0].enabled = true;
     StopAudioBtn();
      }
  
})

   function StartAudioBtn(){
     document.querySelector("video").style.border="3px solid red";

   
    MuteAudio.innerHTML=`<span class="Stop-Audio">Unmute</span>
    <i class="fas fa-microphone-slash"></i>
    `;
   }
   function StopAudioBtn(){
    document.querySelector("video").style.border="3px solid black";

    
    MuteAudio.innerHTML=`<span class="Stop">Mute  </span>
    <i class="fas fa-microphone"></i>
    `;
   }

   function StartVideoBtn(){

    MuteVideo.innerHTML=`<span class="Stop">Start Video</span>
    <i class="fas fa-video-slash"></i> 

    `;
   }
   function StopVideoBtn(){

    MuteVideo.innerHTML=`<span class="Stop">Stop Video</span>
    <i class="fas fa-video"></i>
    `;
   }



  var content = document.getElementsByTagName('body')[0];
  var darkMode = document.getElementById('dark-change');
  darkMode.addEventListener('click', function(){
      darkMode.classList.toggle('active');
      content.classList.toggle('night');
})

ChatButton.addEventListener("click",function(){


  right.style.display=="none"?right.style.display="block":right.style.display="none";

})



ChatInput.addEventListener("keypress",function(e){
  if(e.key=="Enter"){
    console.log(e.key);

    let chatDiv = document.createElement("div");
    chatDiv.classList.add("chat");
    chatDiv.classList.add("right-div");
    chatDiv.textContent = ChatInput.value;
    right.append(chatDiv);
    ChatInput.value = "";
  }


})


// StopVideo.addEventListener("click",function(){


//   console.log(StopVideo.innerHTML);
    
     
//       return StopVideo.innerText === "Stop" ? "Start" : "Stop";
   


// })

// StopVideoDiv.addEventListener("click",function(){

  

