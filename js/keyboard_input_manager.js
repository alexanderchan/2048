function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // vim keybindings
    76: 1,
    74: 2,
    72: 3,
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
  };

  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }

      if (event.which === 32) self.restart.bind(self)(event);  
      if (event.which === 85) self.reload.bind(self)(event);  // 'u'
      if (event.which === 8)  self.back.bind(self)(event);     // backspace
      if (event.which === 81) self.save.bind(self)(event); // 'q'
    }
  });

  var restart = document.querySelector("#restartbutton");
  restart.addEventListener("click", this.restart.bind(this));
  restart.addEventListener("touchend", this.restart.bind(this));

  var retry = document.querySelector(".retry-button");
  retry.addEventListener("click", this.restart.bind(this));
  retry.addEventListener("touchend", this.restart.bind(this));

  var save = document.querySelector("#savebutton");
  save.addEventListener("click",this.save.bind(this));
  save.addEventListener("touchend",this.save.bind(this));

  var reload = document.querySelector("#loadbutton");
  reload.addEventListener("click",this.reload.bind(this));
  reload.addEventListener("touchend",this.reload.bind(this));

  var back = document.querySelector("#backbutton");
  back.addEventListener("click",this.back.bind(this));
  back.addEventListener("touchend",this.back.bind(this));

  var keepPlaying = document.querySelector(".keep-playing-button");
  keepPlaying.addEventListener("click", this.keepPlaying.bind(this));
  keepPlaying.addEventListener("touchend", this.keepPlaying.bind(this));

  var inith = document.querySelector("#inith");
  reload.addEventListener("click",this.inith.bind(this));
  reload.addEventListener("touchend",this.inith.bind(this));

  // Listen to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  gameContainer.addEventListener("touchstart", function (event) {
    if (event.touches.length > 1) return;

    touchStartClientX = event.touches[0].clientX;
    touchStartClientY = event.touches[0].clientY;
    event.preventDefault();
  });

  gameContainer.addEventListener("touchmove", function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener("touchend", function (event) {
    if (event.touches.length > 0) return;

    var dx = event.changedTouches[0].clientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = event.changedTouches[0].clientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      // (right : left) : (down : up)
      self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
  });
};

KeyboardInputManager.prototype.back = function (event) {
  event.preventDefault();
  this.emit("back");
}


KeyboardInputManager.prototype.reload = function (event) {
  event.preventDefault();
  this.emit("reload");
}

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.save = function (event) {
  event.preventDefault();
  this.emit("save");
}

KeyboardInputManager.prototype.inith = function (event) {
  event.preventDefault();
  this.emit("initForH");
}
