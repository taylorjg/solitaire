import { Solitaire, SolitaireEnv, BoardPosition, BoardStateValues } from '../src/solitaire.js'
import chai from 'chai'
const expect = chai.expect

const solution = [68, 49, 71, 33, 75, 71, 5, 11, 20, 46, 11, 27, 3, 40, 1, 3, 69, 65, 57, 28, 65, 20, 12, 49, 57, 62, 27, 39, 7, 35, 44]
const almostSolution = [31, 66, 15, 11, 70, 20, 41, 8, 66, 0, 38, 13, 74, 48, 46, 41, 72, 29, 45, 74, 11, 4, 41, 65, 69, 20, 40, 9, 0, 13]
// const terribleSequence = [44, 35, 30, 68, 19, 2]

const expectInitialBoardState = solitaire => {
  expect(solitaire.occupiedBoardPositions).to.have.lengthOf(32)
  expect(solitaire.unoccupiedBoardPositions).to.have.lengthOf(1)
  expect(solitaire.unoccupiedBoardPositions[0].key).to.equal('3:3')
}

const expectSolvedBoardState = solitaire => {
  expect(solitaire.occupiedBoardPositions).to.have.lengthOf(1)
  expect(solitaire.occupiedBoardPositions[0].key).to.equal('3:3')
  expect(solitaire.unoccupiedBoardPositions).to.have.lengthOf(32)
}

const expectBoardState = (solitaire, numMoves) => {
  expect(solitaire.occupiedBoardPositions).to.have.lengthOf(32 - numMoves)
  expect(solitaire.unoccupiedBoardPositions).to.have.lengthOf(1 + numMoves)
}

describe('Solitaire class', () => {

  it('should have the expected initial state', () => {
    const solitaire = new Solitaire()
    expectInitialBoardState(solitaire)
    expect(solitaire.done).to.be.false
    expect(solitaire.solved).to.be.false
  })

  it('should correctly identify a valid move', () => {
    const solitaire = new Solitaire()
    const from = new BoardPosition(3, 1)
    const to = new BoardPosition(3, 3)
    const actual = solitaire.isValidMove(from, to)
    expect(actual).to.be.true
  })

  it('should correctly identify an invalid move', () => {
    const solitaire = new Solitaire()
    const from = new BoardPosition(3, 2)
    const to = new BoardPosition(3, 3)
    const actual = solitaire.isValidMove(from, to)
    expect(actual).to.be.false
  })

  it('should correctly make a move', () => {
    const solitaire = new Solitaire()
    const from = new BoardPosition(3, 1)
    const via = new BoardPosition(3, 2)
    const to = new BoardPosition(3, 3)
    solitaire.makeMove(from, to)
    expectBoardState(solitaire, 1)
    const pluckKey = boardPosition => boardPosition.key
    const occupiedKeys = solitaire.occupiedBoardPositions.map(pluckKey)
    const unoccupiedKeys = solitaire.unoccupiedBoardPositions.map(pluckKey)
    expect(unoccupiedKeys).to.include(from.key)
    expect(unoccupiedKeys).to.include(via.key)
    expect(occupiedKeys).to.include(to.key)
  })

  it('should correctly reset', () => {
    const solitaire = new Solitaire()
    for (const actionIndex of solution) {
      solitaire.makeMoveByActionIndex(actionIndex)
    }
    expectSolvedBoardState(solitaire)
    expect(solitaire.done).to.be.true
    expect(solitaire.solved).to.be.true
    solitaire.reset()
    expectInitialBoardState(solitaire)
    expect(solitaire.done).to.be.false
    expect(solitaire.solved).to.be.false
  })

  it('should correctly identify when game is done', () => {
    const solitaire = new Solitaire()
    for (const actionIndex of solution) {
      solitaire.makeMoveByActionIndex(actionIndex)
    }
    expect(solitaire.done).to.be.true
  })

  it('should correctly identify when game is not done', () => {
    const solitaire = new Solitaire()
    for (const actionIndex of solution.slice(0, -1)) {
      solitaire.makeMoveByActionIndex(actionIndex)
    }
    expect(solitaire.done).to.be.false
  })

  it('should correctly identify when done game is solved', () => {
    const solitaire = new Solitaire()
    for (const actionIndex of solution) {
      solitaire.makeMoveByActionIndex(actionIndex)
    }
    expect(solitaire.done).to.be.true
    expect(solitaire.solved).to.be.true
  })

  it('should correctly identify when done game is not solved', () => {
    const solitaire = new Solitaire()
    for (const actionIndex of almostSolution) {
      solitaire.makeMoveByActionIndex(actionIndex)
    }
    expect(solitaire.done).to.be.true
    expect(solitaire.solved).to.be.false
  })

  it('should have single piece left in centre after making all solution moves', () => {
    const solitaire = new Solitaire()
    for (const actionIndex of solution) {
      solitaire.makeMoveByActionIndex(actionIndex)
    }
    expectSolvedBoardState(solitaire)
  })
})

