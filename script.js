// Элементы DOM
const menuScreen = document.getElementById('menuScreen');
const howToPlayScreen = document.getElementById('howToPlayScreen');
const gameScreen = document.getElementById('gameScreen');
const gameCanvas = document.getElementById('gameCanvas');
const gameCtx = gameCanvas.getContext('2d');

// Элементы интерфейса
const highScoreElement = document.getElementById('highScore');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const finalScoreElement = document.getElementById('finalScore');
const finalHighScoreElement = document.getElementById('finalHighScore');
const snakeLengthElement = document.getElementById('snakeLength');

// Кнопки
const startBtn = document.getElementById('startBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const quitBtn = document.getElementById('quitBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const menuBtn = document.getElementById('menuBtn');

// Игровые переменные
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = 0; // Убран localStorage
let gameSpeed = 120; // миллисекунды
let gameRunning = false;
let gamePaused = false;
let gameInterval;
let gridSize = 20;
let gridWidth = gameCanvas.width / gridSize;
let gridHeight = gameCanvas.height / gridSize;

// Инициализация игры
function initGame() {
    // Начальная позиция змейки
    snake = [
        {x: 10, y: 15},
        {x: 9, y: 15},
        {x: 8, y: 15}
    ];
    
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = 120;
    
    generateFood();
    updateUI();
    highScoreElement.textContent = highScore;
}

// Генерация еды
function generateFood() {
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };
    
    // Проверка, чтобы еда не появилась на змейке
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

// Обновление интерфейса
function updateUI() {
    scoreElement.textContent = score;
    speedElement.textContent = Math.floor((120 - gameSpeed + 20) / 20);
    highScoreElement.textContent = highScore;
}

// Отрисовка игры
function draw() {
    // Очистка canvas
    gameCtx.fillStyle = '#111';
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Рисуем сетку
    gameCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    gameCtx.lineWidth = 0.5;
    for (let i = 0; i < gridWidth; i++) {
        gameCtx.beginPath();
        gameCtx.moveTo(i * gridSize, 0);
        gameCtx.lineTo(i * gridSize, gameCanvas.height);
        gameCtx.stroke();
    }
    for (let i = 0; i < gridHeight; i++) {
        gameCtx.beginPath();
        gameCtx.moveTo(0, i * gridSize);
        gameCtx.lineTo(gameCanvas.width, i * gridSize);
        gameCtx.stroke();
    }
    
    // Рисуем змейку
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Голова
            gameCtx.fillStyle = '#00ff00';
            gameCtx.shadowColor = '#00ff00';
            gameCtx.shadowBlur = 10;
        } else {
            // Тело
            const colorValue = Math.max(50, 255 - index * 2);
            gameCtx.fillStyle = `rgb(0, ${colorValue}, 0)`;
            gameCtx.shadowColor = `rgba(0, ${colorValue}, 0, 0.5)`;
            gameCtx.shadowBlur = 5;
        }
        
        gameCtx.fillRect(
            segment.x * gridSize, 
            segment.y * gridSize, 
            gridSize - 1, 
            gridSize - 1
        );
    });
    
    // Рисуем еду (яблоко)
    gameCtx.fillStyle = '#ff0000';
    gameCtx.shadowColor = '#ff0000';
    gameCtx.shadowBlur = 15;
    
    // Анимация пульсации яблока
    const pulseSize = 2 + Math.sin(Date.now() / 200) * 1;
    gameCtx.beginPath();
    gameCtx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - pulseSize,
        0,
        Math.PI * 2
    );
    gameCtx.fill();
    
    // Сбрасываем тень
    gameCtx.shadowBlur = 0;
}

// Обновление игры
function update() {
    if (gamePaused || !gameRunning) return;
    
    direction = nextDirection;
    
    // Создаем новую голову
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Проверка столкновения со стенами
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver();
        return;
    }
    
    // Проверка столкновения с собой
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }
    
    // Добавляем новую голову
    snake.unshift(head);
    
    // Проверка съедания еды
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (score > highScore) {
            highScore = score;
        }
        
        // Увеличиваем скорость
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(update, gameSpeed);
        }
        
        generateFood();
    } else {
        // Удаляем хвост если не съели еду
        snake.pop();
    }
    
    updateUI();
    draw();
}

// Завершение игры
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    
    finalScoreElement.textContent = score;
    finalHighScoreElement.textContent = highScore;
    snakeLengthElement.textContent = snake.length;
    
    setTimeout(() => {
        document.getElementById('gameOverScreen').style.display = 'flex';
    }, 500);
}

// Пауза игры
function togglePause() {
    gamePaused = !gamePaused;
    document.getElementById('pauseScreen').style.display = gamePaused ? 'flex' : 'none';
}

// Начало игры
function startGame() {
    menuScreen.style.display = 'none';
    howToPlayScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    initGame();
    gameRunning = true;
    gamePaused = false;
    
    clearInterval(gameInterval);
    gameInterval = setInterval(update, gameSpeed);
    
    draw();
}

// Обработчики событий клавиатуры
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            e.preventDefault();
            break;
        case ' ':
            togglePause();
            e.preventDefault();
            break;
    }
});

// Обработчики кнопок
startBtn.addEventListener('click', startGame);
howToPlayBtn.addEventListener('click', () => {
    menuScreen.style.display = 'none';
    howToPlayScreen.style.display = 'block';
});
backToMenuBtn.addEventListener('click', () => {
    howToPlayScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});
pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);
quitBtn.addEventListener('click', () => {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameInterval);
    document.getElementById('pauseScreen').style.display = 'none';
    gameScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});
playAgainBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => {
    document.getElementById('gameOverScreen').style.display = 'none';
    gameScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});

// Инициализация
highScoreElement.textContent = highScore;