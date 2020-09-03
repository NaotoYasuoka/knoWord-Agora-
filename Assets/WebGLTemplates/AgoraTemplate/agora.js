/* Maximum room size is 17 people.
   In English Shiritori, the maximum number of people in a room is 10. (value N) */
const N = 10;
if(N > 17){
  console.error("The number of users of Agora.io is exceeded. Automatic change from "+N+" to 10.")
  N = 10
}
/* Number of sub screens. */
const subScreens = N-1;
/* subScreensMass : The number of large chunks on the subscreen. */
const subScreensMass = subScreens - 4 + 1;
/* titleHeightSize : Title display height setting for "しりとり待ち". */
const titleHeightSize = 30;
/* MyID : storing your ID. */
let MyID;
/* widthSize, heightSize : Holds the width and height of the Unity screen. */
let widthSize;
let heightSize;
/* ShiritoriOrder : Get the order of shiritori as an array and store it. */
let ShiritoriOrder=[];
let ShiritoriUsers={};
let muteAudioUsers = [];


console.log("agora sdk version: " + AgoraRTC.VERSION + " compatible: " + AgoraRTC.checkSystemRequirements());
var resolutions = [
  {
    name: "default",
    value: "default",
  },
  {
    name: "480p",
    value: "480p",
  },
  {
    name: "720p",
    value: "720p",
  },
  {
    name: "1080p",
    value: "1080p"
  }
]

function Toastify (options) {
  M.toast({html: options.text, classes: options.classes})
}

var Toast = {
  info: (msg) => {
    Toastify({
      text: msg,
      classes: "info-toast"
    })
  },
  notice: (msg) => {
    Toastify({
      text: msg,
      classes: "notice-toast"
    })
  },
  error: (msg) => {
    Toastify({
      text: msg,
      classes: "error-toast"
    })
  }
}
function validator(formData, fields) {
  var keys = Object.keys(formData)
  for (let key of keys) {
    if (fields.indexOf(key) != -1) {
      if (!formData[key]) {
        Toast.error("Please Enter " + key)
        return false
      }
    }
  }
  return true
}


function serializeformData(appid, channel, uid, cameraResolution) {
    // var formData = $("#form").serializeArray()
  var obj = {}
  obj["appID"] = appid
  obj["channel"] = channel
  obj["mode"] = "live"
  obj["codec"] = "h264"
  obj["uid"] = uid
  obj["token"] = ""
  obj["cameraId"]=""
  obj["cameraResolution"]= cameraResolution
  obj["microphoneId"]=""
  return obj
}



function addView (id, show) {
  if (!$("#" + id)[0]) {
    $("<div/>", {
      id: "remote_video_panel_" + id,
      class: "video-view_" + id,
    }).appendTo("#video")

    $("<div/>", {
      id: "remote_video_" + id,
      class: "video-placeholder_" + id,
    }).appendTo("#remote_video_panel_" + id)

    $("<div/>", {
      id: "remote_video_info_" + id,
      class: "video-profile " + (show ? "" :  "hide"),
    }).appendTo("#remote_video_panel_" + id)

    $("<div/>", {
      id: "video_autoplay_"+ id,
      class: "autoplay-fallback hide",
    }).appendTo("#remote_video_panel_" + id)
  }
}
function removeView (id) {
  if ($("#remote_video_panel_" + id)[0]) {
    $("#remote_video_panel_"+id).remove()
  }
}

function getDevices (next) {
  AgoraRTC.getDevices(function (items) {
    items.filter(function (item) {
      return ["audioinput", "videoinput"].indexOf(item.kind) !== -1
    })
    .map(function (item) {
      return {
      name: item.label,
      value: item.deviceId,
      kind: item.kind,
      }
    })
    var videos = []
    var audios = []
    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if ("videoinput" == item.kind) {
        var name = item.label
        var value = item.deviceId
        if (!name) {
          name = "camera-" + videos.length
        }
        videos.push({
          name: name,
          value: value,
          kind: item.kind
        })
      }
      if ("audioinput" == item.kind) {
        var name = item.label
        var value = item.deviceId
        if (!name) {
          name = "microphone-" + audios.length
        }
        audios.push({
          name: name,
          value: value,
          kind: item.kind
        })
      }
    }
    next({videos: videos, audios: audios})
  })
}

