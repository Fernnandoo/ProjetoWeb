let canvas;
let ctx;
let gBArrayHeight = 20; // Número de elementos no array da altura
let gBArrayWidth = 12; // Número de elementos no array da largura
let startX = 4; // Posição inicial das peças no eixo X
let startY = 0; // Posição inicial das peças no eixo Y
let score = 0; // Pontuação
let level = 1; // Dificuldade
let winOrLose = "Playing";

let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0)); // Array para desenhar o espaço do jogo no canvas
 
let curTetromino = [[1,0], [0,1], [1,1], [2,1]];
 
// Array que comporta todas as peças
let tetrominos = [];
// 3. The tetromino array with the colors matched to the tetrominos array

// Função para gerar um número inteiro aleatório com valores máximos e mínimos definidos
function randomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

// Função para criar uma cor rgb aleatória usando combinações de números aleatórios
function randomColor() {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

// Array de cores das peças
let tetrominoColors = ['purple','cyan','blue','yellow','orange','green','red'];

// Cria um novo array de cores com cores aleatórias
function generateRandomColors() {
    return Array.from({ length: tetrominoColors.length }, () => randomColor())
}

// Recebe a cor atual das peças
tetrominoColors = generateRandomColors()

let curTetrominoColor;
 
// Array do tabuleiro para saber onde as peças estão
let gameBoardArray = [...Array(20)].map(e => Array(12).fill(0));
 
// Array para armazenar as peças ja paradas e suas cores
let stoppedShapeArray = [...Array(20)].map(e => Array(12).fill(0));
 
let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};
let direction;
 
