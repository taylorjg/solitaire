import * as U from './utils.js'

const CENTRE_X = 3
const CENTRE_Y = 3

const UP = 0
const DOWN = 1
const LEFT = 2
const RIGHT = 3

const DIRECTIONS = [UP, DOWN, LEFT, RIGHT]

export class Solitaire {
  // validMoves => [actionIndex]
  // makeMove(actionIndex)

  constructor() {
    this._boardPositions = Solitaire.createBoardPositons()
    this._boardState = {}
    this._actions = Solitaire.allPossibleActions(this._boardPositions)
    this.reset()
  }

  get boardPositions() {
    return this._boardPositions
  }

  get boardState() {
    return this._boardState
  }

  reset() {
    for (const boardPosition of this.boardPositions) {
      const key = Solitaire.boardPositionToKey(boardPosition)
      this._boardState[key] = true
    }
    const keyCentre = Solitaire.boardPositionToKey([CENTRE_X, CENTRE_Y])
    this._boardState[keyCentre] = false
  }

  static boardPositionToKey = ([row, col]) => `${row}-${col}`
  static keyToBoardPosition = key => key.split('-').map(Number)

  static createBoardPositons = () => {
    const colRanges = [
      U.range(2, 5),
      U.range(2, 5),
      U.range(7),
      U.range(7),
      U.range(7),
      U.range(2, 5),
      U.range(2, 5)
    ]
    const boardPositions = []
    colRanges.forEach((colRange, row) => {
      for (const col of colRange) {
        boardPositions.push([row, col])
      }
    })
    return boardPositions
  }

  static allPossibleActions = boardPositions => {
    return []
  }
}
