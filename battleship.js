const express = require('express');
const router = express.Router();
const path = require('path');
const session = require('express-session');

router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Route for getting the start page of the game
router.get('/', (req, res) => {
    // Send the form asking for the player's name
    const filePath = path.join(__dirname, '/connect_pages/battleship_form.html');
    res.sendFile(filePath);
});

router.post('/', (req, res) => {
    let username = req.body.name;
    let move = req.body.move; 
    let playAgain = req.body.playAgain;

    if (playAgain) {
        req.session.game = {
            username: req.session.game.username, // Retain existing username or default to 'Player'
            board: initializeBoard(5, 7),
            ships: placeShips(),
            movesLeft: Math.ceil(5 * 7 * 0.60),
            gameOver: false
        };
    }

    if (!req.session.game) {
        req.session.game = {
            username: username, 
            board: initializeBoard(5, 7),
            ships: placeShips(), 
            movesLeft: Math.ceil(5 * 7 * 0.60),
            gameOver: false
        };
    }

    if (move) {
        let [row, column] = move.split(',').map(Number);
        if (row >= 0 && row < 5 && column >= 0 && column < 7) {
            if(updateGameState(req.session.game.board, req.session.game.ships, row, column)) {
            	req.session.game.movesLeft--;
	    }
            if (areAllShipsSunk(req.session.game.ships, req.session.game.board)) {
                req.session.game.gameOver = true;
                req.session.game.win = true; 
            } else if (req.session.game.movesLeft <= 0) {
                req.session.game.gameOver = true;
                req.session.game.win = false; 
            }
        }
    }

    let gameOverMessage = '';
    if (req.session.game.gameOver) {
        gameOverMessage = req.session.game.win ? 'You win! You won!' : 'You lose!';
    }

    // Render the updated game board and send it as the response
    let boardHtml = renderBoard(req.session.game.board, req.session.game.gameOver);
    let currentTime = new Date().toLocaleTimeString();
    res.send(`
        <html>
        <head>
            <title>Battleship Game</title>
            <link rel="stylesheet" href="/css/battleship.css">
        </head>
        <body>
            <h1>Hello ${req.session.game.username}</h1>
            <p>Current time: ${currentTime}</p>
            <p>Moves left: ${req.session.game.movesLeft}</p>
            ${boardHtml}
        ${gameOverMessage}
	    ${req.session.game.gameOver ? `
                <form action="/battleship.php" method="POST">
                    <button type="submit" name="playAgain" value="true">Play Again</button>
                    <input type="hidden" name="name" value="${req.session.game.username}">
                </form>` : ''}
	</body>	
	</html>
    `);
});

// Function to initialize the battleship game board
function initializeBoard(rows, columns) {
    let board = Array(rows).fill().map(() => Array(columns).fill('?'));
    return board;
}

// Function to check if a move hits a ship
function checkHit(ships, row, column) {
    for (let ship of ships) {
        for (let i = 0; i < ship.size; i++) {
            let shipRow = ship.orientation === 0 ? ship.row : ship.row + i;
            let shipCol = ship.orientation === 0 ? ship.col + i : ship.col;

            if (row === shipRow && column === shipCol) {
                return true; 
            }
        }
    }
    return false; 
}

// Function to update the game state after a move
function updateGameState(board, ships, row, column) {
    if (board[row][column] === '?') {
	if (checkHit(ships, row, column)) {
        	board[row][column] = 'X'; 
    	} else {
        	board[row][column] = 'O'; 
    	}
	return true;
    }
    return false;
}


// Function to render the game board as HTML
function renderBoard(board, gameOver) {
    let html = '<form action="/battleship.php" method="POST" class="battleship-grid" enctype="multipart/form-data">';
    board.forEach((row, rowIndex) => {
        html += '<div class="battleship-row">';
        row.forEach((cell, colIndex) => {
            if (!gameOver) {
                // If the game is not over, render buttons as normal
                html += `<button type="submit" name="move" value="${rowIndex},${colIndex}" class="battleship-cell">${cell}</button>`;
            } else {
                // If the game is over, render non-clickable buttons or divs
                html += `<div class="battleship-cell">${''}</div>`; // Empty cell
            }
        });
        html += '</div>';
    });
    html += '</form>';
    return html;
}

function placeShips() {
    const shipSizes = [2, 3, 4]; // Sizes of the ships
    let ships = [];

    for (let size of shipSizes) {
        let placed = false;
        while (!placed) {
            // Randomly choose orientation (0 for horizontal, 1 for vertical)
            let orientation = Math.floor(Math.random() * 2);
            let row, col;

            if (orientation === 0) { // Horizontal
                row = Math.floor(Math.random() * 5);
                col = Math.floor(Math.random() * (7 - size)); // Adjust for ship size
            } else { // Vertical
                row = Math.floor(Math.random() * (5 - size)); // Adjust for ship size
                col = Math.floor(Math.random() * 7);
            }

            // Check if this position overlaps with existing ships
            let overlap = ships.some(ship => {
                for (let i = 0; i < ship.size; i++) {
                    let shipRow = ship.orientation === 0 ? ship.row : ship.row + i;
                    let shipCol = ship.orientation === 0 ? ship.col + i : ship.col;
                    if ((orientation === 0 && row === shipRow && col <= shipCol && col + size > shipCol) ||
                        (orientation === 1 && col === shipCol && row <= shipRow && row + size > shipRow)) {
                        return true;
                    }
                }
                return false;
            });

            if (!overlap) {
                ships.push({ row, col, size, orientation });
                placed = true;
            }
        }
    }
    ships = [
        {row: 1, col: 0, size: 2, orientation: 0},
        {row: 2, col: 0, size: 3, orientation: 0},
        {row: 3, col: 0, size: 4, orientation: 0},
    ]
    return ships;
}

// Function to check if all ships are sunk
function areAllShipsSunk(ships, board) {
    return ships.every(ship => {
        for (let i = 0; i < ship.size; i++) {
            let shipRow = ship.orientation === 0 ? ship.row : ship.row + i;
            let shipCol = ship.orientation === 0 ? ship.col + i : ship.col;
            if (board[shipRow][shipCol] !== 'X') {
                return false; 
            }
        }
        return true; 
    });
}

module.exports = router;
