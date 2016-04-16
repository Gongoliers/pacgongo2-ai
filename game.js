var SCALE = 2;
var WIDTH = 224 * SCALE,
  HEIGHT = 248 * SCALE;
var BLOCK = 8 * SCALE;

// Canvas
var canvas, ctx;

// Audio
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audio = new AudioContext();
var mainTheme = null, wakaWaka = null, dyingSound=null, eatHatSound=null;
var soundOn = null;
var source;
var volumeButton = document.getElementById("volume");

if (typeof(Storage) !== "undefined") {
  var vol = localStorage.getItem("volume") === "true";
  if (vol === null) {
    soundOn = true;
    localStorage.setItem("volume", true);
  } else {
    soundOn = vol;
    if (soundOn) {
      volumeButton.src = "res/volume_on.png";
    } else {
      volumeButton.src = "res/volume_off.png";
    }
  }
}

volumeButton.addEventListener("click", function(event) {
  if (soundOn) {
    volumeButton.src = "res/volume_off.png";
    soundOn = false;
    if (source !== null)
      source.stop(0);
  } else {
    volumeButton.src = "res/volume_on.png";
    soundOn = true;
  }
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem("volume", soundOn);
  }
});

function playSound(buffer) {
  if (buffer === null || !soundOn)
    return;
  source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  source.start(0);
}

function loadSounds() {
  var bufferLoader = new BufferLoader(
    audio, ['res/pacman_beginning.wav', 'res/pacman-waka-waka.mp3', 'res/pacman-dying.mp3', 'res/pacman_eatfruit.wav'],
    function(bufferList) {
      playSound(bufferList[0]);
      wakaWaka = bufferList[1];
      dyingSound = bufferList[2];
      eatHatSound = bufferList[3];
    });
  bufferLoader.load();
}



// Keypress
var keystate = null;
var currentKeyState = null;
var up = 38,
  down = 40,
  left = 37,
  right = 39;
window.addEventListener("keydown", function(evt) {
  keystate = evt.keyCode;
});

// Mobile support
window.addEventListener("deviceorientation", function(event) {
  if( event.gamma === null && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    alert("Sorry, your device is not supported!");
  if (event.gamma > 20) {
    keystate = right;
  } else if (event.gamma < -20) {
    keystate = left;
  } else if (event.beta < 5) {
    keystate = up;
  } else if (event.beta > 25) {
    keystate = down;
  }
});

// Sprites
var player;
var ghosts = [];

// Map
var map;

// Round
var round = 1;

// Game loop
function main() {
  loadSounds();
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  init();
  update();
  draw();
  ctx.font = "12px Arial";
  ctx.fillText("Ready!", WIDTH / 2 - 12, 18 * BLOCK - 5);
  setTimeout(function() {
    window.requestAnimationFrame(loop, canvas);
  }, 4100);
}

function loop() {
  update();
  draw();
  if (map.count === 0 || (player.dying && player.lives >= 0)) {
    player.superMode = false;
    for (var g = 0; g < 4; g++) {
      ghosts[g].x = 12 * BLOCK + g * BLOCK;
      ghosts[g].y = 14 * BLOCK;
      // if(2 >= round && round <= 4){
      //   ghosts[g].speed = 11 * BLOCK / 60 * 0.85;
      // } else if(round >= 5){
      //   ghosts[g].speed = 11 * BLOCK / 60 * 0.95;
      // }
    }
    player.x = 14 * BLOCK;
    player.y = 23 * BLOCK;
    player.dying = false;
    if (map.count === 0){
      map = new Map(BLOCK);
      round++;
    }
    setTimeout(function() {
      ctx.fillText("Ready!", WIDTH / 2 - 12, 18 * BLOCK - 5);
      setTimeout(function() {
        window.requestAnimationFrame(loop, canvas);
      }, 1000);
    }, 500);
  } else if (player.lives >= 0 && !player.dying){
    window.requestAnimationFrame(loop, canvas);
  } else {
    ctx.fillStyle = "#f00";
    ctx.fillText("Game Over!", WIDTH / 2 - 28, 18 * BLOCK - 5);
    setTimeout(function() {
      window.location.reload();
    }, 1000);
  }
}

function init() {
  player = new Pacgongo(BLOCK);
  map = new Map(BLOCK);
  for (var i = 0; i < 4; i++) {
    var scatterX, scatterY;
    if(i % 2 === 0){
      scatterX = 1;

    } else {
      scatterX = 26;
    }
    if(i === 0 || i === 1){
      scatterY = 1;
    } else {
      scatterY = map.map.length-2;
    }
    ghosts.push(new Ghost(BLOCK, 12 * BLOCK + i * BLOCK, scatterX, scatterY));
  }
}

function update() {
  player.update(keystate, map);
  for (var i = 0; i < ghosts.length; i++) {
    ghosts[i].update(player, map);
  }
}

function draw() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  map.draw(ctx);
  player.draw(ctx);
  for (var i = 0; i < ghosts.length; i++) {
    ghosts[i].draw(ctx);
  }
}

main();
