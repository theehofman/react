import {useState} from "react"
import './Board.css';
import TitleScreen from "./titlescreen";
import { useEffect } from "react";

import {randomIntFromInterval, useInterval, reverseLinkedList} from "../src/lib/utils"
import BlockDescription from "./Blockdescription";
import io from 'socket.io-client'
const socket = io.connect("http://localhost:5174")


class LinkedListNode{
    constructor(value){
        this.value = value;
        this.next = null;
    }
}

class SinglyLinkedList{
    constructor(value){
        const node = new LinkedListNode(value);
        this.head = node;
        this.tail = node;

    }
}
class Snake{
  constructor(list, cells, color, direction){
    this.list = list;
    this.cells = new Set(cells);
    this.color = color;
    this.direction = direction;

}
}

const Direction={
    UP:'UP',
    RIGHT:'RIGHT',
    DOWN:'DOWN',
    LEFT:'LEFT'
}
const PROBABILITY_OF_DIRECTION_REVERSAL_FOOD = 0.3;
const PROBABILITY_OF_TELPORTATION_FOOD = .3;
const getStartingSnakeLLValue = board => {
    
    const rowSize = board.length;
    const colSize = board[0].length;
    const startingRow = Math.round(rowSize / 3);
    const startingCol = Math.round(colSize / 3);
    const startingCell = board[startingRow][startingCol];
    
    return {
      row: startingRow,
      col: startingCol,
      cell: startingCell,
      
    };
  };







const BOARD_SIZE = 15;

