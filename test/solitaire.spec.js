import { Solitaire, BoardPosition } from '../src/solitaire.js'
import chai from 'chai'
const expect = chai.expect

describe('Solitaire class', () => {

  it('should have the expected number of board positions', () => {
    const solitaire = new Solitaire()
    expect(solitaire.boardPositions).to.have.lengthOf(33)
  })

  it('should have the expected number of possible actions', () => {
    const solitaire = new Solitaire()
    expect(solitaire.actions).to.have.lengthOf(76)
  })

  it('should have the expected number of initial pieces', () => {
    const solitaire = new Solitaire()
    const occupiedKvps = Object.entries(solitaire.boardState).filter(([, value]) => value)
    const unoccupiedKvps = Object.entries(solitaire.boardState).filter(([, value]) => !value)
    expect(occupiedKvps).to.have.lengthOf(32)
    expect(unoccupiedKvps).to.have.lengthOf(1)
    const unoccupiedBoardPositionKey = unoccupiedKvps[0][0]
    expect(unoccupiedBoardPositionKey).to.equal('3-3')
  })

  it('should have the expected number of initial valid actions', () => {
    const solitaire = new Solitaire()
    expect(solitaire.validActions).to.have.lengthOf(4)
  })

  // TODO:
  // validActions()
  // isValidMove()
  // makeMove()
  // reset()
})

describe('BoardPosition class', () => {

  it('should successfully construct BoardPosition', () => {
    const boardPosition = new BoardPosition(2, 6)
    expect(boardPosition.row).to.equal(2)
    expect(boardPosition.col).to.equal(6)
    expect(boardPosition.key).to.equal('2-6')
  })

  it('should successfully convert key to board position', () => {
    const key = '5-1'
    const boardPosition = BoardPosition.fromKey(key)
    expect(boardPosition.row).to.equal(5)
    expect(boardPosition.col).to.equal(1)
    expect(boardPosition.key).to.equal('5-1')
  })

  it('should recognise same board positions', () => {
    const boardPosition1 = new BoardPosition(3, 4)
    const boardPosition2 = new BoardPosition(3, 4)
    expect(boardPosition1.sameAs(boardPosition2)).to.be.true
    expect(boardPosition2.sameAs(boardPosition1)).to.be.true
  })

  it('should recognise different board positions', () => {
    const boardPosition1 = new BoardPosition(3, 4)
    const boardPosition2 = new BoardPosition(4, 4)
    expect(boardPosition1.sameAs(boardPosition2)).to.be.false
    expect(boardPosition2.sameAs(boardPosition1)).to.be.false
  })
})