var rtc = {
  client: null,
  joined: false,
  published: false,
  localStream: null,
  remoteStreams: [],
  params: {}
}


function handleEvents (rtc) {
  // Occurs when an error message is reported and requires error handling.
  rtc.client.on("error", (err) => {
    console.log(err)
  })
  // Occurs when the peer user leaves the channel; for example, the peer user calls Client.leave.
  rtc.client.on("peer-leave", function (evt) {
    var id = evt.uid;
    console.log("id", evt)
    let streams = rtc.remoteStreams.filter(e => id !== e.getId())
    let peerStream = rtc.remoteStreams.find(e => id === e.getId())
    if(peerStream && peerStream.isPlaying()) {
      peerStream.stop()
    }
    rtc.remoteStreams = streams
    if (id !== rtc.params.uid) {
      removeView(id)
      //operationNumber("remove", id)
      removeDesign(id);
    }
    Toast.notice("peer leave")
    console.log("peer-leave", id)
  })
  // Occurs when the local stream is published.
  rtc.client.on("stream-published", function (evt) {
    Toast.notice("stream published success")
    console.log("stream-published")
  })
  // Occurs when the remote stream is added.
  rtc.client.on("stream-added", function (evt) {  
    var remoteStream = evt.stream
    var id = remoteStream.getId()
    Toast.info("stream-added uid: " + id)
    if (id !== rtc.params.uid) {
      rtc.client.subscribe(remoteStream, function (err) {
        console.log("stream subscribe failed", err)
      })
    }
    console.log("stream-added remote-uid: ", id)
  })
  // Occurs when a user subscribes to a remote stream.
  rtc.client.on("stream-subscribed", function (evt) {
    var remoteStream = evt.stream
    var id = remoteStream.getId()
    rtc.remoteStreams.push(remoteStream)
    console.log("otherID               :"+id);
    addView(id)
    locateScreen(ShiritoriOrder, id)
    remoteStream.play("remote_video_" + id)
    Toast.info("stream-subscribed remote-uid: " + id)
    console.log("stream-subscribed remote-uid: ", id)
  })
  // Occurs when the remote stream is removed; for example, a peer user calls Client.unpublish.
  rtc.client.on("stream-removed", function (evt) {
    var remoteStream = evt.stream
    var id = remoteStream.getId()
    Toast.info("stream-removed uid: " + id)

    if(remoteStream.isPlaying()) {
      remoteStream.stop()
    }
    rtc.remoteStreams = rtc.remoteStreams.filter(function (stream) {
      return stream.getId() !== id
    })
    removeView(id)
    console.log("stream-removed remote-uid: ", id)
  })
  rtc.client.on("onTokenPrivilegeWillExpire", function(){
    // After requesting a new token
    // rtc.client.renewToken(token);
    Toast.info("onTokenPrivilegeWillExpire")
    console.log("onTokenPrivilegeWillExpire")
  })
  rtc.client.on("onTokenPrivilegeDidExpire", function(){
    // After requesting a new token
    // client.renewToken(token);
    Toast.info("onTokenPrivilegeDidExpire")
    console.log("onTokenPrivilegeDidExpire")
  })
  /* show mute icon whenever a remote has muted their mic */
  rtc.client.on('mute-audio', function (evt) {
    var num = ShiritoriOrder.indexOf(evt.uid);
    stateMute("make", "audio", String(evt.uid));
    console.log('Mute Audio for: ' + evt.uid);
  });
  rtc.client.on('unmute-audio', function (evt) {
    stateMute("remove", "audio", String(evt.uid));
    console.log('Unmute Audio for: ' + evt.uid);
  });
}

