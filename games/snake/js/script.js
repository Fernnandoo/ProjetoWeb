const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const size = 30;

const snake = [
    { x: 200, y: 200 },
    { x: 230, y: 200 },
]

let direction, loopId

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
        snake.push({ x: head.x, y: head.y + size})
    }

    snake.shift()
}

const gameLoop = () => {
    clearInterval(loopId)
    ctx.clearRect(0, 0, 600, 600)

    drawSnake()
    moveSnake()

    loopId = setTimeout(() => {
        gameLoop()
    }, 300)
}

gameLoop()

document.addEventListener("keydown", ({ key }) => {
    if (key == "ArrowRight" && direction != 'left') {
        direction = "right"
    }
    if (key == "ArrowLeft" && direction != 'right') {
        direction = "left"
    }
    if (key == "ArrowUp") {
        direction = "right"
    }
    if (key == "ArrowDown") {
        direction = "down"
    }
})

// https://www.youtube.com/watch?v=LyWSsZktVOg