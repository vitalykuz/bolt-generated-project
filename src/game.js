const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const finalScoreElement = document.getElementById('finalScore');
const newHighScoreElement = document.getElementById('newHighScore');
const playerNameElement = document.getElementById('playerName');
const playerNameFinalElement = document.getElementById('playerNameFinal');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = 0;
let gameSpeed = 100;
let gameLoop;
let particles = [];
let playerName = '';
let gameStarted = false;

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 2;
    this.speedX = Math.random() * 6 - 3;
    this.speedY = Math.random() * 6 - 3;
    this.life = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 0.02;
    this.size -= 0.1;
  }

  draw() {
    ctx.fillStyle = `rgba(33, 150, 243, ${this.life})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createParticles(x, y) {
  for (let i = 0; i < 30; i++) {
    particles.push(new Particle(x, y));
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].life <= 0 || particles[i].size <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawGame() {
  clearCanvas();
  moveSnake();
  checkCollision();
  drawFood();
  drawSnake();
  updateParticles();
}

function clearCanvas() {
  ctx.fillStyle = '#0a0a1f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = 'rgba(33, 150, 243, 0.1)';
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const gradient = ctx.createRadialGradient(
      segment.x * gridSize + gridSize/2,
      segment.y * gridSize + gridSize/2,
      0,
      segment.x * gridSize + gridSize/2,
      segment.y * gridSize + gridSize/2,
      gridSize/2
    );
    
    if (index === 0) {
      gradient.addColorStop(0, '#2196F3');
      gradient.addColorStop(1, '#1976D2');
    } else {
      gradient.addColorStop(0, '#64B5F6');
      gradient.addColorStop(1, '#2196F3');
    }
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#2196F3';
    ctx.shadowBlur = 10;
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    ctx.shadowBlur = 0;
  });
}

function drawFood() {
  const gradient = ctx.createRadialGradient(
    food.x * gridSize + gridSize/2,
    food.y * gridSize + gridSize/2,
    0,
    food.x * gridSize + gridSize/2,
    food.y * gridSize + gridSize/2,
    gridSize/2
  );
  
  gradient.addColorStop(0, '#FF5252');
  gradient.addColorStop(1, '#FF1744');
  
  ctx.fillStyle = gradient;
  ctx.shadowColor = '#FF5252';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize/2,
    food.y * gridSize + gridSize/2,
    gridSize/2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    createParticles(head.x * gridSize, head.y * gridSize);
    generateFood();
    score += 10;
    scoreElement.textContent = `Score: ${score}`;
    gameSpeed = Math.max(50, gameSpeed - 2);
    clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, gameSpeed);
  } else {
    snake.pop();
  }
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
  
  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    generateFood();
  }
}

function checkCollision() {
  const head = snake[0];
  
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
  }
  
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
    }
  }
}

function gameOver() {
  clearInterval(gameLoop);
  const isNewHighScore = score > highScore;
  if (isNewHighScore) {
    highScore = score;
    highScoreElement.textContent = `High Score: ${highScore}`;
    newHighScoreElement.style.display = 'block';
    document.querySelector('.game-container').classList.add('celebrating');
    createVictoryParticles();
  } else {
    newHighScoreElement.style.display = 'none';
  }
  
  playerNameFinalElement.textContent = `Player: ${playerName}`;
  finalScoreElement.textContent = `Score: ${score}`;
  gameOverScreen.style.display = 'block';
}

function createVictoryParticles() {
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      createParticles(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
    }, i * 50);
  }
}

window.resetGame = function() {
  snake = [{ x: 10, y: 10 }];
  food = { x: 5, y: 5 };
  dx = 0;
  dy = 0;
  score = 0;
  gameSpeed = 100;
  particles = [];
  scoreElement.textContent = `Score: ${score}`;
  gameOverScreen.style.display = 'none';
  document.querySelector('.game-container').classList.remove('celebrating');
  clearInterval(gameLoop);
  gameLoop = setInterval(drawGame, gameSpeed);
};

window.startGame = function() {
  const input = document.getElementById('playerNameInput');
  playerName = input.value.trim() || 'Player';
  playerNameElement.textContent = playerName;
  startScreen.style.display = 'none';
  gameStarted = true;
  resetGame();
};

document.addEventListener('keydown', (e) => {
  if (!gameStarted) {
    if (e.key === 'Enter') {
      startGame();
    }
    return;
  }

  if (gameOverScreen.style.display === 'block') {
    if (e.key === 'Enter' || e.key === ' ') {
      resetGame();
    }
    return;
  }

  switch (e.key) {
    case 'ArrowUp':
      if (dy === 0) { dx = 0; dy = -1; }
      break;
    case 'ArrowDown':
      if (dy === 0) { dx = 0; dy = 1; }
      break;
    case 'ArrowLeft':
      if (dx === 0) { dx = -1; dy = 0; }
      break;
    case 'ArrowRight':
      if (dx === 0) { dx = 1; dy = 0; }
      break;
  }
});

// Initialize game
document.getElementById('playerNameInput').focus();
