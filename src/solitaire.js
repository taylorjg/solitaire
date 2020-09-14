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

  get actions() {
    return this._actions
  }

  get validActions() {
    const validActions = []
    this._actions.forEach((action, index) => {
      const keyBoardPosition = Solitaire.boardPositionToKey(action.boardPosition)
      const keyNextPos1 = Solitaire.boardPositionToKey(action.nextPos1)
      const keyNextPos2 = Solitaire.boardPositionToKey(action.nextPos2)
      if (this._boardState[keyBoardPosition] &&
        this._boardState[keyNextPos1] &&
        !this._boardState[keyNextPos2]) {
        validActions.push(action)
      }
    })
    return validActions
  }

  isValidMove = (boardPosition, nextPos2) => {
    const action = this.findAction(boardPosition, nextPos2)
    return Boolean(action)
  }

  makeMove = (boardPosition, nextPos2) => {
    const action = this.findAction(boardPosition, nextPos2)
    if (action) {
      const keyBoardPosition = Solitaire.boardPositionToKey(action.boardPosition)
      const keyNextPos1 = Solitaire.boardPositionToKey(action.nextPos1)
      const keyNextPos2 = Solitaire.boardPositionToKey(action.nextPos2)
      this._boardState[keyBoardPosition] = false
      this._boardState[keyNextPos1] = false
      this._boardState[keyNextPos2] = true
    }
  }

  findAction = (boardPosition, nextPos2) => {
    for (const action of this.validActions) {
      if (Solitaire.sameBoardPosition(action.boardPosition, boardPosition) &&
        Solitaire.sameBoardPosition(action.nextPos2, nextPos2)) {
        return action
      }
    }
    return undefined
  }

  reset = () => {
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
    const actions = []
    for (const boardPosition of boardPositions) {
      for (const direction of DIRECTIONS) {
        const nextPos1 = Solitaire.followDirection(boardPosition, direction)
        const nextPos2 = Solitaire.followDirection(nextPos1, direction)
        if (Solitaire.isValidBoardPosition(boardPositions, nextPos1) &&
          Solitaire.isValidBoardPosition(boardPositions, nextPos2)) {
          actions.push({
            boardPosition,
            nextPos1,
            nextPos2,
            direction
          })
        }
      }
    }
    return actions
  }

  static followDirection = (boardPosition, direction) => {
    const [row, col] = boardPosition
    switch (direction) {
      case UP: return [row - 1, col]
      case DOWN: return [row + 1, col]
      case LEFT: return [row, col - 1]
      case RIGHT: return [row, col + 1]
    }
  }

  static isValidBoardPosition = (boardPositions, boardPosition) => {
    const index = boardPositions.findIndex(item => Solitaire.sameBoardPosition(item, boardPosition))
    return index >= 0
  }

  static sameBoardPosition = (pos1, pos2) =>
    pos1[0] === pos2[0] && pos1[1] === pos2[1]
}
