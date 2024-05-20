const audio_score = new Audio('./assets/score.mp3')
const audio_hit = new Audio('./assets/hit.mp3')
const audio_wall = new Audio('./assets/wall.mp3')

// Variáveis globais de direção
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};
 
var rounds = [5, 5, 3, 3, 2];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6']; // Cores para o fundo do jogo
 
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 7 
        };
    }
};
 
// 'Inteligência artificial' que joga no lado direito
var Ai = {
    new: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 8
        };
    }
};
 
// Função principal que contem a maior parte dos elementos do jogo
var Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
 
        this.canvas.width = 1400;
        this.canvas.height = 1000;
 
        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';
 
        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);
 
        this.ai.speed = 5;
        this.running = this.over = false;
        this.turn = this.ai;
        this.timer = this.round = 0;
        this.color = '#8c52ff';
 
        Pong.menu();
        Pong.listen();
    },
 
    // Função para fim de jogo
    endGameMenu: function (text) {
        Pong.context.font = '45px Courier New';
        Pong.context.fillStyle = this.color;
 
        // Desenha um retangulo atras da mensagem 'Pressione uma tecla para começar'
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );
 
        // Altera a cor do canvas
        Pong.context.fillStyle = '#ffffff';
 
        // Desenha o texto 'Winner' ou 'Game Over'
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );
 
        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },
 
    menu: function () {
        // Desenhas todos objetos de Pong
        Pong.draw();
 
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;
 
        // Desenha um retangulo atras da mensagem 'Pressione uma tecla para começar'
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );
 
        this.context.fillStyle = '#ffffff';
 
        // Desenha a mensagem 'Pressione uma tecla para começar'
        this.context.fillText('Pressione uma tecla para começar',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },
 
    // Atualiza todos os objetos (move o jogador, bot, bola, aumenta a pontuação, etc)
    update: function () {
        if (!this.over) {
             // If the ball collides with the bound limits - correct the x and y coords.

            // Se a bola colidir com os limites estabelecidos, corrija as coordenadas X e Y
            if (this.ball.x <= 0) {
                Pong._resetTurn.call(this, this.ai, this.player);
                audio_score.play()
            }
            if (this.ball.x >= this.canvas.width - this.ball.width) {
                Pong._resetTurn.call(this, this.player, this.ai);
                audio_score.play()
            }
            if (this.ball.y <= 0) {
                this.ball.moveY = DIRECTION.DOWN;
                audio_wall.play()
            }
            if (this.ball.y >= this.canvas.height - this.ball.height) {
                this.ball.moveY = DIRECTION.UP;
                audio_wall.play()
            }
 
            // Se o valor de player.move for atualizado, mova o jogador
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
 
            /* No inicio de um novo turno, mova a bola para a direção correta
               e faça com que o local em que a bola aparece seja aleatório */
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }
 
            // Se o jogador colidir com os limites estabelecidos, corrja a posição X e Y
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
 
            // Mova a bola com base nos valores X e Y
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
 
            // Movimentos de subir e descer do bot
            if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
                else this.ai.y -= this.ai.speed / 4;
            }
            if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
                else this.ai.y += this.ai.speed / 4;
            }
 
            // Lida com a colisão do bot
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
            else if (this.ai.y <= 0) this.ai.y = 0;
 
            // Lida com a colisão do jogador
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                    audio_hit.play()
 
                }
            }
 
            // Lida com a colisão da bola com o bot
            if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                    this.ball.x = (this.ai.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                    audio_hit.play()
 
                }
            }
        }
 
        // Verifica se o jogador venceu o round
        if (this.player.score === rounds[this.round]) {
            // Verifica se há mais rounds restantes, se não houver, exiba a mensagem de vencedor
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(function () { Pong.endGameMenu('Vencedor'); }, 1000);
            } else {
                // Se houver outro round, resete todos os valores e incremente o número do round
                this.color = this._generateRoundColor();
                this.player.score = this.ai.score = 0;
                this.player.speed += 0.5;
                this.ai.speed += 1;
                this.ball.speed += 1;
                this.round += 1;
 
            }
        }
        // Verifica se o bot ganhou o round
        else if (this.ai.score === rounds[this.round]) {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu('Fim de jogo'); }, 1000);
        }
    },
 
    // Desenha os objetos no canva
    draw: function () {
        // Limpa o canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        this.context.fillStyle = this.color;
 
        // Desenha o fundo
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Define o estilo da bola e dos jogadores
        this.context.fillStyle = '#ffffff';
 
        // Desenha o jogador
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
 
        // Desenha o bot
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            this.ai.width,
            this.ai.height 
        );
 
        // Desenha a bola
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
 
        // Desenha a linha do centro
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
 
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';
 
        // Desenha a pontuação do jogador
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );
 
        // Desenha a pontuação do bot
        this.context.fillText(
            this.ai.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );
 
        this.context.font = '30px Courier New';
 
        // Desenha o round
        this.context.fillText(
            'Round ' + (Pong.round + 1),
            (this.canvas.width / 2),
            35
        );
 
        this.context.font = '40px Courier';
 
        // Desenha o valor do round atual
        this.context.fillText(
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width / 2),
            100
        );
    },
 
    loop: function () {
        Pong.update();
        Pong.draw();
 
        // Se o jogo não acabou, desenha o próximo quadro
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },
 
    listen: function () {
        document.addEventListener('keydown', function (key) {
            // Função para iniciar o jogo ao pressionar uma tecla
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }
 
            // Evento de teclas ArrowUp e W
            if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;
 
            // Evento de teclas ArrowDown e S
            if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
        });
 
        // para o movimento do jogador se não houver tecla pressionada
        document.addEventListener('keyup', function (key) { Pong.player.move = DIRECTION.IDLE; });
    },
 
    // Redefine a localização dos elementos e da um pequeno delay antes de começar o próximo round
    _resetTurn: function(victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
 
        victor.score++;
    },
 
    // Delay entre cada turno
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },
 
    // Seleciona uma cor aleatória para o fundo a cada round/level
    _generateRoundColor: function () {
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }
};
 
var Pong = Object.assign({}, Game);
Pong.initialize();