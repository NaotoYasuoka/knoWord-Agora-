mergeInto(LibraryManager.library, {

  Join: function (channel, uid, camera, users) {
    js_Join(channel, Pointer_stringify(uid), Pointer_stringify(camera), Pointer_stringify(users));
  },

  Leave: function (channel, uid, camera) {
    js_Leave(channel, Pointer_stringify(uid), Pointer_stringify(camera));
  },

  Move: function (users) {
    moveScreen(Pointer_stringify(users));
  },

  Mute: function () {
    js_muteAudio();
  },

  Unmute: function () {
    js_unmuteAudio();
  },

  Hello: function () {
    Hello();
  },
  
});