/* 
  https://open.kattis.com/problems/10kindsofpeople
  just another maze type problem
  normalize maze, solve maze
  1 3 = row 1 col 3 -> x = 2, y = 0 translated for array values
  0 (binary-man): paths are 0's
  1 (decimal-man) paths are 1's
*/
//////////////
// GET DATA //
//////////////

//var fs = require('fs')
var OrigData;
// try {  
//    OrigData = fs.readFileSync('data.txt', 'utf8');
//    //OrigData = fs.readFileSync('samples/sample-00.in', 'utf8');
// } catch(e) {
//     console.log('Error:', e.stack);
// }
OrigData = `10 20
11111111111111111111
11000000000000000101
11111111111111110000
11111111111111110000
11000000000000000111
00011111111111111111
00111111111111111111
10000000000000001111
11111111111111111111
11111111111111111111
3
2 3 8 16
8 1 7 3
1 1 10 20
`

////////////////
// PARSE DATA //
////////////////

var Lines      = OrigData.split("\n")
var RowColLine = Lines[0]
var NumCols    = parseInt(RowColLine.split(" ")[1] ,10)
var NumRows    = parseInt( RowColLine.split(" ")[0],10)
var Matrix     = Lines.slice(1,NumRows+1).map((x)=>x.split("").map((y)=>parseInt(y,10)))
var NumTests   = parseInt(Lines[NumRows+1],10)
var TestLines  = Lines.slice(NumRows+2).filter((n)=>n !== '')
                                      .map((x)=> x.split(" ")
                                                  .map((y)=>parseInt(y,10)))
                                      .map(([a,b,c,d]) => [[a,b],[c,d]])   
////////////////////
// Data Structure //
////////////////////

//Initial State
theData = {
  Matrix: Matrix,
  TestLines: TestLines,
  Visited: [],
  Forks: [],
  //result: "Neither",
  //CurrentLocation: [0,0],
  //StartEnd: {"StartX":0, "StartY":0, "EndX":0, "EndY":0},
}

const prepData = (ATest) => {
  theData.Visited = []  
  theData.Forks   = [] 
  return MatrixBaseNormalizer(ATest)
}
//////////////////////
// HELPER FUNCTIONS //
//////////////////////

const North      = Symbol()
const South      = Symbol()
const East       = Symbol()
const West       = Symbol()
const Directions = [North, South, East, West]

const Binary     = Symbol()
const Decimal    = Symbol()
const Neither    = Symbol()