function join(rtc, option) {
  //return new Promise(__join(rtc, option, result =>  resolve(result), error => reject(error)));
  return new Promise(function (resolve, reject){
    __join(function (r) { resolve(r); }, function (e) { reject(e); }, rtc, option);
  })
}
function __join (_resolve, _reject, rtc, option) {
//function join (rtc, option) {
  if (rtc.joined) {
    Toast.error("Your already joined")
    _reject("Your already joined")
    return;
  }
  rtc.client = AgoraRTC.createClient({mode: option.mode, codec: option.codec})
  rtc.params = option
  handleEvents(rtc)
  
  // init client
  rtc.client.init(option.appID, function () {
    console.log("init success")
    rtc.client.join(option.token ? option.token : null, option.channel, option.uid ? +option.uid : null, function (uid) {
      Toast.notice("join channel: " + option.channel + " success, uid: " + uid)
      console.log("join channel: " + option.channel + " success, uid: " + uid)
      rtc.joined = true

      rtc.params.uid = uid

      rtc.localStream = AgoraRTC.createStream({
        streamID: rtc.params.uid,
        audio: true,
        video: true,
        screen: false,
        microphoneId: option.microphoneId,
        cameraId: option.cameraId
      })

      rtc.localStream.init(function () {
        console.log("init local stream success")
        MyID = rtc.params.uid
        console.log("MyID:"+MyID)
        rtc.localStream.play("local_stream")
        publish(rtc)
       _resolve("You have entered the room.")
      }, function (err)  {
        Toast.error("stream init failed, please open console see more detail")
        console.error("init local stream failed ", err)
      })
    }, function(err) {
      Toast.error("client join failed, please open console see more detail")
      console.error("client join failed", err)
    })
  }, (err) => {
    Toast.error("client init failed, please open console see more detail")
    console.error(err)
  })
}


function publish (rtc) {
  if (!rtc.client) {
    Toast.error("Please Join Room First")
    return
  }
  if (rtc.published) {
    Toast.error("Your already published")
    return
  }
  var oldState = rtc.published

  // publish localStream
  rtc.client.publish(rtc.localStream, function (err) {
    rtc.published = oldState
    console.log("publish failed")
    Toast.error("publish failed")
    console.error(err)
  })
  Toast.info("publish")
  rtc.published = true
  console.log("HAHAHA2")
}


function unpublish (rtc) {
  if (!rtc.client) {
    Toast.error("Please Join Room First")
    return
  }
  if (!rtc.published) {
    Toast.error("Your didn't publish")
    return
  }
  var oldState = rtc.published
  rtc.client.unpublish(rtc.localStream, function (err) {
    rtc.published = oldState
    console.log("unpublish failed")
    Toast.error("unpublish failed")
    console.error(err)
  })
  Toast.info("unpublish")
  rtc.published = false
}


function leave (rtc) {
  if (!rtc.client) {
    Toast.error("Please Join First!")
    return
  }
  if (!rtc.joined) {
    Toast.error("You are not in channel")
    return
  }
  rtc.client.leave(function () {
    // stop stream
    if(rtc.localStream.isPlaying()) {
      rtc.localStream.stop()
    }
    // close stream
    rtc.localStream.close()
    for (let i = 0; i < rtc.remoteStreams.length; i++) {
      var stream = rtc.remoteStreams.shift()
      var id = stream.getId()
      if(stream.isPlaying()) {
        stream.stop()
      }
      removeView(id)
    }
    rtc.localStream = null
    rtc.remoteStreams = []
    rtc.client = null
    console.log("client leaves channel success")
    rtc.published = false
    rtc.joined = false
    Toast.notice("leave success")
  }, function (err) {
    console.log("channel leave failed")
    Toast.error("leave success")
    console.error(err)
  })
}

