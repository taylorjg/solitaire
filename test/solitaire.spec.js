import { Solitaire } from '../src/solitaire.js'
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

  it('should successfully convert board position to key', () => {
    const boardPosition = [2, 6]
    const key = Solitaire.boardPositionToKey(boardPosition)
    expect(key).to.equal('2-6')
  })

  it('should successfully convert key to board position', () => {
    const key = '5-1'
    const boardPosition = Solitaire.keyToBoardPosition(key)
    expect(boardPosition).to.deep.equal([5, 1])
  })

  // TODO:
  // makeMove()
  // reset()
})
