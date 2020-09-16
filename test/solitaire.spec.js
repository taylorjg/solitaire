import { Solitaire, SolitaireEnv, BoardPosition } from '../src/solitaire.js'
import chai from 'chai'
const expect = chai.expect

describe('Solitaire class', () => {

  it('should have the expected initial state', () => {
    const solitaire = new Solitaire()
    const boardStateEntries = Array.from(solitaire.boardState.entries())
    const occupiedKvps = boardStateEntries.filter(([, value]) => value === true)
    const unoccupiedKvps = boardStateEntries.filter(([, value]) => value === false)
    expect(occupiedKvps).to.have.lengthOf(32)
    expect(unoccupiedKvps).to.have.lengthOf(1)
    const unoccupiedBoardPositionKey = unoccupiedKvps[0][0]
    expect(unoccupiedBoardPositionKey).to.equal('3:3')
  })

  // isValidMove()
  // makeMove()
  // reset()
})

describe('SolitaireEnv class', () => {

  // it('should have the expected number of initial valid actions', () => {
  //   const solitaireEnv = new SolitaireEnv()
  //   expect(solitaireEnv.validActions).to.have.lengthOf(4)
  // })

  // it('should have the expected number of possible actions', () => {
  //   const solitaireEnv = new SolitaireEnv()
  //   expect(solitaireEnv.actions).to.have.lengthOf(76)
  // })
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