class Coordinates{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
 
// Executa o canvas quando a página carrega
document.addEventListener('DOMContentLoaded', SetupCanvas); 
 
// Array com as coordenadas dos quadrados do tabuleiro
// [0,0] X: 11 Y: 9, [1,0] X: 34 Y: 9, ...
function CreateCoordArray(){
    let i = 0, j = 0;
    for(let y = 9; y <= 446; y += 23) {
        // 12 * 23 = 276 - 12 = 264 Max X value
        for(let x = 11; x <= 264; x += 23) {
            coordinateArray[i][j] = new Coordinates(x,y);
            i++;
        }
        j++;
        i = 0;
    }
}
 
function SetupCanvas(){
    canvas = document.querySelector('canvas')
    ctx = canvas.getContext('2d');
    canvas.width = 936;
    canvas.height = 956;
 
    // Duplica o tamanho dos elementos no eixo X e Y para se ajustarem a tela
    ctx.scale(2, 2);
 
    // Preenche o fundo do canvas
    ctx.fillStyle = '#191919';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenha o retângulo do tabuleiro
    ctx.strokeStyle = '#303030';
    ctx.strokeRect(8, 8, 280, 462);

    // Logo do tetris
    tetrisLogo = new Image(161, 54);
    tetrisLogo.onload = DrawTetrisLogo;
    tetrisLogo.src = "./assets/tetrislogo.png";
 
    // Desenha e aplica fonte no texto da pontuação
    ctx.fillStyle = '#e5e5e5';
    ctx.font = '21px Arial';
    ctx.fillText("SCORE", 300, 98);
 
    // Desenha o retângulo da pontuação
    ctx.strokeRect(300, 107, 161, 24);
 
    // Desenha o valor da pontuação
    ctx.fillText(score.toString(), 310, 127);
    
    // Desenha o texto da dificuldade
    ctx.fillText("LEVEL", 300, 157);
 
    // Desenha o retângulo da dificuldade
    ctx.strokeRect(300, 171, 161, 24);
 
    // Desenha o valor da dificuldade
    ctx.fillText(level.toString(), 310, 190);
 
    ctx.fillText("WIN / LOSE", 300, 221);
 
    // Desenha o estado de jogo atual
    ctx.fillText(winOrLose, 310, 261);
 
    // Desenha o retângulo do estado de jogo
    ctx.strokeRect(300, 232, 161, 95);
    
    // Desenha o retângulo dos controles
    ctx.strokeRect(300, 366, 161, 104);

    // Desenha os textos dos controles
    ctx.fillText("CONTROLES", 300, 354);
 
    ctx.font = '19px Arial';
    ctx.fillText("A : Esquerda", 310, 388);
    ctx.fillText("D : Direita", 310, 413);
    ctx.fillText("S : Baixo", 310, 438);
    ctx.fillText("E : Rotacionar", 310, 463);
 
    // Evento de ativação de tecla
    document.addEventListener('keydown', HandleKeyPress);
 
    // Função que cria um array com arrays correspondentes as peças
    CreateTetrominos();
    
    // Gera uma peça aleatória
    CreateTetromino();
 
    CreateCoordArray();
 
    DrawTetromino();
}
 
function DrawTetrisLogo(){
    ctx.drawImage(tetrisLogo, 300, 8, 161, 54);
}
 
function DrawTetromino(){
    // Percorre todas as coordenadas X e Y da peça 
    for(let i = 0; i < curTetromino.length; i++){
 
        // Ajusta os valores X e Y da peça para que ela apareça no meio do tabuleiro
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
 
        // Coloca a peça no array do tabuleiro
        gameBoardArray[x][y] = 1;
 
        // Busca pelos valores de X e Y no array
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
 
        // Desenha um quadrado nas posições X e Y
        ctx.fillStyle = curTetrominoColor;
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}
 
/*  Move e deleta a peça antiga
Toda vez que uma tecla é pressionada, 
é alterado o valor X ou Y para onde a nova peça deverá ser desenhada.
Também é excluída a forma antiga e desenhada uma nova */
function HandleKeyPress(key){
    if(winOrLose != "Game Over"){
    // código para as teclas 'A' e 'ArrowLeft'
    if(key.keyCode === 65 || key.keyCode === 37){
        // Verifica se vai colidir com a parede ou outra peça
        direction = DIRECTION.LEFT;
        if(!HittingTheWall() && !CheckForHorizontalCollision()){
            DeleteTetromino();
            startX--;
            DrawTetromino();
        } 
 
    // Código para as teclas 'D' e 'ArrowRight'
    } else if(key.keyCode === 68 || key.keyCode === 39){
        // Verifica se vai colidir com a parede ou outra peça
        direction = DIRECTION.RIGHT;
        if(!HittingTheWall() && !CheckForHorizontalCollision()){
            DeleteTetromino();
            startX++;
            DrawTetromino();
        }
 
    // Código para as teclas 'S' e 'ArrowDown'
    } else if(key.keyCode === 83 || key.keyCode === 40){
        MoveTetrominoDown();
        // Código para a tecla 'E'
    } else if(key.keyCode === 69 || key.keyCode === 38){
        RotateTetromino();
    }
    } 
}
 
function MoveTetrominoDown(){
    direction = DIRECTION.DOWN;
 
    // Verifica se vai colidir verticalmente
    if(!CheckForVerticalCollison()){
        DeleteTetromino();
        startY++;
        DrawTetromino();
    }
}
 
// Automaticamente faz com que a peça caia a cada segundo
 
window.setInterval(function(){
    if(winOrLose != "Game Over"){
        MoveTetrominoDown();
    }
  }, 1000);
 
 
// Limpa a peça desenhada anteriormente
function DeleteTetromino(){
    for(let i = 0; i < curTetromino.length; i++){
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
 
        // Apaga o quadrado da peça, do array do tabuleiro
        gameBoardArray[x][y] = 0;
 
        // Desenha na cor do fundo, onde os quadrados coloridos estavam
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = '#191919';
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}
 
// Responsável por todas as peças
function CreateTetrominos(){
    // Inserir T 
    tetrominos.push([[1,0], [0,1], [1,1], [2,1]]);
    // Inserir I
    tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
    // Inserir J
    tetrominos.push([[0,0], [0,1], [1,1], [2,1]]);
    // Inserir Quadrado
    tetrominos.push([[0,0], [1,0], [0,1], [1,1]]);
    // Inserir L
    tetrominos.push([[2,0], [0,1], [1,1], [2,1]]);
    // Inserir S
    tetrominos.push([[1,0], [2,0], [0,1], [1,1]]);
    // Inserir Z
    tetrominos.push([[0,0], [1,0], [1,1], [2,1]]);
}
 
function CreateTetromino(){
    // Pega aleatoriamente uma peça dentre as anteriores
    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    // Define a peça a ser desenhada
    curTetromino = tetrominos[randomTetromino];
    // Define a cor para essa peça
    curTetrominoColor = tetrominoColors[randomTetromino];
}
 
/* Verifica se a peça colidiu com a parede, 
checando se a nova posição da peça a ser desenhada estará fora dos limites do tabuleiro */
function HittingTheWall(){
    for(let i = 0; i < curTetromino.length; i++){
        let newX = curTetromino[i][0] + startX;
        if(newX <= 0 && direction === DIRECTION.LEFT){
            return true;
        } else if(newX >= 11 && direction === DIRECTION.RIGHT){
            return true;
        }  
    }
    return false;
}
 
// Verifica se a peça colidiu verticalmente
function CheckForVerticalCollison(){
    // Cria uma cópia da peça verdadeira para verificar possíveis colisões antes de mover a peça de fato
    let tetrominoCopy = curTetromino;

    let collision = false;
 
    // Percorre todos os quadrados da peça
    for(let i = 0; i < tetrominoCopy.length; i++){
        // Pega cada quadrado da peça
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;
 
        // Se estiver movendo para baixo, incrementa o Y para verificar uma possível colisão
        if(direction === DIRECTION.DOWN){
            y++;
        }
 
        // Verifica se vai colidir com uma peça que já está parada
        if(typeof stoppedShapeArray[x][y+1] === 'string'){
            // Se sim, deleta a peça
            DeleteTetromino();
            // Incrementa para colocar a peça no lugar e desenhar
            startY++;
            DrawTetromino();
            collision = true;
            break;
        }
        // Se Y for maior que 20, há uma colisão, pois este é o limite do tabuleiro
        if(y >= 20){
            collision = true;
            break;
        }
    }
    if(collision){
        // Verifica se o jogo acabou, se sim, altera o estado atual para Game Over
        if(startY <= 2){
            winOrLose = "Game Over";
            ctx.fillStyle = '#191919';
            ctx.fillRect(310, 242, 140, 30);
            ctx.fillStyle = '#e5e5e5';
            ctx.fillText(winOrLose, 310, 261);
        } else {
            // Adiciona a peça ao array de peças paradas para verificar futuras colisões
            for(let i = 0; i < tetrominoCopy.length; i++){
                let square = tetrominoCopy[i];
                let x = square[0] + startX;
                let y = square[1] + startY;
                // Adiciona a cor atual da peça
                stoppedShapeArray[x][y] = curTetrominoColor;
            }
 
            // Verifica se há linhas completas
            CheckForCompletedRows();
 
            // Cria e desenha a próxima peça, resetando sua direção
            CreateTetromino();
            direction = DIRECTION.IDLE;
            startX = 4;
            startY = 0;
            DrawTetromino();
        }
 
    }
}
 
// Verifica colisões horizontais utilizando uma lógica semelhante a das colisões verticais
function CheckForHorizontalCollision(){
    var tetrominoCopy = curTetromino;
    var collision = false;
 
    for(var i = 0; i < tetrominoCopy.length; i++)
    {
        var square = tetrominoCopy[i];
        var x = square[0] + startX;
        var y = square[1] + startY;
 
        if (direction == DIRECTION.LEFT){
            x--;
        }else if (direction == DIRECTION.RIGHT){
            x++;
        }
 
        var stoppedShapeVal = stoppedShapeArray[x][y];
 
        if (typeof stoppedShapeVal === 'string')
        {
            collision=true;
            break;
        }
    }
 
    return collision;
}
 
// Verifica se as linhas estão completas
function CheckForCompletedRows(){
 
    // Quantas linhas devem ser deletadas e onde começar a exclusão
    let rowsToDelete = 0;
    let startOfDeletion = 0;
 
    // Verifica dada linha para ver se ela está completa
    for (let y = 0; y < gBArrayHeight; y++)
    {
        let completed = true;
        // Percorre todo valor de X
        for(let x = 0; x < gBArrayWidth; x++)
        {
            // Obtem os valores do array de peças paradas
            let square = stoppedShapeArray[x][y];
 
            // Verifica se não há nada lá
            if (square === 0 || (typeof square === 'undefined'))
            {
                // Se não houver nada, sairá do loop
                completed = false;
                break;
            }
        }
 
        // Se uma linha for completada
        if (completed)
        {
            // Desloca as linhas para baixo
            if(startOfDeletion === 0) startOfDeletion = y;
            rowsToDelete++;
 
            // Exclui a linha
            for(let i = 0; i < gBArrayWidth; i++)
            {
                // Atualiza os arrays, excluindo os quadrados anteriores
                stoppedShapeArray[i][y] = 0;
                gameBoardArray[i][y] = 0;

                // Procura o valor de X e Y no array de coordenadas
                let coorX = coordinateArray[i][y].x;
                let coorY = coordinateArray[i][y].y;

                // Dsenha o quadrado com a cor do fundo
                ctx.fillStyle = '#191919';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
    if(rowsToDelete > 0){
        score += 10;
        ctx.fillStyle = '#191919';
        ctx.fillRect(310, 109, 140, 19);
        ctx.fillStyle = '#e5e5e5';
        ctx.fillText(score.toString(), 310, 127);
        MoveAllRowsDown(rowsToDelete, startOfDeletion);
    }
}
 
// Move as linhas para baixo após deletar uma linha
function MoveAllRowsDown(rowsToDelete, startOfDeletion){
    for (var i = startOfDeletion-1; i >= 0; i--)
    {
        for(var x = 0; x < gBArrayWidth; x++)
        {
            var y2 = i + rowsToDelete;
            var square = stoppedShapeArray[x][i];
            var nextSquare = stoppedShapeArray[x][y2];
 
            if (typeof square === 'string')
            {
                nextSquare = square;
                gameBoardArray[x][y2] = 1; // Coloca o bloco no array do tabuleiro
                stoppedShapeArray[x][y2] = square; // Desenha a cor no array de peças paradas
 
                // Procura o valor de X e Y no array de coordenadas
                let coorX = coordinateArray[x][y2].x;
                let coorY = coordinateArray[x][y2].y;
                ctx.fillStyle = nextSquare;
                ctx.fillRect(coorX, coorY, 21, 21);
 
                square = 0;
                gameBoardArray[x][i] = 0; // Limpa o local no array do tabuleiro
                stoppedShapeArray[x][i] = 0; // limpa o local no array de peças paradas
                coorX = coordinateArray[x][i].x;
                coorY = coordinateArray[x][i].y;
                ctx.fillStyle = '#191919';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}
 
// Rotacionar a peça
function RotateTetromino()
{
    let newRotation = new Array();
    let tetrominoCopy = curTetromino;
    let curTetrominoBU;
 
    for(let i = 0; i < tetrominoCopy.length; i++)
    {
        curTetrominoBU = [...curTetromino];
 
        /* Encontra o novo valor X do último quadrado da peça,
        em seguida, os outros quadrados são orientados com base nele */
        let x = tetrominoCopy[i][0];
        let y = tetrominoCopy[i][1];
        let newX = (GetLastSquareX() - y);
        let newY = x;
        newRotation.push([newX, newY]);
    }
    DeleteTetromino();
 
    // Tenta desenhar a nova peça rotacionada
    try{
        curTetromino = newRotation;
        DrawTetromino();
    }  
    // Se não funcionar, pegará a peça de backup e desenhará ela
    catch (e){ 
        if(e instanceof TypeError) {
            curTetromino = curTetrominoBU;
            DeleteTetromino();
            DrawTetromino();
        }
    }
}
 
// Pega o valor de X do ultimo quadrado da peça para que possa orientar os outros quadrados com base nele
function GetLastSquareX()
{
    let lastX = 0;
     for(let i = 0; i < curTetromino.length; i++)
    {
        let square = curTetromino[i];
        if (square[0] > lastX)
            lastX = square[0];
    }
    return lastX;
}