const Board = () =>{
  const [gameStatus, setGameStatus] = useState("titleScreen");
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(createBoard(BOARD_SIZE));

  const [gamespeed, setGameSpeed] = useState(150)
  const [direction, setDirection] = useState() ;

  // Initialize state with default values
  const [snakes, setSnakes] = useState([]);
  const [snakeCells, setSnakeCells] = useState(new Set([]));
  const [foodCell, setFoodCell] = useState(null);
  const [teleportationCell, setTeleportationCell] =useState(0);

  const [passedPortal, setPassedPortal]= useState(false);
  const [touchedPortal, setTouchedPortal] = useState(false);
  const [NextTeleportationCell, setNextTeleportationCell] = useState(null);
  const [nextPortal, setNextPortal] = useState(false);


 
  const [foodShouldReverseDirection, setFoodShouldReverseDirection] = useState(false);
  const [foodShouldTeleport, setFoodShouldTeleport] = useState(false);

  
 
  let playerSnake;
  let playerID;
  let startingList;
  let startingCell;
  socket.on('snakeID', (id, callback)=>{
    //ISSUE is here.. we arent getting anything I guess
    playerID = id;
    
    callback("we got the playerID")
   
  })
  const [isLoading, setIsLoading] = useState(true);
  
  socket.on('updatePlayers', (backendplayers, totalSnakeCells) => {
    
    let newSnakeCells = new Set(snakeCells)
    totalSnakeCells.forEach((cell)=>{newSnakeCells.add(cell)})

    for(const id in backendplayers){
      const backendPlayer = backendplayers[id]

      if(!snakes[id]){
        
        // Create a new Snake if it doesn't exist yet
        snakes[id] = new Snake(backendPlayer.list, backendPlayer.cells, backendPlayer.color, backendPlayer.direction)
        
    

      }
    }
  
    for(const id in snakes){
      if(!backendplayers[id]){
        // Delete the Snake if it doesn't exist in the backendplayers
        delete snakes[id]

      }

    }
    

  
    // Make sure the playerSnake is updated correctly
    
    //console.log('Updated playerSnake:', playerSnake);
  
    // Make sure the startingCell and startingList are updated correctly
    //startingCell = playerSnake.list.head.value.cell;
  // startingList = playerSnake.list;
    //console.log('Updated startingCell and startingList:', startingCell, startingList);
    setIsLoading(false);
  
  
  });
  socket.on('updateGameState', (data) => {
    setSnakes(data.snakes);
    setSnakeCells(new Set(data.totalSnakeCells));
    setFoodCell(data.foodCell);  
    //renderGame(); // Render the game with the new state
  });
   
  
    
 
  
 

   


/*
useEffect(()=>{
    window.addEventListener('keydown', e => {
        handleKeydown(e);
      });
    }, []);


    useInterval(() => {
        moveSnake();
      }, 150);
*/

/*
useEffect(() => {
  if (startingList) {
    
    setSnakes(startingList);
    
  }
  if (startingCell) {
    
    setFoodCell(startingCell + 5);
  }

  
}, [startingList, startingCell]);

*/
useEffect(() => {
  const handleKeydown = (e) => {
    const newDirection = getDirectionFromKey(e.key);
    const OppositeDirection = getOppositeDirection(newDirection)
  
    if (newDirection && OppositeDirection != direction) {
      // Send the new direction to the server
      socket.emit('changeDirection', { id: playerID, direction: newDirection });
    }
  };

  window.addEventListener('keydown', handleKeydown);
  return () => window.removeEventListener('keydown', handleKeydown);
}, [direction, playerID]);

 // useInterval(() => {
  //  moveSnake();
 //}, gamespeed);
 if(isLoading){
  return<div>Loading...</div>
}
else{
 
    
 /* 
const handleKeydown = e => {
    
    const newDirection = getDirectionFromKey(e.key);
    const isValidDirection = newDirection !== '';
    if(!isValidDirection) return;
    
  setDirection(newDirection);
};
*/



const moveSnake = ()=> {


let currentHeadCoords;
console.log(snakes)

Object.entries(snakes).forEach(([socketId, snake]) => {
  
  currentHeadCoords ={
    row: snake.list.head.value.row,
    col: snake.list.head.value.col,
};





//console.log(currentHeadCoords)

let nextHeadCoords = getCoordsInDirection(currentHeadCoords, snake.direction);
console.log(nextHeadCoords)

if (isOutOfBounds(nextHeadCoords, board)) {
    handleGameOver();
    return;
  }

  


const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];

  if (snakeCells.has(nextHeadCell)) {
    
    handleGameOver();
    return;
  }
  if(teleportationCell != 0){
    if(nextHeadCell ===teleportationCell){
      setNextPortal(true)
      setNextTeleportationCell(teleportationCell)
      let RC = getRC(foodCell)
      
      nextHeadCoords = {row: RC.row, col: RC.col}
        
      
  
    }
    if(nextHeadCell === foodCell){
      let RC = getRC(teleportationCell)
      setNextPortal(true)
      setNextTeleportationCell(foodCell)

      nextHeadCoords = {row: RC.row, col: RC.col}
       
  }
    }

    if(nextPortal){
      handleGoingThroughTeleport(NextTeleportationCell);            
      }
      
 




const newHead = new LinkedListNode(
    {
        row: nextHeadCoords.row,
        col: nextHeadCoords.col,
        cell: nextHeadCell,
    }
);

let newSnakeCells = new Set(snake.cells);
let newTotalSnakeCells = new Set(snakeCells);
if(teleportationCell == 0){
const currentHead = snake.list.head;


snake.list.head = newHead;
currentHead.next = newHead;


newSnakeCells.delete(snake.list.tail.value.cell);
newSnakeCells.add(nextHeadCell);

newTotalSnakeCells.delete(snake.list.tail.value.cell);
newTotalSnakeCells.add(nextHeadCell);

snake.list.tail = snake.list.tail.next;
if (snake.list.tail === null) snake.list.tail = snake.list.head;
}

else{
const currentHead = snake.list.head;
snake.list.head = newHead;


currentHead.next = newHead;


newSnakeCells.delete(snake.list.tail.value.cell);
newSnakeCells.add(nextHeadCell);

newTotalSnakeCells.delete(snake.list.tail.value.cell);
newTotalSnakeCells.add(nextHeadCell);


snake.list.tail = snake.list.tail.next;
if (snake.list.tail === null) snake.list.tail = snake.list.head;
}

if(passedPortal){
  handleFoodConsumption(newSnakeCells);
  setTouchedPortal(false)
  setPassedPortal(false)
  setNextPortal(false)
    }


const foodConsumed = nextHeadCell === foodCell;
if (foodConsumed) {
    
    
 growSnake(newSnakeCells, snake);
 if (!foodShouldTeleport){
  if (foodShouldReverseDirection) reverseSnake();
  handleFoodConsumption(newSnakeCells);
 

 }
 
}
const teleportfoodConsumed = nextHeadCell === teleportationCell; 
if (teleportfoodConsumed) {
  growSnake(newSnakeCells, snake);
 }


setSnakeCells(newTotalSnakeCells);
snake.cells = newSnakeCells;

console.log(newSnakeCells)
socket.emit('updateSnake', { id: socketId, snake: { 
  ...snake, 
  cells: Array.from(snake.cells) 
},
tSnakeCells: Array.from(newTotalSnakeCells) });
})

};


const growSnake = (newSnakeCells, snake) => {
    const growthNodeCoords = getGrowthNodeCoords(snake.list.tail, snake.direction);
   
    if (isOutOfBounds(growthNodeCoords, board)) {
      // Snake is positioned such that it can't grodw; dosn't do anything.
      return;
    }
    const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col]
    const newTail = new LinkedListNode({
        
        row: growthNodeCoords.row,
        col: growthNodeCoords.col,
        cell: newTailCell,

    })
    const currentTail = snake.list.tail
  
    snake.list.tail = newTail
    snake.list.tail.next = currentTail
    newSnakeCells.add(newTailCell)



}

