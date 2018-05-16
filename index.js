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

var fs = require('fs')
var OrigData;
try {  
   OrigData = fs.readFileSync('data.txt', 'utf8');
   //OrigData = fs.readFileSync('samples/sample-00.in', 'utf8');
} catch(e) {
    console.log('Error:', e.stack);
}

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
                      Arr.push(Unit) 
                      let pf = new Set(Arr)
                      return Array.from(pf)
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
const MovesFromHere = function(Here) {
  let IsInMatrix = theData.Matrix[Here[0]][Here[1]] === Here[2] 
  if (!IsInMatrix) return [[],[],[],[]]
  let CanIMoveDir = CanIMoveXYDir(Here)
  return [North, South, East, West].map((D) => CanIMoveDir(D))
}
const UnvisitedMovesFromHere = (AVisited) => (PossibleMoves) => 
                                  PossibleMoves.filter((x) => !AVisited.find((y) => JSON.stringify(y)==JSON.stringify(x[0]))) 

const canStepInMultipleDirections = (Arr) => Arr.filter((x) => x.length > 0).length > 1
const IsArrived  = (NextStop, BOrD, EndX, EndY) => (NextStop[0] == EndX && NextStop[1] == EndY && NextStop[2] == BOrD)
const HasPStep   = (Psteps) => Psteps ? Psteps.find((x) => x.length > 0) : null
const FindPSteps = (PSteps) => PSteps.find((x) => x.length > 0)[0]
const ForkMe     = (PSteps, NextStop, Forks) => 
                    canStepInMultipleDirections ? AddUniquely(Forks, NextStop)
                                                : Forks.filter((x) => JSON.stringify(x) !== JSON.stringify(NextStop))

////////////
// Run It //
////////////

const walk = (NextStop, theData, kindValue, [{StartX, StartY, EndX, EndY}]) => {
  if (IsArrived(NextStop, kindValue, EndX, EndY)) return !!kindValue ? "Decimal" : "Binary"
  PSteps = UnvisitedMovesFromHere(theData.Visited)(MovesFromHere([NextStop[0], NextStop[1], kindValue]))
  AddUniquely(theData.Visited, NextStop)
  ForkMe(PSteps, NextStop, theData.Forks)
  NextStop = HasPStep(PSteps) ? FindPSteps(PSteps) : null
  return (NextStop === null && theData.Forks.length !== 0) ? walkFork(theData, kindValue, [{StartX, StartY, EndX, EndY}])
                                                           : (NextStop === null) ? "Neither"
                                                           : walk(NextStop, theData, kindValue, [{StartX, StartY, EndX, EndY}])
}

const walkFork = (theData,kindValue, [{StartX, StartY, EndX, EndY}]) => {
  NewStart = theData.Forks.pop()
  PSteps = UnvisitedMovesFromHere(theData.Visited)(MovesFromHere([NewStart[0], NewStart[1], NewStart[2]]))
  NextStop = HasPStep(PSteps) ? FindPSteps(PSteps) : null
  return (NextStop === null && theData.Forks.length !== 0) ? walkFork(theData, kindValue, [{StartX, StartY, EndX, EndY}])
                                                           : (NextStop === null) ? "Neither"
                                                           : walk(NextStop, theData, kindValue, [{StartX, StartY, EndX, EndY}])
}

const reducer = (kindValues, {StartX, StartY, EndX, EndY}, theData) => {
  return kindValues.reduce((acc, kindValue) => {
    return IsArrived([StartX, StartY, theData.Matrix[StartX][StartY]], kindValue, EndX, EndY) ? (!!kindValue ? "Decimal" : "Binary")
                   : !HasPStep(MovesFromHere([StartX, StartY, kindValue])) ? acc 
                   : walk([StartX, StartY, theData.Matrix[StartX][StartY]], theData, kindValue, [{StartX, StartY, EndX, EndY}])
  }, "Neither")
}

const processor = (startEnd, theData) => reducer(Object.values({binary: 0, decimal:1}), startEnd, theData)
  

const run = (tests) => tests.map((ATest) => {
  theData.Visited = []  
  theData.Forks   = []  
  const [StartX, StartY, EndX, EndY] = MatrixBaseNormalizer(ATest)
  return processor({StartX,StartY,EndX,EndY}, theData)
  })


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