// This function automatically executes when a document is ready.
$(function () {
  // This will fetch all the devices and will populate the UI for every device. (Audio and Video)
  getDevices(function (devices) {
    devices.audios.forEach(function (audio) {
      $("<option/>", {
        value: audio.value,
        text: audio.name,
      }).appendTo("#microphoneId")
    })
    devices.videos.forEach(function (video) {
      $("<option/>", {
        value: video.value,
        text: video.name,
      }).appendTo("#cameraId")
    })
    // To populate UI with different camera resolutions
    resolutions.forEach(function (resolution) {
      $("<option/>", {
        value: resolution.value,
        text: resolution.name
      }).appendTo("#cameraResolution")
    })
    M.AutoInit()
  })
})


function operationTelop(state){
  switch (state){
    case "make":
      /* Change the size of the sub screen according to the screen size. */
      var subScreenHeight = (heightSize-titleHeightSize) / subScreensMass;
      var subScreenWidth =  3 * subScreenHeight / 2;
      
      var newDiv = document.createElement("div"); 
      newDiv.id = "title";
      newDiv.textContent = "しりとり待ち";
      document.body.appendChild(newDiv);
      $("#title").css({
        "position": "absolute",
        "z-index": "1",
        "font-weight": "bold",
        "background" : "white",
        "text-align" : "center",
        "top": "0px",
        "left":String(widthSize-subScreenWidth)+"px",
        "width": String(subScreenWidth)+"px",
        "height": "30px"
      });
      break;
    case "remove":
      $("#title").remove();
      $("#title").css({
        "position": "",
        "font-weight": "",
        "background" : "",
        "text-align" : "",
        "top": "",
        "left": "",
        "width": "",
        "height": ""
      });
      break;
  }
}

function numberCSS(id, num){
  colorLines = {"answerUser":"#f0a8a8", "nextUser":"#fffacc", "generalUser":"#affaaf"} 
  if(num == 0){
    var number = "回答中"
    color = "#f0a8a8";
  }else if(num == 1){
    var number = String(num);
    color = "#fffacc";
  }else{
    var number = String(num);
    color = "#affaaf";
  }

  var text = String(number)+" | "+ShiritoriUsers[String(id)];
  resize = screenInfo(num);
  $("#text_"+String(id)).css({
    "position": "absolute",
    "z-index": "2",
    "font-weight": "bold",
    "text-align" : "left",
    "background" : "white",
    "top": String(resize.top*2+resize.height-25)+"px",
    "left":String(resize.left*2+10)+"px",
    "width": String(resize.width-20)+"px",
    "height": "25px",
    "border-top": "dashed 2px  "+String(color),
    "border-bottom": "solid 3px "+String(color)
  });
  
  if(num >= subScreensMass && num <= N){
    text = String(num);
    $("#text_"+String(id)).css({
      "width": "25px",
      "text-align" : "center"
    });
  }else{
  }
  return String(text);
}