const reverseSnake = () => {
    const tailNextNodeDirection = getNextNodeDirection(snake.tail, direction);
    const newDirection = getOppositeDirection(tailNextNodeDirection);
    setDirection(newDirection);
    reverseLinkedList(snake.tail);
    const snakeHead = snake.head;
    snake.head = snake.tail;
    snake.tail = snakeHead;
}




const handleFoodConsumption = () =>{ 
const maxCellVal = BOARD_SIZE*BOARD_SIZE;
let nextFoodCell;
while(true){
    nextFoodCell=randomIntFromInterval(1, maxCellVal);
    if(snakeCells.has(nextFoodCell) || foodCell === nextFoodCell) continue
    break
}
const nextFoodShouldReverseDirection =
Math.random() < PROBABILITY_OF_DIRECTION_REVERSAL_FOOD;
const nextFoodShouldTeleport =
Math.random() < PROBABILITY_OF_TELPORTATION_FOOD;
setTeleportationCell(0)
setFoodShouldReverseDirection(false)
setFoodShouldTeleport(false)
if(nextFoodShouldTeleport){
    let secondFoodCell;
    while(true){
        secondFoodCell=randomIntFromInterval(1, maxCellVal);
        if(snakeCells.has(secondFoodCell) || teleportationCell === secondFoodCell || secondFoodCell === nextFoodCell) continue
        break
    }
    setFoodShouldTeleport(nextFoodShouldTeleport);
    setTeleportationCell(secondFoodCell)
}
else{
  setFoodShouldReverseDirection(nextFoodShouldReverseDirection);
}


setFoodCell(nextFoodCell);



setScore(score + 1);

}




const handleGameOver = () => {
    setScore(0);
    //const snakeLLStartingValue = getStartingSnakeLLValue(board);    
    //setSnakes(new SinglyLinkedList(snakeLLStartingValue))
    //setSnakeCells(new Set([snakeLLStartingValue.cell])),
    
    setFoodCell(snakeLLStartingValue.cell + 5);
    setTeleportationCell(0);
    setFoodShouldTeleport(false);
    setFoodShouldReverseDirection(false);
    //setDirection(Direction.RIGHT);
    setNextTeleportationCell(null);
    setTouchedPortal(false)
    setPassedPortal(false)
    setNextPortal(false)
   

}

const handleGoingThroughTeleport = (cell) =>{
  if(!touchedPortal){
  let temp = snake.tail
  while (temp!=null && temp.next != null){

    if(temp.next.value.cell ===cell){
        //if it ever equals it, dont handle food consumption.
        setTouchedPortal(true)
        
        break;

    }
    temp = temp.next
}
}

if(touchedPortal){
 //if we touched the portal previously, and no cells from tail to head equal the cell, then we are all goo
 let temp = snake.tail
 let tempbool = false
 while(temp!= null){
  if(temp.value.cell === cell){
    
    //If this is true for whole ll, set the other ting
    tempbool = true
  }
  
  temp = temp.next
 }
 if(!tempbool) {
  setPassedPortal(true)
 }

}
}
return (
    <>

    {gameStatus === "titleScreen" && <TitleScreen setGameStatus={setGameStatus} />}

    {gameStatus === "playing" && (
    <>
      <button onClick={ ()=> moveSnake()}>mve</button>
      <h1>Score: {score}</h1>
      <div className = 'boardbox'>
      <BlockDescription/>
      <div className="board">
      {score < 90 && (
          <>
                {board.map((row, rowIdx) => (
                    <div key={rowIdx} className="row">
                        {row.map((cellValue, cellIdx) => {
                            const className = getCellClassName(
                                cellValue,
                                foodCell,
                                teleportationCell,
                                foodShouldReverseDirection,
                                foodShouldTeleport,
                                snakeCells,
                                
                            );
                            
                            return <div key={cellIdx} className={className}></div>;
                        })}
                    </div>
                ))}
                
            </>
        )}
        </div>
        </div>
        </>
        )}
    </>
  );

        }
      }

