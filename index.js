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
  4
  2 3 8 16
  8 1 7 3
  1 1 10 20
  2 3 8 16
  `
  const range = (start,end) => { let data=[]; for (i=start;i<end;i++){ data.push(i)}; return data}

  const randomMazeGenerator = (rows) => (cols) => {
    let data = []
    return range(0,rows).map((row)=>range(0,cols).map((col) => Math.round(Math.random() + .2) ))
  }
  const randomTestGenerator = (maze) => (rows) => (cols) => (num) => {
    let jack
     return se =  range(0,num).map(() => {
       do {  jack = [
        [Math.floor(Math.random()*rows), Math.floor(Math.random()*cols)],
        [Math.floor(Math.random()*rows), Math.floor(Math.random()*cols)]
        ]
      }
        while ( maze[jack[0][0]][jack[0][1]] !== maze[jack[1][0]][jack[1][1]] )
        return jack
   })
  }
  let rmaze = randomMazeGenerator(20)(40)
  let rtests = randomTestGenerator(rmaze)(20)(40)(1)

////////////////
// PARSE DATA //
////////////////

  let Lines      = OrigData.split("\n")
  let RowColLine = Lines[0]
  let NumCols    = parseInt(RowColLine.split(" ")[1] ,10)
  let NumRows    = parseInt( RowColLine.split(" ")[0],10)
  let Matrix     = rmaze
    

  ////////////////////
  // Data Structure //
  ////////////////////

  const sub1 = (x) => x - 1
  const FindPossibleSteps = (PossibleSteps,dest) => PossibleSteps.find((x) => x.length > 0)[0]
  const MarcoPoloOptimization  = (PossibleSteps,dest) =>  PossibleSteps.filter(x=>x.length>0).sort((x,y)=>distanceToDestination(x[0],dest) > distanceToDestination(y[0],dest))[0][0]

  //Initial State
  theData = {
    kinds: {binary: 0, decimal:1},
    Matrix: Matrix,
    rulesets:[MarcoPoloOptimization,FindPossibleSteps],
    currentRuleset:null,
    currentTestLine:null,
    TestLines: rtests,
    Visited: [],
    Forks: [],
    aTest:[],
    canvasIdx:0
  }

//////////////////////
// HELPER FUNCTIONS //
//////////////////////
  const _pipe = (f, g) => (...args) => g(f(...args))
  const pipe = (...fns) => fns.reduce(_pipe)
  const compose = (...fns) => fns.reduceRight(_pipe)

  const North      = Symbol()
  const South      = Symbol()
  const East       = Symbol()
  const West       = Symbol()
  const Directions = [North, South, East, West]

  const Binary     = Symbol()
  const Decimal    = Symbol()
  const Neither    = Symbol()

  const MatrixTestNormalizerf = theData => { return {...theData, TestLines: TestLines.map((rows)=>rows.map((col)=>col.map(sub1)))}}
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/////////////////////
// LOGIC FUNCTIONS //
/////////////////////

  const CanIMove = (Matrix) => (Loc) => (Dir) => {
   let isMoveOK
    switch (Dir) {
      case North: isMoveOK = Loc[0]+1 <  theData.Matrix.length && theData.Matrix[Loc[0]+1][Loc[1]] === Loc[2] ? [[Loc[0]+1,Loc[1], Loc[2]]] : []
                  break; 
      case South: isMoveOK = Loc[0]-1 >= 0       && theData.Matrix[Loc[0]-1][Loc[1]] === Loc[2] ? [[Loc[0]-1,Loc[1], Loc[2]]]: []
                  break; 
      case East:  isMoveOK = Loc[1]+1 <  theData.Matrix[0].length && theData.Matrix[Loc[0]][Loc[1]+1] === Loc[2] ? [[Loc[0],Loc[1]+1, Loc[2]]]: []
                  break; 
      case West:  isMoveOK = Loc[1]-1 >= 0       && theData.Matrix[Loc[0]][Loc[1]-1] === Loc[2] ? [[Loc[0],Loc[1]-1, Loc[2]]]: []
                  break; 
    }
    return isMoveOK
  }

  const MovesFromHere = (td) => Here => {
    const IsInMatrix = td.Matrix[Here[0]][Here[1]] === Here[2] 
    if (!IsInMatrix) return [[],[],[],[]]
    const CanIMoveDir = CanIMove(td)(Here)
    return Directions.map((D) => CanIMoveDir(D))
  }
  const UnvisitedMovesFromHere = (AVisited) => (PossibleMoves) => 
                                    PossibleMoves.filter((x) => !AVisited.find((y) => JSON.stringify(y)==JSON.stringify(x[0]))) 

  const canStepInMultipleDirections = (Arr) => Arr.filter((x) => x.length > 0).length > 1
  const IsArrived          = (NextStop, BOrD, EndX, EndY) => (NextStop[0] == EndX && NextStop[1] == EndY && NextStop[2] == BOrD)
  const HasPossibleStep    = (PossibleSteps) => PossibleSteps ? PossibleSteps.find((x) => x.length > 0) : null
  const distanceToDestination = (coord, dest) => Math.pow((coord[0] - dest[0]), 2) + Math.pow((coord[1] - dest[1]), 2)
  const ForkMe     = (PossibleSteps, NextStop, Forks) => 
                      canStepInMultipleDirections ? Forks.concat([NextStop])
                                                  : Forks.filter((x) => JSON.stringify(x) !== JSON.stringify(NextStop))

////////////////////
// RENDER HELPERS //
////////////////////

  const createCanvas = (idx) => {
    let jack = document.createElement("canvas")
    jack.id = idx
    jack.width = "2000"
    jack.height = "700"
    document.body.appendChild(jack)
  }

  const renderMaze = (canvasSelector) => (matrix) => (rrc, rgc) => {
    matrix.map((row, rowidx) => row.map((col, colidx) => col==0 ? rgc([rowidx,colidx]) : rrc([rowidx,colidx]) ))
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

  const doRenderMazef = (theData) => {
    const idx = theData.canvasIdx
    const testLineIndex = theData.currentTestLine
    createCanvas(idx)
    const renderRedCell   = renderCell([255,0,0])(idx)
    const renderGreenCell = renderCell([0,255,128])(idx)
    renderMaze(idx)(theData.Matrix)(renderRedCell, renderGreenCell)
    renderLetter(idx)("S")(theData.TestLines[testLineIndex][0])
    renderLetter(idx)("X")(theData.TestLines[testLineIndex][1]) 
    return theData
  }

///////////////////////
// TRAVERSAL HELPERS //
///////////////////////

  async function walk(rule, idx, NextStop, theData, kindValue, [{StartX, StartY, EndX, EndY}]) {
    kindValue == 0 ? renderCell([128,0,128])(idx)(NextStop) : renderCell([128,128,128])(idx)(NextStop)
    await sleep(10)
    if (IsArrived(NextStop, kindValue, EndX, EndY)) return !!kindValue ? "Decimal" : "Binary"

    const PossibleSteps = UnvisitedMovesFromHere(theData.Visited)(MovesFromHere({...theData})([NextStop[0], NextStop[1], kindValue])).filter(x=>x!==[])
    const vis           = theData.Visited.concat([NextStop])
    const fks           = theData.Forks
    theData             = {...theData, Visited: vis, Forks: ForkMe(PossibleSteps, NextStop, fks)}
    NextStop            = HasPossibleStep(PossibleSteps) ? rule(PossibleSteps, [EndX, EndY]) : null
    return (NextStop === null && theData.Forks.length !== 0) ? walkFork(rule, idx, {...theData}, kindValue, [{StartX, StartY, EndX, EndY}])
                                                             : (NextStop === null) ? "Neither"
                                                             : walk(rule, idx, NextStop, {...theData}, kindValue, [{StartX, StartY, EndX, EndY}])
  }

  const walkFork = (rule, idx, theData,kindValue, [{StartX, StartY, EndX, EndY}]) => {
    const NewStart      = theData.Forks.pop() // mutates theData! 
    const PossibleSteps = UnvisitedMovesFromHere(theData.Visited)(MovesFromHere({...theData})([NewStart[0], NewStart[1], NewStart[2]]))
    const NextStop      = HasPossibleStep(PossibleSteps) ? rule(PossibleSteps, [EndX, EndY]) : null
    
    return (NextStop === null && theData.Forks.length !== 0) ? walkFork(rule, idx, {...theData}, kindValue, [{StartX, StartY, EndX, EndY}])
                                                             : (NextStop === null) ? "Neither"
                                                             : walk(rule, idx, NextStop, {...theData}, kindValue, [{StartX, StartY, EndX, EndY}])
  }

  const walkIt = (theData) => {
    const idx                            = theData.canvasIdx
    const rule                           = theData.currentRuleset
    const testIdx                        = theData.currentTestLine
    const [[StartX,StartY],[EndX, EndY]] = theData.TestLines[testIdx]

    return Object.values(theData.kinds).reduce((acc, kindValue) => {
      return IsArrived([StartX, StartY, theData.Matrix[StartX][StartY]], kindValue, EndX, EndY) ? (!!kindValue ? "Decimal" : "Binary")
                     : theData.Matrix[EndX][EndY] !== kindValue || !HasPossibleStep(MovesFromHere({...theData})([StartX, StartY, kindValue])) ? acc 
                     : walk(rule, idx, [StartX, StartY, theData.Matrix[StartX][StartY]], {...theData}, kindValue, [{StartX, StartY, EndX, EndY}])
    }, "Neither")
  }

////////////
// Run It //
////////////

  let renderAndWalk = pipe(doRenderMazef, walkIt)
  results = theData.TestLines.map( (u,idx)=>
    theData.rulesets.map((rs, idx2) => 
      renderAndWalk({...theData, canvasIdx:idx+10*(idx2), currentTestLine:idx, currentRuleset:rs})) )

  results[0].map((p)=>p.then((r)=> console.log(Date(Date.now()), r)))
  ///////////////////////
  // LOGGING FUNCTIONS //
  ///////////////////////

  //console.log(theData)
   
  function assert(value, desc) {
    if (true) {
      console.log(value ? desc + 'passed! '  :   desc + 'failure...');
    }
    else{
      return "";
    }
  }

  console.log("The End")  
