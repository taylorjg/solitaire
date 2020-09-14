import * as U from './utils.js'

export class Solitaire {
  // validMoves => [actionIndex]
  // makeMove(actionIndex)

  constructor() {
    const colRanges = [
      U.range(2, 5),
      U.range(2, 5),
      U.range(7),
      U.range(7),
      U.range(7),
      U.range(2, 5),
      U.range(2, 5)
    ]
    this._boardPositions = []
    colRanges.forEach((colRange, row) => {
      for (const col of colRange) {
        const boardPosition = [row, col]
        const key = Solitaire.makeBoardPositionKey(boardPosition)
        this._boardPositions[key] = boardPosition
      }
    })
  }

  static makeBoardPositionKey = ([row, col]) => `${row}-${col}`

  get boardPositions() {
    return this._boardPositions
  }
}
