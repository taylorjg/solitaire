import * as U from './utils.js'

const CENTRE_X = 3
const CENTRE_Y = 3

const UP = 0
const DOWN = 1
const LEFT = 2
const RIGHT = 3

export class Solitaire {

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
    this._actions.forEach(action => {
      if (this._boardState[action.keyFrom] &&
        this._boardState[action.keyVia] &&
        !this._boardState[action.keyTo]) {
        validActions.push(action)
      }
    })
    return validActions
  }

  isValidMove = (from, to) =>
    Boolean(this.findAction(from, to))

  makeMove = (from, to) => {
    const action = this.findAction(from, to)
    if (action) {
      this._boardState[action.keyFrom] = false
      this._boardState[action.keyVia] = false
      this._boardState[action.keyTo] = true
    }
  }

  findAction = (from, to) => {
    for (const action of this.validActions) {
      if (Solitaire.sameBoardPosition(action.from, from) &&
        Solitaire.sameBoardPosition(action.to, to)) {
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
    for (const from of boardPositions) {
      for (const direction of [UP, DOWN, LEFT, RIGHT]) {
        const via = Solitaire.followDirection(from, direction)
        const to = Solitaire.followDirection(via, direction)
        if (Solitaire.isValidBoardPosition(boardPositions, via) &&
          Solitaire.isValidBoardPosition(boardPositions, to)) {
          const keyFrom = Solitaire.boardPositionToKey(from)
          const keyVia = Solitaire.boardPositionToKey(via)
          const keyTo = Solitaire.boardPositionToKey(to)
          actions.push({ from, via, to, keyFrom, keyVia, keyTo })
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
