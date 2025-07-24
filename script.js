// Элементы DOM
const menuScreen = document.getElementById('menuScreen');
const achievementsScreen = document.getElementById('achievementsScreen');
const settingsScreen = document.getElementById('settingsScreen');
const howToPlayScreen = document.getElementById('howToPlayScreen');
const gameScreen = document.getElementById('gameScreen');
const gameCanvas = document.getElementById('gameCanvas');
const gameCtx = gameCanvas.getContext('2d');
const particlesContainer = document.getElementById('particlesContainer');

// Элементы интерфейса
const highScoreElement = document.getElementById('highScore');
const gamesPlayedElement = document.getElementById('gamesPlayed');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const applesElement = document.getElementById('apples');
const finalScoreElement = document.getElementById('finalScore');
const finalHighScoreElement = document.getElementById('finalHighScore');
const snakeLengthElement = document.getElementById('snakeLength');
const applesEatenElement = document.getElementById('applesEaten');
const newRecordElement = document.getElementById('newRecord');
const pauseScoreElement = document.getElementById('pauseScore');
const pauseLengthElement = document.getElementById('pauseLength');

// Кнопки
const startBtn = document.getElementById('startBtn');
const achievementsBtn = document.getElementById('achievementsBtn');
const settingsBtn = document.getElementById('settingsBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const backToMenuFromAchievements = document.getElementById('backToMenuFromAchievements');
const backToMenuFromSettings = document.getElementById('backToMenuFromSettings');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const quitBtn = document.getElementById('quitBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const menuBtn = document.getElementById('menuBtn');
const muteBtn = document.getElementById('muteBtn');

// Настройки
const soundToggle = document.getElementById('soundToggle');
const particlesToggle = document.getElementById('particlesToggle');
const difficultySelect = document.getElementById('difficultySelect');

// Игровые переменные
let snake = [];
let food = {};
let bonuses = [];
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = 0;
let gamesPlayed = 0;
let applesEaten = 0;
let gameSpeed = 120;
let gameRunning = false;
let gamePaused = false;
let gameInterval;
let gridSize = 20;
let gridWidth = gameCanvas.width / gridSize;
let gridHeight = gameCanvas.height / gridSize;
let soundEnabled = true;
let particlesEnabled = true;
let difficulty = 'normal';

// Система частиц
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 30;
        this.maxLife = 30;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.element = document.createElement('div');
        this.element.className = 'particle';
        this.element.style.backgroundColor = color;
        this.element.style.width = this.size + 'px';
        this.element.style.height = this.size + 'px';
        particlesContainer.appendChild(this.element);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // гравитация
        this.life--;
        
        const lifeRatio = this.life / this.maxLife;
        this.element.style.opacity = lifeRatio;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(${lifeRatio})`;
        
        return this.life > 0;
    }

    destroy() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

let particles = [];

// Достижения
const achievements = [
    { id: 'first_game', title: 'Первый шаг', desc: 'Сыграйте первую игру', icon: '🎮', unlocked: false },
    { id: 'score_50', title: 'Новичок', desc: 'Наберите 50 очков', icon: '⭐', unlocked: false },
    { id: 'score_100', title: 'Продвинутый', desc: 'Наберите 100 очков', icon: '🌟', unlocked: false },
    { id: 'score_200', title: 'Эксперт', desc: 'Наберите 200 очков', icon: '🏆', unlocked: false },
    { id: 'long_snake', title: 'Гигант', desc: 'Достигните длины 20', icon: '🐍', unlocked: false },
    { id: 'many_games', title: 'Фанат', desc: 'Сыграйте 10 игр', icon: '🎯', unlocked: false }
];

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
    applesEaten = 0;
    
    // Установка скорости в зависимости от сложности
    switch(difficulty) {
        case 'easy': gameSpeed = 150; break;
        case 'normal': gameSpeed = 120; break;
        case 'hard': gameSpeed = 90; break;
        case 'insane': gameSpeed = 60; break;
        default: gameSpeed = 120;
    }
    
    bonuses = [];
    generateFood();
    updateUI();
    highScoreElement.textContent = highScore;
    gamesPlayedElement.textContent = gamesPlayed;
}

// Генерация еды
function generateFood() {
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
        type: 'apple' // обычное яблоко
    };
    
    // Иногда генерируем бонус
    if (Math.random() < 0.1) {
        food.type = Math.random() < 0.5 ? 'star' : 'speed';
    }
    
    // Проверка, чтобы еда не появилась на змейке
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

// Создание частиц
function createParticles(x, y, color, count = 10) {
    if (!particlesEnabled) return;
    
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            x * gridSize + gridSize/2,
            y * gridSize + gridSize/2,
            color
        ));
    }
}

// Обновление частиц
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
            particles[i].destroy();
            particles.splice(i, 1);
        }
    }
}

// Обновление интерфейса
function updateUI() {
    scoreElement.textContent = score;
    speedElement.textContent = Math.floor((150 - gameSpeed + 30) / 30);
    applesElement.textContent = applesEaten;
    highScoreElement.textContent = highScore;
    gamesPlayedElement.textContent = gamesPlayed;
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
        let color, shadowColor;
        if (index === 0) {
            // Голова
            color = '#00ff00';
            shadowColor = '#00ff00';
            gameCtx.shadowBlur = 15;
        } else {
            // Тело
            const colorValue = Math.max(50, 255 - index * 2);
            color = `rgb(0, ${colorValue}, 0)`;
            shadowColor = `rgba(0, ${colorValue}, 0, 0.5)`;
            gameCtx.shadowBlur = 8;
        }
        
        gameCtx.fillStyle = color;
        gameCtx.shadowColor = shadowColor;
        gameCtx.fillRect(
            segment.x * gridSize, 
            segment.y * gridSize, 
            gridSize - 1, 
            gridSize - 1
        );
    });
    
    // Рисуем еду
    gameCtx.shadowBlur = 20;
    switch(food.type) {
        case 'star':
            gameCtx.fillStyle = '#ffff00';
            gameCtx.shadowColor = '#ffff00';
            break;
        case 'speed':
            gameCtx.fillStyle = '#00ffff';
            gameCtx.shadowColor = '#00ffff';
            break;
        default:
            gameCtx.fillStyle = '#ff0000';
            gameCtx.shadowColor = '#ff0000';
    }
    
    // Анимация пульсации
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
    
    // Обновляем частицы
    updateParticles();
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
        // Создаем частицы
        createParticles(food.x, food.y, 
            food.type === 'star' ? '#ffff00' : 
            food.type === 'speed' ? '#00ffff' : '#ff0000', 
            20
        );
        
        // Обработка разных типов еды
        switch(food.type) {
            case 'star':
                score += 50;
                break;
            case 'speed':
                score += 20;
                // Временно замедляем игру
                const oldSpeed = gameSpeed;
                gameSpeed = Math.min(200, gameSpeed + 30);
                setTimeout(() => {
                    gameSpeed = oldSpeed;
                    clearInterval(gameInterval);
                    gameInterval = setInterval(update, gameSpeed);
                }, 3000);
                break;
            default:
                score += 10;
                applesEaten++;
        }
        
        if (score > highScore) {
            highScore = score;
        }
        
        // Увеличиваем скорость (кроме бонуса скорости)
        if (food.type !== 'speed' && gameSpeed > 50) {
            gameSpeed -= 1;
            clearInterval(gameInterval);
            gameInterval = setInterval(update, gameSpeed);
        }
        
        generateFood();
    } else {
        // Удаляем хвост если не съели еду
        snake.pop();
    }
    
    // Проверка достижений
    checkAchievements();
    
    updateUI();
    draw();
}

// Проверка достижений
function checkAchievements() {
    if (!achievements.find(a => a.id === 'first_game')?.unlocked) {
        unlockAchievement('first_game');
    }
    
    if (score >= 50 && !achievements.find(a => a.id === 'score_50')?.unlocked) {
        unlockAchievement('score_50');
    }
    
    if (score >= 100 && !achievements.find(a => a.id === 'score_100')?.unlocked) {
        unlockAchievement('score_100');
    }
    
    if (score >= 200 && !achievements.find(a => a.id === 'score_200')?.unlocked) {
        unlockAchievement('score_200');
    }
    
    if (snake.length >= 20 && !achievements.find(a => a.id === 'long_snake')?.unlocked) {
        unlockAchievement('long_snake');
    }
    
    if (gamesPlayed >= 10 && !achievements.find(a => a.id === 'many_games')?.unlocked) {
        unlockAchievement('many_games');
    }
}

// Разблокировка достижения
function unlockAchievement(id) {
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        showAchievementNotification(achievement);
    }
}

// Показ уведомления о достижении
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            border: 2px solid gold;
            border-radius: 10px;
            padding: 15px;
            color: gold;
            z-index: 1000;
            animation: slideIn 0.5s, fadeOut 0.5s 2.5s;
        ">
            <div style="font-size: 2em; margin-bottom: 10px;">${achievement.icon}</div>
            <div style="font-weight: bold;">${achievement.title}</div>
            <div style="font-size: 12px; opacity: 0.8;">${achievement.desc}</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Завершение игры
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    
    gamesPlayed++;
    
    finalScoreElement.textContent = score;
    finalHighScoreElement.textContent = highScore;
    snakeLengthElement.textContent = snake.length;
    applesEatenElement.textContent = applesEaten;
    
    // Проверка нового рекорда
    if (score === highScore && score > 0) {
        newRecordElement.style.display = 'block';
    } else {
        newRecordElement.style.display = 'none';
    }
    
    setTimeout(() => {
        document.getElementById('gameOverScreen').style.display = 'flex';
    }, 500);
}

// Пауза игры
function togglePause() {
    gamePaused = !gamePaused;
    document.getElementById('pauseScreen').style.display = gamePaused ? 'flex' : 'none';
    pauseScoreElement.textContent = score;
    pauseLengthElement.textContent = snake.length;
}

// Начало игры
function startGame() {
    menuScreen.style.display = 'none';
    achievementsScreen.style.display = 'none';
    settingsScreen.style.display = 'none';
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
        case 'm':
        case 'M':
            toggleSound();
            e.preventDefault();
            break;
    }
});

// Переключение звука
function toggleSound() {
    soundEnabled = !soundEnabled;
    muteBtn.textContent = soundEnabled ? '🔊' : '🔇';
}

// Обработчики кнопок
startBtn.addEventListener('click', startGame);
achievementsBtn.addEventListener('click', () => {
    menuScreen.style.display = 'none';
    achievementsScreen.style.display = 'block';
    renderAchievements();
});
settingsBtn.addEventListener('click', () => {
    menuScreen.style.display = 'none';
    settingsScreen.style.display = 'block';
});
howToPlayBtn.addEventListener('click', () => {
    menuScreen.style.display = 'none';
    howToPlayScreen.style.display = 'block';
});
backToMenuFromAchievements.addEventListener('click', () => {
    achievementsScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});
backToMenuFromSettings.addEventListener('click', () => {
    settingsScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});
backToMenuBtn.addEventListener('click', () => {
    howToPlayScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});
saveSettingsBtn.addEventListener('click', () => {
    soundEnabled = soundToggle.checked;
    particlesEnabled = particlesToggle.checked;
    difficulty = difficultySelect.value;
    settingsScreen.style.display = 'none';
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
muteBtn.addEventListener('click', toggleSound);

// Рендер достижений
function renderAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';
    
    achievements.forEach(achievement => {
        const div = document.createElement('div');
        div.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;
        achievementsList.appendChild(div);
    });
}

// Инициализация
highScoreElement.textContent = highScore;
gamesPlayedElement.textContent = gamesPlayed;

// Добавляем CSS для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);