const MatrixBaseNormalizer = ATest => [ATest[0][0]-1, ATest[0][1]-1, ATest[1][0]-1, ATest[1][1]-1]
const AddUniquely = (Arr, Unit) => {
                      //if (!Arr.find((u) => JSON.stringify(Unit) == JSON.stringify(u))) 
                        //Arr.push(Unit)
                      return Arr.concat([Unit])
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/////////////////////
// LOGIC FUNCTIONS //
/////////////////////

const CanIMove = (Matrix) => (Loc) => (Dir) => {
 let isMoveOK
  switch (Dir) {
    case North: isMoveOK = Loc[0]+1 <  NumRows && theData.Matrix[Loc[0]+1][Loc[1]] === Loc[2] ? [[Loc[0]+1,Loc[1], Loc[2]]] : []
                break; 
    case South: isMoveOK = Loc[0]-1 >= 0       && theData.Matrix[Loc[0]-1][Loc[1]] === Loc[2] ? [[Loc[0]-1,Loc[1], Loc[2]]]: []
                break; 
    case East:  isMoveOK = Loc[1]+1 <  NumCols && theData.Matrix[Loc[0]][Loc[1]+1] === Loc[2] ? [[Loc[0],Loc[1]+1, Loc[2]]]: []
                break; 
    case West:  isMoveOK = Loc[1]-1 >= 0       && theData.Matrix[Loc[0]][Loc[1]-1] === Loc[2] ? [[Loc[0],Loc[1]-1, Loc[2]]]: []
                break; 
  }
  return isMoveOK
}
const CanIMoveXYDir = CanIMove(theData.Matrix)
const MovesFromHere = Here => {
  let IsInMatrix = theData.Matrix[Here[0]][Here[1]] === Here[2] 
  if (!IsInMatrix) return [[],[],[],[]]
  let CanIMoveDir = CanIMoveXYDir(Here)
  return Directions.map((D) => CanIMoveDir(D))
}
const UnvisitedMovesFromHere = (AVisited) => (PossibleMoves) => 
                                  PossibleMoves.filter((x) => !AVisited.find((y) => JSON.stringify(y)==JSON.stringify(x[0]))) 

const canStepInMultipleDirections = (Arr) => Arr.filter((x) => x.length > 0).length > 1
const IsArrived  = (NextStop, BOrD, EndX, EndY) => (NextStop[0] == EndX && NextStop[1] == EndY && NextStop[2] == BOrD)
const HasPossibleStep   = (PossibleSteps) => PossibleSteps ? PossibleSteps.find((x) => x.length > 0) : null
const FindPossibleSteps = (PossibleSteps) => PossibleSteps.find((x) => x.length > 0)[0]
const ForkMe     = (PossibleSteps, NextStop, Forks) => 
                    canStepInMultipleDirections ? AddUniquely(Forks, NextStop)
                                                : Forks.filter((x) => JSON.stringify(x) !== JSON.stringify(NextStop))

////////////////////
// RENDER HELPERS //
////////////////////

const createCanvas = (idx) => {
  let jack = document.createElement("canvas")
  jack.id = idx
  jack.width = "600"
  jack.height = "400"
  document.body.appendChild(jack)
}

const renderMaze= (canvasSelector) => (matrix) => {
  matrix.map((row, rowidx) => row.map((col, colidx) => col==0 ? renderGreenCell([rowidx,colidx]) : renderRedCell([rowidx,colidx]) ))
}

const renderCell = ([fr,fg,fb]=[0,0,0]) => (canvasSelector) => ([y,x]=[0,0]) => {
  var c2=document.getElementById(canvasSelector);
  var ctx=c2.getContext("2d");
  ctx.fillStyle=`rgba(${fr},${fg},${fb}, 0.3)`;
  ctx.fillRect(100+x*30,100+y*30,29,29);
}
const renderLetter = (canvasSelector) => (letter) => ([y,x]=[0,0]) => {
  var canvas = document.getElementById(canvasSelector);
  var ctx = canvas.getContext("2d");
  ctx.font = "20px Arial";
  ctx.fillStyle="black";
  return ctx.fillText(letter,110+x*30,122+y*30);
}

renderMazeStartEnd = (idx, matrix, [StartX, StartY], [EndX, EndY]) => {
  createCanvas(idx)
  renderRedCell   = renderCell([255,0,0])(idx)
  renderGreenCell = renderCell([0,255,0])(idx)
  renderMaze(idx)(matrix)
  renderLetter(idx)("S")([StartX, StartY])
  renderLetter(idx)("E")([EndX, EndY])  
}

///////////////////////
// TRAVERSAL HELPERS //
///////////////////////


async function walk(idx, NextStop, theData, kindValue, [{StartX, StartY, EndX, EndY}]) {
  kindValue == 0 ? renderCell([128,0,128])(idx)(NextStop) : renderCell([128,128,128])(idx)(NextStop)
  await sleep(100)
  if (IsArrived(NextStop, kindValue, EndX, EndY)) return !!kindValue ? "Decimal" : "Binary"
  const PossibleSteps = UnvisitedMovesFromHere(theData.Visited)(MovesFromHere([NextStop[0], NextStop[1], kindValue]))
  theData.Visited = AddUniquely(theData.Visited, NextStop)
  theData.Forks = ForkMe(PossibleSteps, NextStop, theData.Forks)
  NextStop = HasPossibleStep(PossibleSteps) ? FindPossibleSteps(PossibleSteps) : null
  return (NextStop === null && theData.Forks.length !== 0) ? walkFork(idx, theData, kindValue, [{StartX, StartY, EndX, EndY}])
                                                           : (NextStop === null) ? "Neither"
                                                           : walk(idx, NextStop, theData, kindValue, [{StartX, StartY, EndX, EndY}])
}

const walkFork = (idx, theData,kindValue, [{StartX, StartY, EndX, EndY}]) => {
  const NewStart = theData.Forks.pop()
  const PossibleSteps = UnvisitedMovesFromHere(theData.Visited)(MovesFromHere([NewStart[0], NewStart[1], NewStart[2]]))
  const NextStop = HasPossibleStep(PossibleSteps) ? FindPossibleSteps(PossibleSteps) : null
  return (NextStop === null && theData.Forks.length !== 0) ? walkFork(idx, theData, kindValue, [{StartX, StartY, EndX, EndY}])
                                                           : (NextStop === null) ? "Neither"
                                                           : walk(idx, NextStop, theData, kindValue, [{StartX, StartY, EndX, EndY}])
}
//function walk ()  {j = [].slice.call(arguments);  setTimeout(walkees.apply(null, j), 10000)}

const reducer = (kindValues, idx, {StartX, StartY, EndX, EndY}, theData) => {
  return kindValues.reduce((acc, kindValue) => {
    return IsArrived([StartX, StartY, theData.Matrix[StartX][StartY]], kindValue, EndX, EndY) ? (!!kindValue ? "Decimal" : "Binary")
                   : !HasPossibleStep(MovesFromHere([StartX, StartY, kindValue])) ? acc 
                   : walk(idx, [StartX, StartY, theData.Matrix[StartX][StartY]], theData, kindValue, [{StartX, StartY, EndX, EndY}])
  }, "Neither")
}

const processor = (idx, startEnd, theData) => reducer(Object.values({binary: 0, decimal:1}), idx, startEnd, theData)

const run = (tests) => tests.map((ATest, idx) => {
  const [StartX, StartY, EndX, EndY] = prepData(ATest)
  renderMazeStartEnd(idx, theData.Matrix, [StartX, StartY], [EndX, EndY])
  return processor(idx, {StartX,StartY,EndX,EndY}, {...theData})
  })

////////////
// Run It //
////////////

const results = run(theData.TestLines)
console.log(results.join("\n"))
assert(results.join(", ") === "Binary, Decimal, Neither", "Maze " )

///////////////////////
// LOGGING FUNCTIONS //
///////////////////////

//console.log(theData)
//console.log("NumCols = ", NumCols)  
//console.log("NumRows = ", NumRows)  
//console.log(theData.Matrix)  
//console.log("NumTests = ", NumTests)  
//console.log("TestLines = ", TestLines)  
function assert(value, desc) {
  if (true) {
    console.log(value ? desc + 'passed! '  :   desc + 'failure...');
  }
  else{
    return "";
  }
}

console.log("The End")  
