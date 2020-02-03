'use strict'

// Pieces Types
var KING_WHITE = '♔';
var QUEEN_WHITE = '♕';
var ROOK_WHITE = '♖';
var BISHOP_WHITE = '♗';
var KNIGHT_WHITE = '♘';
var PAWN_WHITE = '♙';
var KING_BLACK = '♚';
var QUEEN_BLACK = '♛';
var ROOK_BLACK = '♜';
var BISHOP_BLACK = '♝';
var KNIGHT_BLACK = '♞';
var PAWN_BLACK = '♟';

var isWhiteTurn = true;
// The Chess Board
var gBoard;
var gSelectedElCell = null;

function restartGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < 8; i++) {
        board[i] = [];
        for (var j = 0; j < 8; j++) {
            var piece = ''
            if (i === 1) piece = PAWN_BLACK;
            if (i === 6) piece = PAWN_WHITE;
            board[i][j] = piece;
        }
    }

    board[0][0] = board[0][7] = ROOK_BLACK;
    board[0][1] = board[0][6] = KNIGHT_BLACK;
    board[0][2] = board[0][5] = BISHOP_BLACK;
    board[0][3] = QUEEN_BLACK;
    board[0][4] = KING_BLACK;

    board[7][0] = board[7][7] = ROOK_WHITE;
    board[7][1] = board[7][6] = KNIGHT_WHITE;
    board[7][2] = board[7][5] = BISHOP_WHITE;
    board[7][3] = QUEEN_WHITE;
    board[7][4] = KING_WHITE;

    // TODO: build the board 8 * 8
    console.table(board);
    return board;

}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            // TODO: figure class name
            var className = ((i + j) % 2 === 0) ? 'white' : 'black';
            var tdId = `cell-${i}-${j}`;

            strHtml += `<td id="${tdId}" class="${className}" onclick="cellClicked(this)">
                            ${cell}
                        </td>`
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHtml;
}


function cellClicked(elCell) {



    // TODO: if the target is marked - move the piece!
    if (elCell.classList.contains('mark')) {
        console.log('AHA');
        movePiece(gSelectedElCell, elCell);
        cleanBoard();
        return;
    }

    cleanBoard();

    elCell.classList.add('selected');
    gSelectedElCell = elCell;

    // console.log('elCell.id: ', elCell.id);
    var cellCoord = getCellCoord(elCell.id);
    var piece = gBoard[cellCoord.i][cellCoord.j];

    if (isWhiteTurn && (piece === ROOK_BLACK ||
            piece === BISHOP_BLACK ||
            piece === KNIGHT_BLACK ||
            piece === QUEEN_BLACK ||
            piece === KING_BLACK ||
            piece === PAWN_BLACK)) return;
    if (!isWhiteTurn && (piece === ROOK_WHITE ||
            piece === BISHOP_WHITE ||
            piece === KNIGHT_WHITE ||
            piece === QUEEN_WHITE ||
            piece === KING_WHITE ||
            piece === PAWN_WHITE)) return;

    var possibleCoords = [];
    switch (piece) {
        case ROOK_BLACK:
        case ROOK_WHITE:
            possibleCoords = getAllPossibleCoordsRook(cellCoord);
            break;
        case BISHOP_BLACK:
        case BISHOP_WHITE:
            possibleCoords = getAllPossibleCoordsBishop(cellCoord);
            break;
        case KNIGHT_BLACK:
        case KNIGHT_WHITE:
            possibleCoords = getAllPossibleCoordsKnight(cellCoord);
            break;
        case QUEEN_BLACK:
        case QUEEN_WHITE:
            possibleCoords = getAllPossibleCoordsQueen(cellCoord);
            break;
        case KING_BLACK:
        case KING_WHITE:
            possibleCoords = getAllPossibleCoordsKing(cellCoord);
            break;
        case PAWN_BLACK:
        case PAWN_WHITE:
            possibleCoords = getAllPossibleCoordsPawn(cellCoord, piece === PAWN_WHITE);
            break;

    }
    markCells(possibleCoords);
}

function movePiece(elFromCell, elToCell) {

    var fromCoord = getCellCoord(elFromCell.id);
    var toCoord = getCellCoord(elToCell.id);

    // update the MODEl
    var piece = gBoard[fromCoord.i][fromCoord.j];
    var enemyPiece = gBoard[toCoord.i][toCoord.j];
    gBoard[fromCoord.i][fromCoord.j] = '';
    gBoard[toCoord.i][toCoord.j] = piece;
    // update the DOM
    elFromCell.innerText = '';
    elToCell.innerText = piece;
    isWhiteTurn = !isWhiteTurn;
    if (enemyPiece === KING_WHITE) {
        var elMat = document.querySelector('.game-board');
        elMat.innerHTML = ``;
        var elH1 = document.querySelector('h1');
        elH1.innerText = `Black Wins`;
    }
    if (enemyPiece === KING_BLACK) {
        var elMat = document.querySelector('.game-board');
        elMat.innerHTML = ``;
        var elH1 = document.querySelector('h1');
        elH1.innerText = `White Wins`;
    }
}

function markCells(coords) {
    for (var i = 0; i < coords.length; i++) {
        var coord = coords[i];
        var elCell = document.querySelector(`#cell-${coord.i}-${coord.j}`);
        elCell.classList.add('mark')
    }
}

// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}

function cleanBoard() {
    var elTds = document.querySelectorAll('.mark, .selected');
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].classList.remove('mark', 'selected');
    }
}

