/* 
  https://open.kattis.com/problems/10kindsofpeople
  just another maze type problem
  normalize maze, solve maze
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

const MatrixToXY = Mat => {
  let Jim = []
  for (i=0;i<NumRows;i++)
    for (j=0;j<NumCols;j++) {
      Jim.push([i, j, Mat[i][j]])
  }
  return Jim
}
const MatrixBaseNormalizer = ATest => [ATest[0][0]-1, ATest[0][1]-1, ATest[1][0]-1, ATest[1][1]-1]
const TheMatrix = MatrixToXY(Matrix)
const AddUniquely = (Arr, Unit) => {
                      Arr.push(Unit) 
                      let pf = new Set(Arr)
                      return Array.from(pf)
}

//const xyvEq = (Matrx, 

/////////////////////
// LOGIC FUNCTIONS //
/////////////////////

const CanIMove = (Matrix) => (Loc) => (Dir) => {
 let isMoveOK
  switch (Dir) {
    case North: isMoveOK = Matrix.filter((x)=>JSON.stringify([Loc[0]-1,Loc[1], Loc[2]]) === JSON.stringify(x))
                break; 
    case South: isMoveOK = Matrix.filter((x)=>JSON.stringify([Loc[0]+1,Loc[1], Loc[2]]) === JSON.stringify(x))
                break; 
    case East:  isMoveOK = Matrix.filter((x)=>JSON.stringify([Loc[0],Loc[1]+1, Loc[2]]) === JSON.stringify(x))
                break; 
    case West:  isMoveOK = Matrix.filter((x)=>JSON.stringify([Loc[0],Loc[1]-1, Loc[2]]) === JSON.stringify(x))
                break; 
  }
  return isMoveOK
}
 
const CanIMoveXYDir = CanIMove(TheMatrix)
const MovesFromHere = function(Here) {
  let IsInMatrix = TheMatrix.filter((x) => JSON.stringify(Here) === JSON.stringify(x)).length > 0 
  if (!IsInMatrix) return [[],[],[],[]]

  let CanIMoveDir = CanIMoveXYDir(Here)
  return [North, South, East, West].map((D) => CanIMoveDir(D))
}
const UnvisitedMovesFromHere = (AVisited) => (PossibleMoves) => 
                                  PossibleMoves.filter((x) => !AVisited.find((y) => JSON.stringify(y)==JSON.stringify(x[0]))) 
const StartEndSame = (sx,sy,ex,ey) => (sx == ex && sy == ey) ? true : false

const canStepInMultipleDirections = (Arr) => Arr.filter((x) => x.length > 0).length > 1
const IsArrived  = (NextStop, BOrD, EndX, EndY) => (NextStop[0] == EndX && NextStop[1] == EndY && NextStop[2] == BOrD)
const IsNotEmpty = (Arr) => Arr.length !== 0
const HasPStep   = (Psteps) => Psteps ? Psteps.find((x) => x.length > 0) : null
const FindPSteps = (PSteps) => PSteps.find((x) => x.length > 0)[0]
const ForkMe     = (PSteps, NextStop, Forks) => 
                    canStepInMultipleDirections ? AddUniquely(Forks, NextStop)
                                                : Forks.filter((x) => JSON.stringify(x) !== JSON.stringify(NextStop))

////////////
// Run It //
////////////

const run = (tests) => tests.map((ATest) => {
    var Visited = [];
    var Forks   = [];
    let [StartX, StartY, EndX, EndY] = MatrixBaseNormalizer(ATest)

    // REDUCE [0,1] -> "Binary" | "Decimal" | "Neither"
    let Ans = [0,1].reduce((acc, BOrD) => {
      if (IsArrived([StartX, StartY, BOrD], BOrD, EndX, EndY)) return BOrD ? "Decimal" : "Binary" 
      var PSteps =  UnvisitedMovesFromHere(Visited)(MovesFromHere([StartX, StartY, BOrD]))
      Visited.push([StartX, StartY, Matrix[StartX][StartY] ]) 
      var NextStop = HasPStep(PSteps) ? FindPSteps(PSteps) : null
      if (NextStop == null) return acc 

      while (NextStop) {
        Visited = AddUniquely(Visited, NextStop)
        if (IsArrived(NextStop, BOrD, EndX, EndY)) return BOrD ? "Decimal" : "Binary" 
        Forks = ForkMe(PSteps, NextStop, Forks)
        PSteps = UnvisitedMovesFromHere(Visited)(MovesFromHere([NextStop[0], NextStop[1], BOrD]))
        NextStop = HasPStep(PSteps) ? FindPSteps(PSteps) : null
        while (NextStop == null && Forks.length !== 0) {
          NewStart = Forks.pop()
          PSteps = UnvisitedMovesFromHere(Visited)(MovesFromHere([NewStart[0], NewStart[1], NewStart[2]]))
          NextStop = HasPStep(PSteps) ? FindPSteps(PSteps) : null
        }
      if (NextStop == null) return acc  
      }
    }, "Neither")
  //console.log(StartX, StartY, EndX, EndY, Ans)
  return Ans
})  

console.log(run(TestLines).join("\n"))

///////////////////////
// LOGGING FUNCTIONS //
///////////////////////
assert(run(TestLines).join(" ") == "Binary Decimal Neither", "correct")

//console.log("NumCols = ", NumCols)  
//console.log("NumRows = ", NumRows)  
console.log(Matrix)  
//console.log("NumTests = ", NumTests)  
//console.log("TestLines = ", TestLines)  
//console.log("MatrixToXY = ", TheMatrix)  
function assert(value, desc) {
  if (true) {
    console.log(value ? 'pass: ' + desc : 'fail: ' + desc);
  }
  else{
    return "";
  }
}

console.log("The End")  