function operationNumber(state, id, num=""){
  switch (state){
    case "make":
      var newDiv = document.createElement("div"); 
      newDiv.id = "text_"+String(id);
      //newDiv.textContent = String(num);
      document.body.appendChild(newDiv);
      document.getElementById("text_"+String(id)).textContent = numberCSS(id, num);
      // $("#text_"+String(id)).css({
      //   "position": "absolute",
      //   "z-index": "2",
      //   "font-weight": "bold",
      //   "text-align" : "left",
      //   "top": String(resize.top*2+resize.height-25)+"px",
      //   "left":String(resize.left*2+10)+"px",
      //   "width": String(resize.width-20)+"px",
      //   "height": "25px"
      // });
      // if(num == 0){
      //   $("#text_"+String(id)).css({
      //     "width": "",
      //     "border-left": "",
      //     "border-right": "",
      //     "border-top": "",
      //     "border-bottom": ""
      //   });
      // }else if(num == 1){
      //   $("#text_"+String(id)).css({
      //     "background" : "white",
      //     "border-top": "dashed 2px  #fffacc",
      //     "border-bottom": "solid 3px #fffacc"
      //   });
      // }else if(num < subScreensMass) {
      //   $("#text_"+String(id)).css({
      //     "background" : "white",
      //     "border-top": "dashed 2px  #affaaf",
      //     "border-bottom": "solid 3px #affaaf"
      //   });
      // }else if(num >= subScreensMass) {
      //   $("#text_"+String(id)).css({
      //     "width": "25px",
      //     "text-align" : "center",
      //     "background" : "white",
      //     "border-bottom": "solid 3px #affaaf"
      //   });
      // }
      break;
    case "change":
      var textID = document.getElementById("text_"+String(id));
      textID.textContent = numberCSS(id, num)
      // $("#text_"+String(id)).css({
      //   "top": String(top+titleHeightSize)+"px",
      //   "left":String(left)+"px"
      // });
      break;
    // case "remove":
    //   if(MyID == id){
    //     var placeholderID = ".video-placeholder"
    //   }else{
    //     var placeholderID = ".video-placeholder_"+String(id)
    //   }
    //   // $(placeholderID).css('border-top', '');
    //   // $(placeholderID).css('border-left', '');
    //   // $(placeholderID).css('border-right', '');
    //   $("#text_"+String(id)).remove();
    //   break;
    default:
      break;
  }
}


function removeDesign(id){
  if(MyID == id){
    var placeholderID = ".video-placeholder"
  }else{
    var placeholderID = ".video-placeholder_"+String(id)
  }
  $(placeholderID).css('border-top', '');
  $(placeholderID).css('border-left', '');
  $(placeholderID).css('border-right', '');
  $(placeholderID).css('border-bottom', '');
  //$(placeholderID).remove();
  $("#text_"+String(id)).remove();
}


function stateMute(state, device, id){
  if(device == "audio" || device == "video"){
    devices={"audio":"./image/muteAudio.png"}
    switch (state){
      case "make":
        var num = ShiritoriOrder.indexOf(String(id))
        muteAudioUsers.push(String(id));
        /* Creating a mute display. */
        var div = document.createElement("div");
        div.id = "div_mute-"+device+"_"+String(id);
        document.body.appendChild(div);
        var div = document.getElementById("div_mute-"+device+"_"+String(id))
        var img = document.createElement("img"); 
        img.id = "mute-"+device+"_"+String(id);
        img.src = devices[device];
        img.style.height = "25px";
        img.style.width = "25px";
        div.appendChild(img);
        resize = screenInfo(num);
        $("#div_mute-"+device+"_"+String(id)).css({
          "position": "absolute",
          "top": String(resize.top*2+resize.height-25-35)+"px",
          "left":String(resize.left*2+18)+"px",
          "z-index": "5"
        });
        break;
      case "move":
        if(muteAudioUsers.indexOf(String(id)) > -1){
          var num = ShiritoriOrder.indexOf(String(id))
          resize = screenInfo(num);
          $("#div_mute-"+device+"_"+String(id)).css({
            "top": String(resize.top*2+resize.height-25-25)+"px",
            "left":String(resize.left*2+10)+"px"
          });
        }
        break;
      case "remove":
        var num = muteAudioUsers.indexOf(String(id));
        if(num > -1){
          console.log("Remove user id : "+ id)
          console.log(num)
          $("#mute-"+device+"_"+String(id)).remove();
          $("#div_mute-"+device+"_"+String(id)).remove();
          muteAudioUsers.splice( num, 1 );
        }
        break;
      default:
        break;
    }
  }else{
    console.error("The device is not registered. Select 'Audio' or 'video'.")
  }
}