function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j
}

function isEmptyCell(coord) {
    return gBoard[coord.i][coord.j] === ''
}

function isEating(arr, coord) {
    var piece = gBoard[coord.i][coord.j];
    coord.eat = true;
    if (!isWhiteTurn && (piece === ROOK_WHITE ||
            piece === BISHOP_WHITE ||
            piece === KNIGHT_WHITE ||
            piece === QUEEN_WHITE ||
            piece === KING_WHITE ||
            piece === PAWN_WHITE)) arr.push(coord);
    if (isWhiteTurn && (piece === ROOK_BLACK ||
            piece === BISHOP_BLACK ||
            piece === KNIGHT_BLACK ||
            piece === QUEEN_BLACK ||
            piece === KING_BLACK ||
            piece === PAWN_BLACK)) arr.push(coord);
    return true;
}

function getAllPossibleCoordsPawn(pieceCoord, isWhite) {
    var res = [];

    var diff = (isWhite) ? -1 : 1;
    var nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
    if (isEmptyCell(nextCoord)) res.push(nextCoord);

    nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j + 1 };
    isEating(res, nextCoord);
    nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j - 1 };
    isEating(res, nextCoord);
    if ((pieceCoord.i === 1 && !isWhite) || (pieceCoord.i === 6 && isWhite)) {
        diff *= 2;
        nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
        if (isEmptyCell(nextCoord)) res.push(nextCoord);
    }
    return res;
}



function getAllPossibleCoordsKing(pieceCoord) {
    var res = [];
    var iStart = pieceCoord.i - 1;
    var iEnd = pieceCoord.i + 1;
    var jStart = pieceCoord.j - 1;
    var jEnd = pieceCoord.j + 1;
    for (var i = iStart; i <= iEnd; i++) {
        for (var j = jStart; j <= jEnd; j++) {
            if (i >= 0 && i < 8 && j >= 0 && j < 8 && (!(i === pieceCoord.i && j === pieceCoord.j))) {
                var coord = { i: i, j: j };
                if (!isEmptyCell(coord) && isEating(res, coord)) continue;
                res.push(coord);
            }
        }
    }
    return res;
}

function getAllPossibleCoordsQueen(pieceCoord) {
    var res = [];
    res.push(...getAllPossibleCoordsRook(pieceCoord));
    res.push(...getAllPossibleCoordsBishop(pieceCoord));
    return res;
}

function getAllPossibleCoordsRook(pieceCoord) {
    var res = [];
    var i = pieceCoord.i;
    for (var j = pieceCoord.j - 1; j >= 0; j--) {
        if (!addResCorr(res, i, j)) break;
    }
    for (var j = pieceCoord.j + 1; j < 8; j++) {
        if (!addResCorr(res, i, j)) break;
    }
    var j = pieceCoord.j;
    for (var i = pieceCoord.i - 1; i >= 0; i--) {
        if (!addResCorr(res, i, j)) break;
    }
    for (var i = pieceCoord.i + 1; i < 8; i++) {
        if (!addResCorr(res, i, j)) break;
    }

    return res;
}

function getAllPossibleCoordsBishop(pieceCoord) {
    var res = [];
    var i = pieceCoord.i - 1;
    for (var idx = pieceCoord.j + 1; i >= 0 && idx < 8; idx++) {
        if (!addResCorr(res, i--, idx)) break;
    }
    i = pieceCoord.i + 1;
    for (var idx = pieceCoord.j + 1; i < 8 && idx < 8; idx++) {
        if (!addResCorr(res, i++, idx)) break;
    }
    i = pieceCoord.i - 1;
    for (var idx = pieceCoord.j - 1; i >= 0 && idx < 8; idx--) {
        if (!addResCorr(res, i--, idx)) break;
    }
    i = pieceCoord.i + 1;
    for (var idx = pieceCoord.j - 1; i < 8 && idx < 8; idx--) {
        if (!addResCorr(res, i++, idx)) break;
    }
    return res;
}

function addResCorr(arr, i, j) {
    var coord = { i: i, j: j };
    if (!isEmptyCell(coord) && isEating(arr, coord)) return false;
    arr.push(coord);
    return true;
}

function getAllPossibleCoordsKnight(pieceCoord) {

    var coordTest = [];
    for (var i = pieceCoord.i - 1; i <= pieceCoord.i + 1; i++) {
        for (var j = pieceCoord.j - 1; j <= pieceCoord.j + 1; j++) {
            if (i !== pieceCoord.i && j !== pieceCoord.j) {
                if (i + 1 !== pieceCoord.i && j !== pieceCoord.j) coordTest.push({ i: i + 1, j: j });
                if (i - 1 !== pieceCoord.i && j !== pieceCoord.j) coordTest.push({ i: i - 1, j: j });
                if (i !== pieceCoord.i && j + 1 !== pieceCoord.j) coordTest.push({ i: i, j: j + 1 });
                if (i !== pieceCoord.i && j - 1 !== pieceCoord.j) coordTest.push({ i: i, j: j - 1 });
            }
        }
    }

    var res = [];
    for (var i = 0; i < coordTest.length; i++) {
        if (coordTest[i].i < 8 && coordTest[i].i >= 0 && coordTest[i].j < 8 && coordTest[i].j >= 0) {
            if (isEating(res, coordTest[i]) && isEmptyCell(coordTest[i])) {
                res.push(coordTest[i]);
            }
        }
    }
    return res;
}