describe('SolitaireEnv class', () => {

  it('should have the expected initial state', () => {
    const solitaireEnv = new SolitaireEnv()
    expectInitialBoardState(solitaireEnv)
  })

  it('should have the expected number of possible actions', () => {
    const solitaireEnv = new SolitaireEnv()
    expect(solitaireEnv.numActions).to.equal(76)
  })

  it('should have the expected number of initial valid action indices', () => {
    const solitaireEnv = new SolitaireEnv()
    expect(solitaireEnv.validActionIndices).to.have.lengthOf(4)
  })

  it('should have single piece left in centre after stepping through solution', () => {
    const solitaireEnv = new SolitaireEnv()
    expect(solitaireEnv.done).to.be.false
    expect(solitaireEnv.solved).to.be.false
    for (const actionIndex of solution) {
      solitaireEnv.step(actionIndex)
    }
    expectSolvedBoardState(solitaireEnv)
    expect(solitaireEnv.done).to.be.true
    expect(solitaireEnv.solved).to.be.true
    solitaireEnv.reset()
    expect(solitaireEnv.done).to.be.false
    expect(solitaireEnv.solved).to.be.false
  })

  it('should reset board properly after making a number of moves', () => {
    const numMoves = 10
    const solitaireEnv = new SolitaireEnv()
    for (const actionIndex of solution.slice(0, numMoves)) {
      solitaireEnv.step(actionIndex)
    }
    expectBoardState(solitaireEnv, numMoves)
    solitaireEnv.reset()
    expectInitialBoardState(solitaireEnv)
  })

  // TODO: add tests re:
  // - observation, reward, done
  // - reset
})

describe('BoardPosition class', () => {

  it('should successfully construct BoardPosition', () => {
    const boardPosition = new BoardPosition(2, 6)
    expect(boardPosition.row).to.equal(2)
    expect(boardPosition.col).to.equal(6)
    expect(boardPosition.key).to.equal('2:6')
  })

  it('should successfully create board position from key', () => {
    const key = '5:1'
    const boardPosition = BoardPosition.fromKey(key)
    expect(boardPosition.row).to.equal(5)
    expect(boardPosition.col).to.equal(1)
    expect(boardPosition.key).to.equal('5:1')
  })

  it('should recognise same board position', () => {
    const boardPosition1 = new BoardPosition(3, 4)
    const boardPosition2 = new BoardPosition(3, 4)
    expect(boardPosition1.sameAs(boardPosition2)).to.be.true
    expect(boardPosition2.sameAs(boardPosition1)).to.be.true
  })

  it('should recognise different board position', () => {
    const boardPosition1 = new BoardPosition(3, 4)
    const boardPosition2 = new BoardPosition(4, 4)
    expect(boardPosition1.sameAs(boardPosition2)).to.be.false
    expect(boardPosition2.sameAs(boardPosition1)).to.be.false
  })
})
