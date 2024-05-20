const canvas = document.querySelector('canvas') // Elemento canvas retirado do html
const ctx = canvas.getContext('2d') // Contexto dos elementos no canvas

// Elementos retirados do html
const score = document.querySelector('.score-value')
const finalScore = document.querySelector('.final-score > span')
const menu = document.querySelector('.menu')
const buttonPlay = document.querySelector('.btn-play')
const buttonHard = document.querySelector('.btn-hard')

// Aúdios
const food_audio = new Audio('./assets/audio.mp3')
const move_audio = new Audio('./assets/move.mp3')
const gameover_audio = new Audio('./assets/gameover.mp3')

const size = 30; // Tamanho para cada célula

let speed = 150 // Velocidade de movimento
let gameIsOver = false // Variável de controle de estado, falso por padrão
// Posição inicial da cobra
let snake = [
    { x: 270, y: 300 },
    { x: 300, y: 300 }
]

// Função para incrementar a pontuação
const incrementScore = () => {
    score.innerText = parseInt(score.innerText) + 10
}

// Função para gerar um número inteiro aleatório, com valores mínimos e máximos
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

// Função para randomizar posições X e Y
const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / size) * size
}

// Função para gerar uma cor rgb aleatória
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


// Desenha a comida
const drawFood = () => {
    const { x, y, color } = food

    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}

// Desenha a cobra
const drawSnake = () => {
    ctx.fillStyle = '#c5c5c5'

    // Obtem a posição da cabeça e a colore com uma cor diferente
    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = '#e5e5e5'
        }

        ctx.fillRect(position.x, position.y, size, size) // Desenha a cobra de fato
    })
}

// Função responsável pela movimentação da cobra
const moveSnake = () => {
    // Para evitar processamento desnecessário, a função é encerrada caso nenhuma direção seja acionada
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

// Desenha os quadrados do tabuleiro
const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = '#191919'

    // Percorre todo o tamanho do canvas, desenhando uma linha a cada 30px
    for (i = size; i < canvas.width; i += size) {
        // Desenha as linhas horizontais
        ctx.beginPath() // Define que o caminho deve ser recomeçado, para evitar conflitos com o loop
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        // Desenha as linhas verticais
        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }

}

// Verifica se a cobra passou pelo espaço em que a comida estava
const checkEat = () => {
    const head = snake[snake.length - 1]

    // Verifica se as posições da cabeça e da comida são equivalentes
    if (head.x == food.x && head.y == food.y) {
        snake.push(head)
        incrementScore()
        food_audio.play()

        let x = randomPosition()
        let y = randomPosition()

        // Garante que a nova comida não apareça em uma posição em que a cobra já está
        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        // Gera novos valores para a comida que será gerada a seguir
        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

// Verifica se houve uma colisão
const checkCollision = () => {
    const head = snake[snake.length - 1]
    const neckIndex = snake.length - 2 // Necessário para evitar conflitos com o array como um todo
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

// Encerra o movimento e exibe menu de game over
const gameOver = () => {
    direction = undefined

    menu.style.display = 'flex'
    finalScore.innerText = score.innerText
    canvas.style.filter = 'blur(5px)'
}

// Chama as demais funções e faz um loop que garante o funcionamento do jogo
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

document.addEventListener('touchstart', (event) => {
    var initialX = event.touches[0].clientX
    var initialY = event.touches[0].clientY

    document.addEventListener('touchmove', (event) => {
        var touchX = event.touches[0].clientX
        var touchY = event.touches[0].clientY
    
        if (touchX > initialX || direction != "left") {
            direction = "right"
        }
        if (touchX < initialX || direction != "right") {
            direction = "left"
        }
        // if (touchY < initialY || direction != "down") {
        //     direction = "up"
        // }
        // if (touchY > initialY || direction != "up") {
        //     direction = "down"
        // }
    })
})


// Eventos de tecla que afetam a direção de movimento
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

// Evento de click para recomeçar o jogo
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

// Evento de click para recomeçar o jogo, dessa vez em uma dificuldade maior
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
    clearTimeout(loopId);
    gameLoop()
})