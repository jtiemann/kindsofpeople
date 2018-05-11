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
    case North: isMoveOK = Loc[0]+1 <  NumRows && Matrix[Loc[0]+1][Loc[1]] === Loc[2] ? [[Loc[0]+1,Loc[1], Loc[2]]] : []
                break; 
    case South: isMoveOK = Loc[0]-1 >= 0       && Matrix[Loc[0]-1][Loc[1]] === Loc[2] ? [[Loc[0]-1,Loc[1], Loc[2]]]: []
                break; 
    case East:  isMoveOK = Loc[1]+1 <  NumCols && Matrix[Loc[0]][Loc[1]+1] === Loc[2] ? [[Loc[0],Loc[1]+1, Loc[2]]]: []
                break; 
    case West:  isMoveOK = Loc[1]-1 >= 0       && Matrix[Loc[0]][Loc[1]-1] === Loc[2] ? [[Loc[0],Loc[1]-1, Loc[2]]]: []
                break; 
  }
  return isMoveOK
}
 
const CanIMoveXYDir = CanIMove(Matrix)
const MovesFromHere = function(Here) {
  let IsInMatrix = Matrix[Here[0]][Here[1]] === Here[2] 
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


////////////////////
// Data Structure //
////////////////////

//Initial State
theData = {
  Matrix: Matrix,
  Visited: [],
  Forks: [],
  CurrentLocation: [0,0],
  StartEnd: {"StartX":0, "StartY":0, "EndX":0, "EndY":0},
  MatrixBaseNormalizer: (ATest) => [ATest[0][0]-1, ATest[0][1]-1, ATest[1][0]-1, ATest[1][1]-1],

  
}


///////////////
// STATE API //
///////////////

const Rx = require('rxjs')
const R = require('ramda')
R.hasPath = path => R.compose(x => !!x, R.path(path))
const INITIAL_STATE = theData

const STATE = (function(initialState={}){
  let write$ = (new Rx.Subject())
  let updateFn = changeFn => {
    const updateState = changeFn => currentState => {
    return {...(changeFn(currentState)) } 
     // return Object.assign({}, changeFn(currentState))
    }
    write$.next(updateState(changeFn))
  }
  let theTbone$ = write$
    .startWith(theState => theState)
    .scan((acc, fn) => fn(acc), initialState)
    .publish().refCount()
    
  return { read$: theTbone$, update: updateFn }
}(INITIAL_STATE))

////////////
// Run It //
////////////
//STATE.read$.subscribe()
const run = (tests) => tests.map((ATest) => {
  /*
   initialize 
   --internal structures,
   --normalize start/end coords 
     (1,1) -> (0,0)
  */
    STATE.update(R.compose(R.assocPath(['Visited'], [])))
    //theData.Visited = [];
    STATE.update(R.compose(R.assocPath(['Forks'], [])))
    //theData.Forks   = [];
    let [StartX, StartY, EndX, EndY] = theData.MatrixBaseNormalizer(ATest)
    STATE.update(R.compose(R.assocPath(['StartEnd'], {StartX,StartY,EndX,EndY})))
    //theData.StartEnd = {StartX,StartY,EndX,EndY}

  /*
   first try Decimal then try Binary, default output is Neither
   REDUCE [0,1] -> "Binary" | "Decimal" | "Neither"
  */ 
    let Ans = [0,1].reduce((acc, BOrD) => {
  /*
   Edge case: Start and End are the same
  */
      if (IsArrived([StartX, StartY, BOrD], BOrD, EndX, EndY)) return BOrD ? "Decimal" : "Binary" 
  /* 
   can I move from here? If I can then take a step, else this test with current kind (0/1) failed. 
  */      
      var PSteps =  UnvisitedMovesFromHere(theData.Visited)(MovesFromHere([StartX, StartY, BOrD]))
      theData.Visited.push([StartX, StartY, Matrix[StartX][StartY] ]) 
      STATE.update(R.compose(R.assocPath(['Visited'], theData.Visited)))

      var NextStop = HasPStep(PSteps) ? FindPSteps(PSteps) : null
      if (NextStop == null) return acc 
  /* 
    now cycle through: step
                           ->have I arrived ? return 
                                            : ->take step if can ? update forks (cells with multiple possible steps) 
                                                                 : pop a fork try taking a step
  */

  /*
  walking = (nextstop) => {
     [nextstop].map((nxt) => {Visited = AddUniquely(Visited, NextStop)); return nxt}
               .map()...

  }
  */
      while (NextStop) {
        //console.log("NextStop: ", NextStop)
        //transform Visited
        STATE.update(R.compose(R.assocPath(['Visited'], AddUniquely(theData.Visited, NextStop))))
        //theData.Visited = AddUniquely(theData.Visited, NextStop)
        //test for success
        if (IsArrived(NextStop, BOrD, EndX, EndY)) return BOrD ? "Decimal" : "Binary"
        //transform Forks
        STATE.update(R.compose(R.assocPath(['Forks'], ForkMe(PSteps, NextStop, theData.Forks))))
        //theData.Forks = ForkMe(PSteps, NextStop, theData.Forks)

        PSteps = UnvisitedMovesFromHere(theData.Visited)(MovesFromHere([NextStop[0], NextStop[1], BOrD]))
        //transform NextStop
        NextStop = HasPStep(PSteps) ? FindPSteps(PSteps) : null

        while (NextStop == null && theData.Forks.length !== 0) {
          NewStart = theData.Forks.pop()
          STATE.update(R.compose(R.assocPath(['Forks'], theData.Forks)))
          PSteps = UnvisitedMovesFromHere(theData.Visited)(MovesFromHere([NewStart[0], NewStart[1], NewStart[2]]))
          NextStop = HasPStep(PSteps) ? FindPSteps(PSteps) : null
        }
      if (NextStop == null) return acc  
      }
    }, "Neither")
  //console.log(StartX, StartY, EndX, EndY, Ans)
  return Ans
})  

//console.log(run(TestLines).join("\n"))

///////////////////////
// LOGGING FUNCTIONS //
///////////////////////

const jack = run(TestLines).join(" ")
console.log("Ans: ", jack)
assert(jack == "Binary Decimal Neither", "outcome: ")

//console.log("NumCols = ", NumCols)  
//console.log("NumRows = ", NumRows)  
console.log(Matrix)  
//console.log("NumTests = ", NumTests)  
//console.log("TestLines = ", TestLines)  
//console.log("MatrixToXY = ", TheMatrix)  
function assert(value, desc) {
  if (true) {
    console.log("value: ",value)
    console.log(value ? desc + 'passed! '  :   desc + 'failure...');
  }
  else{
    return "";
  }
}

console.log("The End")  