function screenInfo(num){
  if(num > 10){
    console.error("The maximum number of people is exceeded. To change it, change the value of N.")
  }
  /* Change the size of the sub screen according to the screen size. */
  var subScreenHeight = (heightSize-titleHeightSize) / subScreensMass;
  var subScreenWidth =  3 * subScreenHeight / 2;
  /* Change the size of the main screen according to the screen size. */
  var mainScreenWidth = widthSize * (5/8);
  var mainScreenHeight = 2 * mainScreenWidth / 3;

  resize={width:null, height:null, top:null, left:null};
  if(num == 0){
    resize.width = mainScreenWidth;
    resize.height = mainScreenHeight;
    resize.top = heightSize / 32;
    resize.left = widthSize * (3 / 32);
  }else if(num < subScreensMass){
    resize.width = subScreenWidth;
    resize.height = subScreenHeight;
    resize.top = (subScreenHeight / 2) * (num-1) + (titleHeightSize/2);
    resize.left = (widthSize - subScreenWidth) / 2;
  }else if(num >= subScreensMass){
    resize.width = subScreenWidth / 2;
    resize.height = subScreenHeight / 2;
    if(num == subScreensMass || num == subScreensMass+1){
      resize.top = (subScreenHeight / 2) * (subScreensMass-1) + (titleHeightSize/2) 
    }else{
      resize.top = (subScreenHeight / 2) * (subScreensMass-1+0.5) + (titleHeightSize/2) 
    }
    if(num % 2 == 0){
      resize.left = (widthSize-subScreenWidth)/2;
    }else{
      resize.left = (widthSize-(subScreenWidth/2))/2;
    }
  }else {}
  return resize;
}



function makeScreen(id, num, state=""){

  if(MyID == id){
    var viewID = ".video-view"
    var placeholderID = ".video-placeholder"
  }else{
    var viewID = ".video-view_"+String(id)
    var placeholderID = ".video-placeholder_"+String(id)
  }
  resize = screenInfo(num);
  $(viewID+","+placeholderID).css({
    "position": "absolute",
    "z-index": "1",
    "top": String(resize.top)+"px",
    "left":String(resize.left)+"px",
    "width": String(resize.width)+"px",
    "height": String(resize.height)+"px"
  });
  operationNumber(state, id, num)

  if(num == 0){
    $(placeholderID).css('border-left', 'solid 10px #f0a8a8');
    $(placeholderID).css('border-right', 'solid 10px #f0a8a8');
    $(placeholderID).css('border-top', 'solid 3px #f0a8a8');
    $(placeholderID).css('border-bottom', 'solid 3px #f0a8a8');
  }else if(num == 1){
    $(placeholderID).css('border-left', 'solid 10px #fffacc');
    $(placeholderID).css('border-right', 'solid 10px #fffacc');
    $(placeholderID).css('border-top', 'solid 3px #fffacc');
    $(placeholderID).css('border-bottom', 'solid 3px #fffacc');
  }else{
    $(placeholderID).css('border-left', 'solid 10px #affaaf');
    $(placeholderID).css('border-right', 'solid 10px #affaaf');
    $(placeholderID).css('border-top', 'solid 3px #affaaf');
    $(placeholderID).css('border-bottom', 'solid 3px #affaaf');
  }
}


function locateScreen(array, id){
  console.log("locateScreen")
  var num = array.indexOf(String(id));
  // if(num == 0){
  //   makeScreen(id, num)
  // }else{
  makeScreen(id, num, "make")
  // }
}


function moveScreen(users){
  /* array: User IDs are stored in the order of Shiritori. */
  Shiritori_Order(users);
  /* Change the size of the main screen of the Shiritori screen. */
  var id = ShiritoriOrder[0];
  makeScreen(id, 0, "remove")
  stateMute("move", "audio", id)
  /* Change the size of the sub screen of the shiritori screen. */
  for (i=1; i < ShiritoriOrder.length; i++){
    stateMute("move", "audio", id)
    if(i+1 == ShiritoriOrder.length){
      makeScreen(ShiritoriOrder[i], i, "make")
    }else{
      makeScreen(ShiritoriOrder[i], i, "change")
    }
  }
}


