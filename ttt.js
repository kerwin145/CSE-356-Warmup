const express = require('express');
const router = express.Router();
const path = require('path')

router.get('/', (req, res) => {
    let username = req.query.name
    let boardStr = req.query.board

	const filePath = path.join(__dirname, '/ttt_pages/form.html')
	if (username === undefined) {
		res.sendFile(filePath)
		return
	}

	res.setHeader("X-CSE356", process.env.HEADER)
	const page = buildPage(username, boardStr);
	res.send(page)
})

function buildPage(name, boardString) {
	let win = checkWin(boardString);
	let bstr = boardString;
	if (win !== 'X') {
		bstr = makeComputerMove(boardString);
	}
	console.log('bstr: ' + bstr);	
	const boardContent = buildBoard(name, bstr);
	
	win = checkWin(bstr);
	let winText = '';
	if (win === 'X') {
		winText = 'You won!';
	}
	if (win === 'O') {
		winText = 'I won!';
	}
	if (win === '*') {
		winText = 'WINNER: NONE.  A STRANGE GAME.  THE ONLY WINNING MOVE IS NOT TO PLAY.';
	}
	return `
		<html>
		<body>
			<h1> Hello ${name}, ${new Date()}</h1>
			${boardContent}
			<h2> ${winText} </h2>
			${(win === 'X' || win === 'O') ? `<a href='./ttt.php?name=${name}'>Play Again</a>` : ''}
		</body>
		</html>
	`
}

function parseBoard(boardString) {
	const boardArr = [];
	let ind = 0;
	//console.log("^board parsed as:");
	for(let r=0;r<3;r++) {
		boardArr[r] = [];
		for(let c=0;c<3;++c) {
			if (boardString !== undefined && (boardString[ind] == 'X' || boardString[ind] == 'O')) {
				boardArr[r][c] = boardString[ind];
				ind += 2;
			} else {
				boardArr[r][c] = '';
				ind += 1;
			}
			//console.log(`${boardArr[r][c]}, `);
		}
		//console.log('\\');
	}
	return boardArr;
}

function buildBoard(name, boardString) {
	const board = parseBoard(boardString);
	let grid = '';
	for(let r=0;r<3;r++) {
		grid += '<tr>';
		for(let c=0;c<3;c++) {
			if (board[r][c] === '') {
				let boardmodstr = '';
				for(let r2=0;r2<3;++r2) {
					for(let c2=0;c2<3;++c2) {
						if (r === r2 && c === c2) {
							boardmodstr += 'X';
						} else if (board[r2][c2] != '') {
							boardmodstr += board[r2][c2];
						}
						if (r2 < 2 || c2 < 2) {
							boardmodstr += '&nbsp;';
						}
					}
				}
					
				const link = `./ttt.php?name=${name}&board=${boardmodstr}`
				const btn = `<a href=${link}>&nbsp;</a>`;
				grid += '<td>' + btn + '</td>';
			} else {
				const btn = `<a>${board[r][c]}</a>`;
				grid += '<td>' + btn + '</td>';
			}
		}
		grid += '</tr>';
	}
	return `
		<table border="1">
			${grid}
		</table>`;
}

function checkWin(boardString) {
	const board = parseBoard(boardString);
	const teams = ['X','O'];
	let winner = '';
	for(let i=0;i<2;i++) {
		const team = teams[i];
		for(let r=0;r<3;++r) {
			if (board[r][0] === team && board[r][1] === team && board[r][2] === team) {
				if (winner === teams[(i+1)%2]) {
					return '*';
				}
				winner = team;
			}
		}
		for(let c=0;c<3;++c) {
			if (board[0][c] === team && board[1][c] === team && board[2][c] === team) {
				if (winner === teams[(i+1)%2]) {
					return '*';
				}
				winner = team;
			}
		}
		if (board[0][0] === team && board[1][1] === team && board[2][2] === team) {
			if (winner === teams[(i+1)%2]) {
				return '*';
			}
			winner = team;
		}
		if (board[0][2] === team && board[1][1] === team && board[2][0] === team) {
			if (winner === teams[(i+1)%2]) {
				return '*';
			}
			winner = team;
		}
	}
	if (winner === '') {
		let ccnt = 0;
		for(let r=0;r<3;r++) {
			for(let c=0;c<3;c++) {
				if (board[r][c] === 'X' || board[r][c] === 'O') {
					ccnt += 1;
				}
			}
		}
		console.log("ccnt: " + ccnt);
		if (ccnt === 9) {
			return '*';
		}
	}
	return winner;
}

function makeComputerMove(boardString) {
	if (boardString === undefined) {
		return boardString;
	}
	let moved = false;
	let ret = '';
	for(let i=0;i<boardString.length;i++) {
		let movehere = false;
		if (moved === false) {
			if (i === 0) {
				if (boardString[i] === String.fromCharCode(160)) {
					ret += 'O';
					ret += boardString[i];
					moved = true;
					continue;
				}
			}
			if (i === boardString.length-1) {
				if (boardString[i] === String.fromCharCode(160)) {
					movehere = true;
					moved = true;
				}
			} else if (boardString[i] === String.fromCharCode(160) && boardString[i+1] === String.fromCharCode(160)) {
				movehere = true;
				moved = true;
			}
		}
		ret += boardString[i];
		if (movehere === true) {
			ret += 'O';
		}
	}
	return ret;	
}

module.exports = router
