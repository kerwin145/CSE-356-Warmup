const express = require('express');
const router = express.Router();
const path = require('path')

//On first connect, send form asking for name
router.get('/', (req, res) => {
    const filePath = path.join(__dirname, '/connect_pages/form.html')
    res.sendFile(filePath)
})

router.post('/',  (req, res) => {
    
    let username = req.body.name
    let boardStr = req.body.board
   
    let board
    if(boardStr)
        board = splitBoardStr(boardStr)
    else{
        board = Array(5).fill().map(() => Array(7).fill(""))
    }
    let newGame = board.every( 
        (row) => {
            return row.every(x => x == "")
        }
    )

    let xWon, oWon, isTied
    xWon = findWinner(board, "X")
    isTied = isGameTied(board)

    let boardHtml = generateBoard(board, xWon || oWon || isTied)

    let htmlForm 
    if (xWon || isTied){
        htmlForm = `
            <form action="/connect.php" method="POST" enctype="multipart/form-data">
                ${boardHtml}
                <input type="hidden" name="name" value="${username}">
                ${xWon ? "<h1>You won!</h1>" : isTied ? "<h1>Draw</h1>" : ``}
                ${xWon ? "<div>You won!</div>" : isTied ? "<div>Draw</d>" : ``}
                ${xWon || isTied ? 
                    `<button type = "submit" name="board" value = "       .       .       .       .       " >Play again</button>`
                    :
                    ``
                }
            </form>
        `
    }        
    else{
        //first turn should be the player. So, if board was just created, don't move
        if(!newGame){
            //nice AI lol
            for(let i = 0; i < board[0].length; i++){
                if(board[0][i] == ""){
                    board = dropToken(board, i, "O")
                    break
                }
            }

            oWon = findWinner(board, "O")
            isTied = isGameTied(board)
            boardHtml = generateBoard(board, oWon || isTied)
        }

        htmlForm = `
        <form action="/connect.php" method="POST" enctype="multipart/form-data">
            ${boardHtml}
            <input type="hidden" name="name" value="${username}">
            ${oWon ? "<h1>I won!</h1>" : isTied ? "<h1>Draw</h1>" : ``}
            ${oWon ? "<div>I won!</div>" : isTied ? "<h1>Draw</h1>" : ``}
            ${oWon || isTied ? 
                `<button type = "submit" name="board" value = "       .       .       .       .       " >Play again</button>`
                :
                ``
            }
        </form>
        `
    }

    res.send(`
        <html>
        <head>
            <title>Connect 4</title>
            <link rel="stylesheet" href="/css/connect.css">
        </head>
        <body>
        <h1> Hello ${username}, ${new Date()}</h1>
        ${htmlForm}
        </body>
    `)


})  

function splitBoardStr(board) {
    return board.split(".").map(row => row.split(" "))
}

function generateBoard(board, gameOver){
    let html = ""
    //make the buttons
    for(let i = 0; i < 7; i++){
        if(!gameOver && board[0][i] == ""){
            let newBoard = dropToken(board, i, 'X')
            let newBoardStr = newBoard.map(row => row.join(" ")).join(".")
            html += `<button class = "connect-dropBtn" type="submit" name="board" value="${newBoardStr}">v</button>`
        }else{
            // html += `<button class = "connect-dropBtn" type = "submit" name="board" value = "" disabled></button>`
            html += "<div></div>"
        }
    }

    for(let i = 0; i < 5; i++){
        for(let j = 0; j < 7; j++){
            html += `<div class = "connect-cell">${board[i][j]}</div>`
        }
    }

    html = `<div class = "connect-grid">` + html + `</div>`
    return html
}

function dropToken(board_, columnDropped, token){
    let board = board_.map(row => [...row]);
    //find row that the coin will drop down to
    i = 0;
    while(i+1 < 5 && board[i+1][columnDropped] == "")  
        i++

    board[i][columnDropped] = token
    
    return board
}

function findWinner(board, token){
    for(let i = 0; i < 5; i++){
        for(let j = 0; j < 7; j++){
            if(board[i][j] != token) 
                continue

            if (j+3 < 7 && board[i][j + 1] == token && board[i][j + 2] == token && board[i][j + 3] == token)
                return true
            if (i+3 < 5 && board[i + 1][j] == token && board[i + 2][j] == token && board[i + 3][j] == token)
                return true
            if (i + 3 < 5 && j + 3 < 7 && board[i + 1][j + 1] == token && board[i + 2][j + 2] == token && board[i + 3][j + 3] == token)
                return true
            if (i - 3 >= 0 && j - 3 >= 0 && board[i - 1][j - 1] == token && board[i - 2][j - 2] == token && board[i - 3][j - 3] == token)
                return true
        }
    }
    //no chicken dinner :(
    return false
}

function isGameTied(board){
    for(let i = 0; i < 7; i++){
        if(board[0][i] == "")
            return false
    }
    return true
}

module.exports = router
