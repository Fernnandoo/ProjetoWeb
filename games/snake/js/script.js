const canvas = document.querySelector('canvas') // Elemento canvas retirado do html
const ctx = canvas.getContext('2d') // Contexto dos elementos no canvas

// Elementos retirados do html
const score = document.querySelector('.score-value')
const finalScore = document.querySelector('.final-score > span')
const bestScore = document.querySelector('.best-score > span')
const menu = document.querySelector('.menu')
const buttonPlay = document.querySelector('.btn-play')
const buttonHard = document.querySelector('.btn-hard')

const size = 30; // Tamanho para cada célula
let speed = 150 // Velocidade de movimento do jogador
let gameIsOver = false // Variável de controle de estado, falso por padrão
// Array com posições da cobra
let snake = [
    { x: 270, y: 300 },
    { x: 300, y: 300 }
]

// Classe de pontuação
class Score {
    scoreValue = parseInt(score.innerText)
    
    // Método que incrementa a pontuação e a aloca em um session storage
    incrementScore() {
        this.scoreValue += 10
        sessionStorage.setItem('score', this.scoreValue)
        score.innerText = sessionStorage.getItem('score') // Exibe o texto da pontuação como sendo o valor alocado no session storage
    }

    // Método que limpa o session storage a cada vez jogada
    resetScore() {
        sessionStorage.clear()
    }
}

// Classe de melhor pontuação, com herança da anterior
class BestScore extends Score {
    bestScoreValue = parseInt(bestScore.innerText)

    // Método que verifica se pontuação é maior que melhor pontuação, se sim, esta última é incrementada e armazenada no local storage
    incrementBestScore() {
        this.scoreValue = parseInt(score.innerText)
        this.bestScoreValue = parseInt(bestScore.innerText)

        if (this.scoreValue > this.bestScoreValue) {
            localStorage.setItem('best', score.innerText)
        }
        bestScore.innerText = localStorage.getItem('best') // Exibe o texto da melhor pontuação como sendo o valor alocado no local storage
    }
}

// Objetos instanciados das classes acima
let checkScore = new Score()
let checkBestScore = new BestScore()


// Função que gera um valor inteiro aleatório com base em parâmetros recebidos
function randomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

// Função que gera uma coordenada exata aleatória utilizando a função randomNumber
function randomPosition() {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / size) * size
}

// Função que gera uma cor rgb aleatória utilizando a função randomNumber
function randomColor() {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    // Concatena as 3 variáveis de cor em uma string para gerar a cor rgb
    return `rgb(${red}, ${green}, ${blue})`
}

// Comida que é gerada em posições aleatórias e com cores aleatórias
const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

// variáveis de controle de direção e loop
let direction, loopId

// Função que desenha a comida
function drawFood() {
    const { x, y, color } = food // Valores da const food declarada anteriormente

    // Específicações de estilo
    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size) // Instruções de onde a comida deve ser desenhada
    ctx.shadowBlur = 0
}

// Função que desenha a cobra a ser controlada pelo jogador
function drawSnake() {
    ctx.fillStyle = '#c5c5c5'

    // laço que percorre todas as posições do array da cobra
    snake.forEach((position, index) => {
        // Se o valor de index for igual ao da última posição do array, pinta este de outra cor, se não for, pinta da cor padrão
        index == snake.length - 1 ? ctx.fillStyle = '#e5e5e5' : ctx.fillStyle = '#c5c5c5'

        // Instruções de onde a cobra deve ser desenhada
        ctx.fillRect(position.x, position.y, size, size)
    })
}

// Função que move a cobra
function moveSnake() {
    // Evita processamento desnecessário
    if (!direction) return

    // Obtem a posição da cabeça no array
    const head = snake[snake.length - 1]

    // Verifica a variável direction e move a cobra de acordo com ela, sempre adicionando um item à última posição do array
    switch (direction) {
        case "right":
            snake.push({ x: head.x + size, y: head.y })
            break
        case "left":
            snake.push({ x: head.x - size, head.y })
            break
        case "up":
            snake.push({ x: head.x, y: head.y - size })
            break
        case "down":
            snake.push({ x: head.x, head.y + size })
            break
    }

    // Remove a primeira posição do array para que a cobra de fato se mova
    snake.shift()
}

