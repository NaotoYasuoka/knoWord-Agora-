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

function serializeformData() {
    // var formData = $("#form").serializeArray()
    var obj = {}
    obj["appID"] = "8f8ac72b0c9247ed96d8553bbe99a6ed"
    obj["channel"] = "123"
    obj["mode"] = "live"
    obj["codec"] = "h264"
    obj["uid"] = "1234"
    obj["token"] = ""
    return obj
}

function addView (id, show) {
    if (!$("#" + id)[0]) {
        // alert("これはすごい。表示開始かな？")
        $("<div/>", {
            id: "remote_video_panel_" + id,
            class: "video-view",
        }).appendTo("#video")

        $("<div/>", {
            id: "remote_video_" + id,
            class: "video-placeholder",
        }).appendTo("#remote_video_panel_" + id)

        $("<div/>", {
            id: "remote_video_info_" + id,
            class: "video-profile " + (show ? "" :  "hide"),
        }).appendTo("#remote_video_panel_" + id)

        $("<div/>", {
            id: "video_autoplay_"+ id,
            class: "autoplay-fallback hide",
        }).appendTo("#remote_video_panel_" + id)
        // alert("これはすごい。表示開始のコード終了かな？")
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


function join (rtc, option) {
    if (rtc.joined) {
        Toast.error("Your already joined")
        return;
    }  
    rtc.client = AgoraRTC.createClient({mode: option.mode, codec: option.codec})
    rtc.params = option

    rtc.client.init(option.appID, function () {
        console.log("init success")

        rtc.client.join(option.token ? option.token : null, option.channel, option.uid ? +option.uid : null, function (uid) {
            Toast.notice("join channel: " + option.channel + " success, uid: " + uid)
            console.log("join channel: " + option.channel + " success, uid: " + uid)
            rtc.joined = true

            rtc.params.uid = uid

            // create local stream
            rtc.localStream = AgoraRTC.createStream({
                streamID: rtc.params.uid,
                audio: true,
                video: true,
                screen: false,
                microphoneId: option.microphoneId,
                cameraId: option.cameraId
            })
            // initialize local stream. Callback function executed after intitialization is done
            rtc.localStream.init(function () {
                console.log("init local stream success")
                // play stream with html element id "local_stream"
                alert("これはすごい。表示開始のコード終了かな？")
                //rtc.localStream.play("local_stream")
                // publish local stream
                publish(rtc)
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

function Join(){
    console.log("join")
    //e.preventDefault();
    var params = serializeformData(); // Data is feteched and serilized from the form element.
    if (validator(params, fields)) {
        join(rtc, params)
    }
}

// unityMessageというCustomEventを受け取る
window.addEventListener('unityMessage', Join, false)