const createBoard = BOARD_SIZE =>{
    let counter =1;
    const board = [];
    for(let row = 0; row < BOARD_SIZE; row++){
        const currentRow = []
        for (let col = 0; col < BOARD_SIZE; col++){
            currentRow.push(counter++);
        }
        board.push(currentRow);
    }
    return board;
}
const getCoordsInDirection = (currentHeadCoords, direction) =>{
    switch (direction) {
        case Direction.UP:
            return {
                row: currentHeadCoords.row - 1,
                col: currentHeadCoords.col
            };
        case Direction.RIGHT:
            return {
                row: currentHeadCoords.row,
                col: currentHeadCoords.col + 1
            };
        case Direction.DOWN:
            return {
                row: currentHeadCoords.row + 1,
                col: currentHeadCoords.col
            };
        case Direction.LEFT:
            return {
                row: currentHeadCoords.row,
                col: currentHeadCoords.col - 1
            };
    }
}
const isOutOfBounds = (coords, board) => {
    const {row, col} = coords;
    if(row < 0 || col < 0) return true;
    if(row>= board.length || row >= board[0].length) return true;


    return false;
}

const getDirectionFromKey = (key) =>{
   
    switch (key) {
        case 'w':
            return Direction.UP;
        case 's':
            return Direction.DOWN;
        case 'a':
            return Direction.LEFT;
        case 'd':
            return Direction.RIGHT;
        default:
            return ''; 
    }
}



const getNextNodeDirection = (node, currentDirection) => {
    if (node.next === null) return currentDirection;
    const {row: currentRow, col: currentCol} = node.value;
    const {row: nextRow, col: nextCol} = node.next.value;
    if (nextRow === currentRow && nextCol === currentCol +1) return Direction.RIGHT
    if (nextRow === currentRow && nextCol === currentCol -1) return Direction.LEFT
    if (nextCol === currentCol && nextRow === currentRow +1) return Direction.DOWN
    if (nextCol === currentCol && nextRow === currentRow -1) return Direction.UP  
    return currentDirection

}
const getGrowthNodeCoords = (snakeTail, currentDirection) => {
    
    const tailNextNodeDirection = getNextNodeDirection(
        snakeTail,
        currentDirection,
      );
    
    const growthDirection = getOppositeDirection(tailNextNodeDirection);
    const currentTailCoords = {
        row: snakeTail.value.row,
        col: snakeTail.value.col,

    };
    const growthNodeCoords = getCoordsInDirection(
        currentTailCoords,
        growthDirection,
    )

    return growthNodeCoords
  
}
const getOppositeDirection = direction => {
    if (direction === Direction.UP) return Direction.DOWN;
    if (direction === Direction.RIGHT) return Direction.LEFT;
    if (direction === Direction.DOWN) return Direction.UP;
    if (direction === Direction.LEFT) return Direction.RIGHT;
  };
  
  const getCellClassName = (
    cellValue,
    foodCell,
    teleportationCell,
    foodShouldReverseDirection,
    foodShouldTeleport,
    snakeCells,
   
  ) => {
    let className = 'cell';
  
    if (cellValue === teleportationCell){
        className = 'cell cell-blue'
    }
   else if (cellValue === foodCell) {
      if (foodShouldReverseDirection) {
        className = 'cell cell-purple';
      }
      else if (foodShouldTeleport) {
        className = 'cell cell-orange';
      }
      
       else {
        className = 'cell cell-red';
      }
    }
    else if (snakeCells.has(cellValue)) className = 'cell cell-green';
 

  
    return className;
  };
  const getRC = (Number) => {
    let row = Math.floor(Number /BOARD_SIZE)
    let col = Math.floor(Number % BOARD_SIZE) -1
    let val = Number
    return {row, col, val}
  }
  export default Board