// Função que desenha as células no campo de jogo
function drawGrid() {
    // Instruções de estilo
    ctx.lineWidth = 1
    ctx.strokeStyle = '#191919'

    // Laço que incrementa de 30 em 30 até atingir o tamanho total do canvas
    for (i = size; i < canvas.width; i += size) {
        // Desenha as linhas horizontais do campo
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        // Desenha as linhas verticais do campo
        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

// Função que verifica se a cobra passou pela comida
function checkEat() {
    const head = snake[snake.length - 1]

    // Verifica se as posições da cabeça e da comida são as mesmas
    if (head.x == food.x && head.y == food.y) {
        // Aumenta o tamanho da cobra no array
        snake.push(head)
        // Aciona o método que incrementa a pontuação
        checkScore.incrementScore()

        // Define novas posições aleatórias para a comida que será gerada
        let x = randomPosition()
        let y = randomPosition()

        // Garante que a nova comida não surja em uma posição em que a cobra já está
        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        // Define parâmetros da nova comida
        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

// Função que verifica se houve uma colisão
function checkCollision() {
    const head = snake[snake.length - 1]
    // Obtem o valor do pescoço
    const neckIndex = snake.length - 2
    const canvasLimit = canvas.width - size

    // Define o que é uma colisão com a parede
    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    // Define o que é uma colisão com o corpo da própria cobra
    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    // Verifica de fato se houve uma colisão de qualquer tipo
    if (wallCollision || selfCollision) {
        // Verifica se o jogo já está encerrado, se não estiver, encerra
        if (!gameIsOver) {
            gameIsOver = true
            gameOver()
        }
    }
}

// Função que define o fim de jogo
function gameOver() {
    // Para o movimento da cobra
    direction = undefined

    // Exibe o menu de fim de jogo
    menu.style.display = 'flex'
    finalScore.innerText = sessionStorage.getItem('score')
    canvas.style.filter = 'blur(5px)'
}

// Principal função que garante o funcionamento pleno do jogo
function gameLoop() {
    // Evita uso de processamente desnecessário encerrando a função caso o jogo tenha sido encerrado
    if (gameIsOver) return
    // Limpa os intervalos
    clearInterval(loopId)
    // Limpa o campo
    ctx.clearRect(0, 0, 600, 600)

    // Chama as funções principais
    drawGrid()
    drawFood()
    drawSnake()
    moveSnake()
    checkEat()
    checkCollision()
    checkBestScore.incrementBestScore()

    // Loop que garante que está função seja chamada repetidamente
    loopId = setTimeout(gameLoop, speed)
}

gameLoop()

// Evento de teclado que verifica as teclas acionadas e altera o valor de direction de acordo
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
    // Pausa o jogo
    if (key == "Escape") {
        newDirection = undefined
    }

    if (newDirection !== direction) {
        direction = newDirection
    }
})

// Evento de acionamento de botão para reiniciar o jogo
buttonPlay.addEventListener('click', () => {
    // Chamada do método que limpa o session storage de pontuação
    checkScore.resetScore()
    // Redefine a pontuação como string
    score.innerText = '00'
    // Altera o estado de exibição do menu para que ele desapareça
    menu.style.display = 'none'
    canvas.style.filter = 'none'

    // Define nova posição e tamanho da cobra
    snake = [
        { x: 270, y: 300 },
        { x: 300, y: 300 }
    ]

    // Define novos parâmetros para comida
    food.x = randomPosition()
    food.y = randomPosition()
    food.color = randomColor()

    // Altera o estado do jogo
    gameIsOver = false

    speed = 150
    // Limpa o intervalo
    clearTimeout(loopId)
    // Novamente chama a função gameLoop
    gameLoop()
})

// Evento de acionamento de botão para reiniciar o jogo com dificuldade aumentada
buttonHard.addEventListener('click', () => {
    checkScore.resetScore()
    score.innerText = '00'
    menu.style.display = 'none'
    canvas.style.filter = 'none'

    snake = [
        { x: 270, y: 300 },
        { x: 300, y: 300 }
    ]

    food.x = randomPosition()
    food.y = randomPosition()
    food.color = randomColor()

    gameIsOver = false

    // Altera o valor do intervalo, fazendo com que o jogo acelere
    speed = 70
    clearTimeout(loopId);
    gameLoop()
})