function classificateAppID(channel){
  let remain = Number(channel) % 5
  switch (remain){
    case 0:
      var AppID = "8f8ac72b0c9247ed96d8553bbe99a6ed"
      break;
    case 1:
      var AppID = "72ef29fe252e46da80d1079ddb01798a"
      break;
    case 2:
      var AppID = "91e15656dbce43a99e13ef9d9cd9966b"
      break;
    case 3:
    case 4:
      break;
    default:
      console.log("Error")
      break;
  }
  return AppID;
}

function isString(obj) {
  return typeof (obj) == "string" || obj instanceof String;
};

var fields = ["appID", "channel"]


function js_Join(channel, uid, cameraResolution, users){
  /*About arguments:
    ・channel : Get the room identification number.(numeric character string)
    ・uid : Identification id of the login user.(numeric character string)
    ・cameraResolution : You can specify the resolution of the camera.
          L Choose from : "default", "480p", "720p", "1080p"
    users : Obtaining the order of shiritori.(array (※uid is stored.) )
  */
  console.log("join")
  var user = users;
  var memberNum = memberInfo(String(user));
  if(memberNum <= N){
    console.log("About arguments: channel:"+channel+"uid:"+uid+"cameraResolution:"+cameraResolution);
    Shiritori_Order(String(user));
    var appid = classificateAppID(channel)
    var params = serializeformData(String(appid), String(channel), String(uid), String(cameraResolution)); 
    /* Acquisition of Unity screen size. */
    $(function() {
      var s = $('#gameContainer');
      widthSize = s.width()
      heightSize = s.height()
    });
    if (validator(params, fields)) {
      console.log(ShiritoriUsers)
      console.log(ShiritoriOrder)
      join(rtc, params).then(function(r){
        console.log(r)
        locateScreen(ShiritoriOrder, MyID)
        operationTelop("make")
      }).catch(function (e){
        alert(e);
      });
    }
  }else{
    console.error()
  }
}


function memberInfo(users){
  console.log("memberInfo");
  ShiritoriUsers = {};
  var usersInfo = users.split("_");
  for(i=0; i < usersInfo.length; i++){
    var user = usersInfo[i].split(",");
    ShiritoriUsers[user[1]] = user[0];
  }
  return i;
}

function Shiritori_Order(users){
  /* "はなこ,0412_たなか,3310_たろう,0120" */
  ShiritoriOrder = [];
  console.log("Shiritori_Order");
  var usersInfo = users.split("_");
  for(i=0; i < usersInfo.length; i++){
    var user = usersInfo[i].split(",");
    ShiritoriOrder.push(user[1]);
  }
}


function js_Leave(channel, uid, cameraResolution){
  console.log("leave")
  var appid = classificateAppID(channel)
  var params = serializeformData(String(appid), String(channel), String(uid), String(cameraResolution))
  console.log("parse: "+rtc)
  if (validator(params, fields)) {
    if(MyID == uid){
      leave(rtc)
      for(i=0; i < ShiritoriOrder.length; i++){
        //operationNumber("remove", ShiritoriOrder[i]);
        removeDesign(ShiritoriOrder[i]);
      }
      for(i=0; i < muteAudioUsers.length; i++){
        stateMute("remove", "audio", muteAudioUsers[i])
      }
      operationTelop("remove")
    }else{
      console.error("My ID and leave id do not match.")
    }
  }
}

function js_muteAudio(){
  console.log("muteAudioUsers:"+muteAudioUsers)
  if(muteAudioUsers.indexOf(String(MyID)) == -1){
    stateMute("make", "audio", MyID)
    rtc.localStream.muteAudio();
  }else{
    console.error("It's already muted.")
  }
  console.log("muteAudioUsers:"+muteAudioUsers)
}

function js_unmuteAudio(){
  console.log("muteAudioUsers:"+muteAudioUsers)
  if(muteAudioUsers.indexOf(String(MyID)) > -1){
    stateMute("remove", "audio", MyID)
    rtc.localStream.unmuteAudio();
  }else{
    console.error("Unmute failed because it is not muted.")
  }
  console.log("muteAudioUsers:"+muteAudioUsers)
}