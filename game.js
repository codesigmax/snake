// 游戏配置
const config = {
    gridSize: 20,
    initialSpeed: 200,
    snakeColor: '#4CAF50',
    foodColor: '#FF4444',
    gridColor: '#eee'
};

// 游戏状态
let snake = [];
let food = null;
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameLoop = null;

// 获取画布和上下文
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');

// 初始化游戏
function initGame() {
    // 初始化蛇的位置
    const centerX = Math.floor(canvas.width / config.gridSize / 2);
    const centerY = Math.floor(canvas.height / config.gridSize / 2);
    snake = [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY }
    ];

    // 重置游戏状态
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    updateScore();
    generateFood();
    gameOverElement.style.display = 'none';
}

// 生成食物
function generateFood() {
    while (true) {
        food = {
            x: Math.floor(Math.random() * (canvas.width / config.gridSize)),
            y: Math.floor(Math.random() * (canvas.height / config.gridSize))
        };
        // 确保食物不会生成在蛇身上
        if (!snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            break;
        }
    }
}

// 更新分数
function updateScore() {
    scoreElement.textContent = `分数: ${score}`;
    finalScoreElement.textContent = score;
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameOverElement.style.display = 'block';
}

// 检查碰撞
function checkCollision(head) {
    // 检查是否撞墙
    if (head.x < 0 || head.x >= canvas.width / config.gridSize ||
        head.y < 0 || head.y >= canvas.height / config.gridSize) {
        return true;
    }
    // 检查是否撞到自己
    return snake.some((segment, index) => {
        if (index === 0) return false;
        return segment.x === head.x && segment.y === head.y;
    });
}

// 移动蛇
function moveSnake() {
    direction = nextDirection;
    const head = { ...snake[0] };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    if (checkCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
    } else {
        snake.pop();
    }
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = config.gridColor;
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= canvas.width; x += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制游戏状态
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    drawGrid();

    // 绘制食物
    ctx.fillStyle = config.foodColor;
    ctx.fillRect(
        food.x * config.gridSize,
        food.y * config.gridSize,
        config.gridSize - 1,
        config.gridSize - 1
    );

    // 绘制蛇
    ctx.fillStyle = config.snakeColor;
    snake.forEach(segment => {
        ctx.fillRect(
            segment.x * config.gridSize,
            segment.y * config.gridSize,
            config.gridSize - 1,
            config.gridSize - 1
        );
    });
}

// 游戏主循环
function gameStep() {
    moveSnake();
    draw();
}

// 开始游戏
function startGame() {
    if (gameLoop) clearInterval(gameLoop);
    initGame();
    gameLoop = setInterval(gameStep, config.initialSpeed);
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const directions = {
        'arrowup': 'up',
        'arrowdown': 'down',
        'arrowleft': 'left',
        'arrowright': 'right',
        'w': 'up',
        's': 'down',
        'a': 'left',
        'd': 'right'
    };

    if (directions[key]) {
        const newDirection = directions[key];
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        // 防止蛇反向移动
        if (opposites[newDirection] !== direction) {
            nextDirection = newDirection;
        }
    }
});

// 移动端触摸控制
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0 && direction !== 'left') {
            nextDirection = 'right';
        } else if (deltaX < 0 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // 垂直滑动
        if (deltaY > 0 && direction !== 'up') {
            nextDirection = 'down';
        } else if (deltaY < 0 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
});

// 启动游戏
startGame();