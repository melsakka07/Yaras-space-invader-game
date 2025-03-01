const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
const state = {
  player: {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 20,
    speed: 7,
    isMovingLeft: false,
    isMovingRight: false
  },
  invaders: [],
  bullets: [],
  score: 0,
  invaderDirection: 1,
  invaderSpeed: 2,
  gameOver: false
};

// Initialize invaders
function createInvaders() {
  for(let row = 0; row < 4; row++) {
    for(let col = 0; col < 10; col++) {
      state.invaders.push({
        x: 100 + col * 60,
        y: 50 + row * 40,
        width: 30,
        height: 20,
        alive: true
      });
    }
  }
}

// Game controls
window.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowLeft') state.player.isMovingLeft = true;
  if(e.key === 'ArrowRight') state.player.isMovingRight = true;
  if(e.key === ' ') fireBullet();
});

window.addEventListener('keyup', (e) => {
  if(e.key === 'ArrowLeft') state.player.isMovingLeft = false;
  if(e.key === 'ArrowRight') state.player.isMovingRight = false;
});

function fireBullet() {
  state.bullets.push({
    x: state.player.x + state.player.width / 2 - 2.5,
    y: state.player.y,
    width: 5,
    height: 15,
    speed: 8
  });
}

function update() {
  if(state.gameOver) return;

  // Player movement
  if(state.player.isMovingLeft && state.player.x > 0) {
    state.player.x -= state.player.speed;
  }
  if(state.player.isMovingRight && state.player.x < canvas.width - state.player.width) {
    state.player.x += state.player.speed;
  }

  // Update bullets
  state.bullets = state.bullets.filter(bullet => {
    bullet.y -= bullet.speed;
    return bullet.y > 0;
  });

  // Update invaders
  let edgeReached = false;
  state.invaders.forEach(invader => {
    if(!invader.alive) return;
    invader.x += state.invaderSpeed * state.invaderDirection;
    
    if(invader.x < 0 || invader.x + invader.width > canvas.width) {
      edgeReached = true;
    }
  });

  if(edgeReached) {
    state.invaderDirection *= -1;
    state.invaders.forEach(invader => {
      invader.y += 20;
      if(invader.y + invader.height > canvas.height - 50) {
        state.gameOver = true;
      }
    });
  }

  // Collision detection
  state.bullets.forEach((bullet, bulletIndex) => {
    state.invaders.forEach((invader, invaderIndex) => {
      if(invader.alive &&
         bullet.x < invader.x + invader.width &&
         bullet.x + bullet.width > invader.x &&
         bullet.y < invader.y + invader.height &&
         bullet.y + bullet.height > invader.y) {
        state.score += 100;
        scoreElement.textContent = `Score: ${state.score}`;
        invader.alive = false;
        state.bullets.splice(bulletIndex, 1);
      }
    });
  });

  // Check win condition
  if(state.invaders.every(invader => !invader.alive)) {
    state.gameOver = true;
  }
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = '#0f0';
  ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);

  // Draw invaders
  state.invaders.forEach(invader => {
    if(invader.alive) {
      ctx.fillStyle = '#f00';
      ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
    }
  });

  // Draw bullets
  ctx.fillStyle = '#fff';
  state.bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // Game over text
  if(state.gameOver) {
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    const gameOverText = state.invaders.every(invader => !invader.alive)
      ? 'YOU WIN!'
      : 'GAME OVER!';
    ctx.fillText(gameOverText, canvas.width/2, canvas.height/2);
    ctx.font = '24px Arial';
    ctx.fillText('Press R to restart', canvas.width/2, canvas.height/2 + 40);
  }
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
createInvaders();
gameLoop();

// Restart handler
window.addEventListener('keydown', (e) => {
  if(e.key === 'r' && state.gameOver) {
    state.invaders = [];
    state.bullets = [];
    state.score = 0;
    state.gameOver = false;
    state.invaderDirection = 1;
    createInvaders();
    scoreElement.textContent = `Score: ${state.score}`;
  }
});
