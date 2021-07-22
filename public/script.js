const socket = io('/');
const videoGrid = document.getElementById('video-grid')
let Mymodal = document.querySelector('modal');
let MuteVideo = document.querySelector('.Stop-video');
let Theme = document.getElementById('Theme');
let ChatButton = document.getElementById('chat-btn');
let right = document.getElementById('right');
let leave = document.querySelector('.Leave-Btn');
let ChatInput = document.querySelector(".chat-input");
let MuteAudio = document.querySelector('.Stop-audio');
let videoElement = document.querySelector("video");
console.log(videoGrid);
let recordButton = document.querySelector(".recordButton");
let ShareScreen = document.querySelector('.Share-Screen');
let username = prompt("Enter Your Name ");

let myVideoStream;
var currentPeer;
let mediaRecorder;
let videoTrack;
let recordingState = false;
const myPeer = new Peer()

socket.emit("userConnected",username);



const myVideo = document.createElement('video')
// myVideo.controls = true;
myVideo.muted = true;


const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  // videoElement.srcObject = stream;
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.onstart = function () {
    console.log("Inside me start");
  }
  mediaRecorder.ondataavailable = function (e) {
    console.log("Inside on data available");

    console.log(e);

    let videoObj = new Blob([e.data], { type: "video/mp4" })
    console.log(videoObj);
    let videoUrl = URL.createObjectURL(videoObj);

    let aTag = document.createElement("a");

    aTag.download = `Vidoe${Date.now()}.mp4`;
    aTag.href = videoUrl;
    aTag.click();



  };

  mediaRecorder.onstop = function () {

    console.log("Inside on stop");

  }
  recordButton.addEventListener("click", RecordingOnClick);
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
      currentPeer = call;
    })

  })


  socket.on('user-connected', userId => {

    connectToNewUser(userId, stream)

  })
})

socket.on("chatLeft", function (chatValue) {

  let chatDiv = document.createElement("div");
  chatDiv.classList.add("chat");
  chatDiv.classList.add("left-div");
  chatDiv.textContent = chatValue.username+":-"+chatValue.chat;
  right.append(chatDiv);


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
  video.controls = true;
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
    currentPeer = call;

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
MuteVideo.addEventListener("click", function () {

  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled || MuteVideo.innerHTML === "Stop") {
    myVideoStream.getVideoTracks()[0].enabled = false;
    StartVideoBtn();
  }
  else {

    myVideoStream.getVideoTracks()[0].enabled = true;
    StopVideoBtn();
  }

})
MuteAudio.addEventListener("click", function () {
  console.log(myVideoStream);
  let enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled || MuteVideo.innerHTML === "Stop") {
    myVideoStream.getAudioTracks()[0].enabled = false;
    StartAudioBtn();
  }
  else {

    myVideoStream.getAudioTracks()[0].enabled = true;
    StopAudioBtn();
  }

})

function StartAudioBtn() {
  document.querySelector("video").style.border = "3px solid red";


  MuteAudio.innerHTML = `<span class="Stop-Audio">Unmute</span>
    <i class="fas fa-microphone-slash"></i>
    `;
}
function StopAudioBtn() {
  document.querySelector("video").style.border = "3px solid black";


  MuteAudio.innerHTML = `<span class="Stop">Mute  </span>
    <i class="fas fa-microphone"></i>
    `;
}

function StartVideoBtn() {

  MuteVideo.innerHTML = `<span class="Stop">Start Video</span>
    <i class="fas fa-video-slash"></i> 

    `;
}
function StopVideoBtn() {

  MuteVideo.innerHTML = `<span class="Stop">Stop Video</span>
    <i class="fas fa-video"></i>
    `;
}



var content = document.getElementsByTagName('body')[0];
var darkMode = document.getElementById('dark-change');
darkMode.addEventListener('click', function () {
  darkMode.classList.toggle('active');
  content.classList.toggle('night');
})

ChatButton.addEventListener("click", function () {


  right.style.display == "none" ? right.style.display = "block" : right.style.display = "none";

})



ChatInput.addEventListener("keypress", function (e) {
  if (e.key == "Enter") {
    console.log(e.key);

    let chatDiv = document.createElement("div");
    chatDiv.classList.add("chat");
    chatDiv.classList.add("right-div");
    chatDiv.textContent = username+": "+ChatInput.value;
    right.append(chatDiv);
    socket.emit("chat", { username,chat: ChatInput.value });
    ChatInput.value = "";
  }


})

leave.addEventListener("click", function (e) {

  console.log(e);
});

// leave.addEventListener("keypress",function(e){

//   console.log(e);
// });

ShareScreen.addEventListener("click", function (e) {


  navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: "always"
    }, audio: {
      echoCancellation: true,
      noiseSuppression: true
    }
  }).then((stream) => {
    videoTrack = stream.getVideoTracks()[0];
    console.log(videoTrack);
    let sender = currentPeer.peerConnection.getSenders().find(function (s) {
      console.log(s);
      return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack);




  }).catch((err) => {


    console.log("err" + err);
  })

});


function RecordingOnClick() {

  if (recordingState) {
    mediaRecorder.stop();

    recordingState = false;

    document.querySelector(".recording").innerHTML = "";
    recordButton.innerHTML = ` <div class="recordButton">
      <span class="Stop">Record</span>
      <i class="fas fa-record-vinyl"></i>
    </div>`
  }
  else {

    mediaRecorder.start();

    recordingState = true;
    document.querySelector(".recording").innerHTML = `
      <div class="recordButtononClick">
     
      <i class="fas fa-stop-circle"></i>
      <span class="Stop">Recording</span>
    </div>
      
      `;

    recordButton.innerHTML = `
      <div class="recordButton">
      <span class="Stop">Stop Recording</span>
      <i class="fas fa-stop-circle"></i>
    </div>
      
      `

  }
}



let id=document.getElementById('myInput').value = window.location.href;
console.log(id);


document.querySelector(".copy").addEventListener("click",function(){

  var copyText = document.getElementById("myInput");
  copyText.select();

  document.execCommand("copy");
  alert("Copied the Meeting Link: " + copyText.value);
})

socket.on("online-list", function(userList){

  let ParticipantDiv=document.createElement("div");
  ParticipantDiv.classList.add("participant-div");
  ParticipantDiv.innerHTML=`
  <span class="Number">${userList.length}</span>
  <span class="Stop">Participants</span>
  <i class="fas fa-user-friends"></i>
  `
  document.querySelector("#middle ").append(ParticipantDiv);


})
