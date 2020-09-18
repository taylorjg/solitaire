import { Solitaire, SolitaireEnv, BoardPosition } from '../src/solitaire.js'
import chai from 'chai'
const expect = chai.expect

const solution = [
  68,
  49, 71, 33, 75, 71,
  5, 11, 20, 46, 11,
  27, 3, 40, 1, 3,
  69, 65, 57, 28, 65,
  20, 12, 49, 57, 62, 27,
  39, 7, 35, 44
]

const expectInitialBoardState = boardState => {
  const boardStateEntries = Array.from(boardState.entries())
  const occupiedKvps = boardStateEntries.filter(([, value]) => value === true)
  const unoccupiedKvps = boardStateEntries.filter(([, value]) => value === false)
  expect(occupiedKvps).to.have.lengthOf(32)
  expect(unoccupiedKvps).to.have.lengthOf(1)
  const unoccupiedBoardPositionKey = unoccupiedKvps[0][0]
  expect(unoccupiedBoardPositionKey).to.equal('3:3')
}

const expectSolvedBoardState = boardState => {
  const boardStateEntries = Array.from(boardState.entries())
  const occupiedKvps = boardStateEntries.filter(([, value]) => value === true)
  const unoccupiedKvps = boardStateEntries.filter(([, value]) => value === false)
  expect(occupiedKvps).to.have.lengthOf(1)
  expect(unoccupiedKvps).to.have.lengthOf(32)
  const occupiedBoardPositionKey = occupiedKvps[0][0]
  expect(occupiedBoardPositionKey).to.equal('3:3')
}

describe('Solitaire class', () => {

  it('should have the expected initial state', () => {
    const solitaire = new Solitaire()
    expectInitialBoardState(solitaire.boardState)
  })

  it('should have single piece left in centre after making all solution moves', () => {

    const solitaire = new Solitaire()
    expect(solitaire.done).to.be.false
    expect(solitaire.solved).to.be.false

    for (const actionIndex of solution) {
      solitaire.makeMoveByActionIndex(actionIndex)
    }
    expectSolvedBoardState(solitaire.boardState)
    expect(solitaire.done).to.be.true
    expect(solitaire.solved).to.be.true

    solitaire.reset()
    expect(solitaire.done).to.be.false
    expect(solitaire.solved).to.be.false
  })

  // TODO: add tests for:
  // - isValidMove() => true
  // - isValidMove() => false
  // - makeMove()
  // - reset()
})

describe('SolitaireEnv class', () => {

  it('should have the expected initial state', () => {
    const solitaireEnv = new SolitaireEnv()
    expectInitialBoardState(solitaireEnv.boardState)
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
    expectSolvedBoardState(solitaireEnv.boardState)
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

    const boardStateEntries = Array.from(solitaireEnv.boardState.entries())
    const occupiedKvps = boardStateEntries.filter(([, value]) => value === true)
    const unoccupiedKvps = boardStateEntries.filter(([, value]) => value === false)
    expect(occupiedKvps).to.have.lengthOf(32 - numMoves)
    expect(unoccupiedKvps).to.have.lengthOf(1 + numMoves)

    solitaireEnv.reset()

    expectInitialBoardState(solitaireEnv.boardState)
  })
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
