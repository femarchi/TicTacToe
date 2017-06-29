$(document).ready(function(){
	
	var p1_human = true;
	var p2_human = true;
	var mainGame;
	var manager;

	loadStartScreen();

	// Click handlers

	$(document).on('click', "#1P", function(){
		if(!p1_human){
			$(this).html("> 1P <");
			$("#CPU-X").html("CPU");
			p1_human = true;
		}
	});

	$(document).on('click', "#CPU-X", function(){
		if(p1_human){
			$(this).html("> CPU <");
			$("#1P").html("1P");
			p1_human = false;
		}
	});

	$(document).on('click', "#2P", function(){
		if(!p2_human){
			$(this).html("> 2P <");
			$("#CPU-O").html("CPU");
			p2_human = true;
		}
	});

	$(document).on('click', "#CPU-O", function(){
		if(p2_human){
			$(this).html("> CPU <");
			$("#2P").html("2P");
			p2_human = false;
		}
	});

	$(document).on('click', "#start-game", function(){
		loadGameScreen();
	});

	$(document).on('click', "#board>div", function(){
		if(manager.turn.type === "Human" && !manager.gameover){
			manager.play(this.id);
			manager.updateGame();
		}
	});

	$(document).on('click', "#quit-bar>p", function(){
		loadStartScreen();
	});

	$(document).on('click', "#restart-no", function(){
		loadStartScreen();
	});

	$(document).on('click', "#restart-yes", function(){
		loadGameScreen();
	});

	// Prototype definitions

	function GameManager(){

		this.gameover = false;
		this.turn = null;

		this.startNewGame = function(){
			var p1 = p1_human ? new Player("X", "Human") : new Player("X", "CPU");
			var p2 = p2_human ? new Player("O", "Human") : new Player("O", "CPU");
			var board = [null, null, null,
									 null, null, null, 
									 null, null, null];
			mainGame = new Game(p1, p2, board);
		}

		//returns an array with "X", "O", "DRAW" or null and the winning sequence [,,].
		this.checkWinner = function(board){

			var winningcases = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8],	[0,4,8], [2,4,6]];

			for(var i = 0; i < winningcases.length; i++){
				var sequenceCheck = [board[winningcases[i][0]], board[winningcases[i][1]], board[winningcases[i][2]]];
				if(!sequenceCheck.includes(null) && sequenceCheck[0] === sequenceCheck[1] && sequenceCheck[0] === sequenceCheck[2]){
					return [board[winningcases[i][0]], winningcases[i]];
				}
			}

			//no more moves and no winners -> draw
			if(!board.includes(null) && !this.gameover){
				return ["DRAW", null];
			}

			return [null, null];

		} //end of checkWinner

		this.updateGame = function(){
			var winner = this.checkWinner(mainGame.board);
			mainGame.renderBoard(winner[1]);
			switch (winner[0]) {
				case "X":
					this.gameover = true;
					var msg = ("X" === mainGame.player1.symbol) ? "1P WINS" : "2P WINS";
					setTimeout(function(){loadGameOverScreen(msg);}, 2000);
					break;
				case "O":
					this.gameover = true;
					var msg = ("O" === mainGame.player1.symbol) ? "1P WINS" : "2P WINS";
					setTimeout(function(){loadGameOverScreen(msg);}, 2000);
					break;
				case "DRAW":
					this.gameover = true;
					setTimeout(function(){loadGameOverScreen("DRAW");}, 2000);
					break;
				default:
					break;
			}

			if(!this.gameover){
				this.changeTurn();
				var currentTurn = (this.turn==mainGame.player1) ? "1P" : "2P";
				document.getElementById("status-bar").innerHTML = "<p>"+ currentTurn + " TURN</p>"
			}

			if(this.turn.type === "CPU"){
				var move = this.turn.getNextMove(mainGame.board, 0, this.turn.symbol);
				mainGame.addMove(move[0], this.turn.symbol);
				if(!this.gameover){
					setTimeout(function(){manager.updateGame()}, 500);	
				}
			}

		} //end of updateGame

		this.play = function(pos){
			if(!this.gameover){
				if(mainGame.isFree(pos)){
					mainGame.addMove(pos, this.turn.symbol);

					//Check if cpu is next player, if so, it plays the next move
					if(!this.gameover && this.turn.type === "CPU"){
						var move = this.turn.getNextMove(mainGame.board, 0, this.turn.symbol); //AI
						mainGame.addMove(move[0], this.turn.symbol);
						setTimeout(function(){this.updateGame();}, 1000);
					}
				}
			}
		} //end of play

		this.changeTurn = function(){
			this.turn = (this.turn==mainGame.player1) ? mainGame.player2 : mainGame.player1;
		} //end of changeTurn

	}

	function Game(p1, p2, board){

		this.player1 = p1;
		this.player2 = p2;
		this.board = board;

		this.renderBoard = function(winnerSequence){

			for(var i = 0; i < this.board.length; i++){
				if(this.board[i] === null){
					document.getElementById(parseInt(i)).innerHTML = "";
				} else {
					var move = "<p>" + this.board[i] + "</p>"
					document.getElementById(parseInt(i)).innerHTML = move;
					//console.log(i + " " + winnerSequence);
					if(winnerSequence != null && winnerSequence.includes(i)){
						document.getElementById(parseInt(i)).style.color = "red";
					}
				}
			}
		} //end of renderBoard

		this.addMove = function(pos, symbol){
			this.board[pos] = symbol;
		}

		this.isFree = function(pos){
			return this.board[pos] === null;
		}

	} //end of game object

	function Player(symbol, type){
		this.symbol = symbol;
		this.type = type;

		this.getNextMove = function(board, depth, symbol){
			var move;
			var isFirstMove = true;
			for(var i = 0; i < board.length; i++){
				if(board[i] !== null) {
					isFirstMove = false; 
					break;
				}
			}
			if(isFirstMove)	return [4, 10]; //first move center

			var scores = [-10, -10, -10, -10, -10, -10, -10, -10, -10];
			
			for(var i = 0; i < scores.length; i++){
				if(board[i] !== null){
					scores[i] = -10; //spot taken
				} else {
					var newBoard = board.slice();
					newBoard[i] = symbol;
					var winner = manager.checkWinner(newBoard);
					
					if(winner[0] === null){
						//if there is no winner, simulate game
						var newSymbol = (symbol === "X") ? "O" : "X";
						var newDepth = depth + 1;
						var score = this.getNextMove(newBoard, newDepth, newSymbol);
						scores[i] = score[1];
					} else if (winner[0] === "DRAW"){
						//draw
						scores[i] = 0;
					} else {
						//there is a winner
						scores[i] = (winner[0] === this.symbol) ? 10 - depth : depth - 10;
					}
				}
			}

			var finalScore = -10;
			if(this.symbol === symbol){
				for(var i = 0; i < scores.length; i++){
					if(scores[i] > finalScore){finalScore = scores[i]; move = i;}
				}
			} else {
				finalScore = 10;
				for(var i = 0; i < scores.length; i++){
					if(scores[i] < finalScore && scores[i] > -10){finalScore = scores[i]; move = i;}
				}
			}

			return [move, finalScore];

		}//end of getNextMove

	}//end of Player

	// Screen loaders

	function loadStartScreen(){
		p1_human = true;
		p2_human = true;
		$("#app-wrapper").html('<div id="start-screen" class="container"><div id="title" class="row"><h1>TIC TAC TOE</h1></div><div id="choose-player" class="row"><div class="col-xs-5"><div class="row"><p>PLAYER X</p></div><div class="row"><p class="option" id="1P">> 1P <</p></div><div class="row"><p class="option" id="CPU-X">CPU</p></div></div><div id="choose-player-vs" class="col-xs-2"><p>VS</p></div><div class="col-xs-5"><div class="row"><p>PLAYER O</p></div><div class="row"><p class="option" id="2P">> 2P <</p></div><div class="row"><p class="option" id="CPU-O">CPU</p></div></div><div id="start-game-wrapper" class="col-xs-12"><p id="start-game" class="option">START GAME</p></div></div></div>');
	}

	function loadGameScreen(){
		$("#app-wrapper").html('<div id="game-screen" class="container"><div id="status-bar" class="row"><p>1P TURN</p></div><div id="board" class="row"><div class="col-xs-4" id="0"></div><div class="col-xs-4" id="1"></div><div class="col-xs-4" id="2"></div><div class="col-xs-4" id="3"></div><div class="col-xs-4" id="4"></div><div class="col-xs-4" id="5"></div><div class="col-xs-4" id="6"></div><div class="col-xs-4" id="7"></div><div class="col-xs-4" id="8"></div></div><div id="quit-bar" class="row"><p>RETURN TO MENU</p></div></div>');

		manager = new GameManager();
		manager.startNewGame();
		manager.updateGame();
	}

	function loadGameOverScreen(result){
		$("#app-wrapper").html('<div id="gameover-screen" class="container"><div id="gameover" class="row"><p>GAME OVER</p></div><div id="gameover-result" class="row"><p>'+result+'</p></div><div id="restart-wrapper" class="row"><div id="restart-question" class="col-xs-12"><p>RESTART GAME?</p></div><div id="restart-yes" class="col-xs-offset-2 col-xs-4"><p class="option">YES</p></div><div id="restart-no" class="col-xs-4"><p class="option">NO</p></div></div></div>');
	}


	function showBoard(gameBoard){
		gameBoard = gameBoard.map(function(elem){
			return (elem === null) ? "-" : elem;
		});
		var boardStr = gameBoard[0] + " | " + gameBoard[1] + " | " + gameBoard[2] + "\n----------\n" +
										gameBoard[3] + " | " + gameBoard[4] + " | " + gameBoard[5] + "\n----------\n" +
										gameBoard[6] + " | " + gameBoard[7] + " | " + gameBoard[8];
		console.log(boardStr);
	}
});