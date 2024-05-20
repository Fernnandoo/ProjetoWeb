const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const score = document.querySelector('.score-value')
const finalScore = document.querySelector('.final-score > span')
const menu = document.querySelector('.menu')
const buttonPlay = document.querySelector('.btn-play')
const buttonHard = document.querySelector('.btn-hard')

const food_audio = new Audio('./assets/audio.mp3')
const move_audio = new Audio('./assets/move.mp3')
const gameover_audio = new Audio('./assets/gameover.mp3')

const size = 30;

let speed = 150
let gameIsOver = false
let snake = [
    { x: 270, y: 300 },
    { x: 300, y: 300 }
]

const incrementScore = () => {
    score.innerText = parseInt(score.innerText) + 10
}

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / size) * size
}

const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

let direction, loopId

const drawFood = () => {
    const { x, y, color } = food

    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}

const drawSnake = () => {
    ctx.fillStyle = '#c5c5c5'

    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = '#e5e5e5'
        }

        ctx.fillRect(position.x, position.y, size, size)
    })
}

const moveSnake = () => {
    if (!direction) return
    const head = snake[snake.length - 1]

    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y })
    }
    if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y })
    }
    if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size })
    }
    if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size })
    }

    snake.shift()
}

const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = '#191919'

    for (i = 30; i < canvas.width; i += 30) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }

}

const checkEat = () => {
    const head = snake[snake.length - 1]

    if (head.x == food.x && head.y == food.y) {
        snake.push(head)
        incrementScore()
        food_audio.play()

        let x = randomPosition()
        let y = randomPosition()

        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

const checkCollision = () => {
    const head = snake[snake.length - 1]
    const neckIndex = snake.length - 2
    const canvasLimit = canvas.width - size

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    if (wallCollision || selfCollision) {
        if (!gameIsOver) {
            gameIsOver = true
            gameover_audio.play()
            gameOver()
        }
    }
}

const gameOver = () => {
    direction = undefined

    menu.style.display = 'flex'
    finalScore.innerText = score.innerText
    canvas.style.filter = 'blur(5px)'
}

const gameLoop = () => {
    if (gameIsOver) return
    clearInterval(loopId)
    ctx.clearRect(0, 0, 600, 600)

    drawGrid()
    drawFood()
    drawSnake()
    moveSnake()
    checkEat()
    checkCollision()

    loopId = setTimeout(gameLoop, speed)
}

gameLoop()

document.addEventListener("keydown", ({ key }) => {
    let newDirection

    if (key == "ArrowRight" && direction != 'left') {
        newDirection = "right"
    }
    if (key == "ArrowLeft" && direction != 'right') {
        newDirection = "left"
    }
    if (key == "ArrowUp" && direction != 'down') {
        newDirection = "up"
    }
    if (key == "ArrowDown" && direction != 'up') {
        newDirection = "down"
    }
    if (key == "Escape") {
        newDirection = undefined
    }

    if (newDirection !== direction) {
        direction = newDirection
        move_audio.play()
    }
})

buttonPlay.addEventListener('click', () => {
    score.innerText = '00'
    menu.style.display = 'none'
    canvas.style.filter = 'none'

    snake = [
        { x: 270, y: 300},
        { x: 300, y: 300}
    ]

    food.x = randomPosition()
    food.y = randomPosition()
    food.color = randomColor()

    gameIsOver = false

    speed = 150
    clearTimeout(loopId)
    gameLoop()
})

buttonHard.addEventListener('click', () => {
    score.innerText = '00'
    menu.style.display = 'none'
    canvas.style.filter = 'none'

    snake = [
        { x: 270, y: 300},
        { x: 300, y: 300}
    ]

    food.x = randomPosition()
    food.y = randomPosition()
    food.color = randomColor()

    gameIsOver = false

    speed = 70
    clearTimeout(loopId); // Garanta que não há nenhum outro loop rodando
    gameLoop()
})