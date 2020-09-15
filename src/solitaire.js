import * as U from './utils.js'

export class BoardPosition {

  constructor(row, col) {
    this._row = row
    this._col = col
    this._key = `${row}-${col}`
  }

  get row() { return this._row }
  get col() { return this._col }
  get key() { return this._key }

  sameAs = other => this.key === other.key

  static fromKey = key => {
    const [row, col] = key.split('-').map(Number)
    return new BoardPosition(row, col)
  }
}

const BOARD_POSITION_CENTRE = new BoardPosition(3, 3)

const UP = 0
const DOWN = 1
const LEFT = 2
const RIGHT = 3

function* boardPositionGenerator() {
  const colRanges = [
    U.range(2, 5),
    U.range(2, 5),
    U.range(7),
    U.range(7),
    U.range(7),
    U.range(2, 5),
    U.range(2, 5)
  ]
  let row = 0
  for (const colRange of colRanges) {
    for (const col of colRange) {
      yield new BoardPosition(row, col)
    }
    row += 1
  }
}

function* allPossibleActionsGenerator(boardPositions) {

  const isValidBoardPosition = boardPosition =>
    boardPositions.some(item => item.sameAs(boardPosition))

  const followDirection = (boardPosition, direction) => {
    const row = boardPosition.row
    const col = boardPosition.col
    switch (direction) {
      case UP: return new BoardPosition(row - 1, col)
      case DOWN: return new BoardPosition(row + 1, col)
      case LEFT: return new BoardPosition(row, col - 1)
      case RIGHT: return new BoardPosition(row, col + 1)
    }
  }

  for (const from of boardPositions) {
    for (const direction of [UP, DOWN, LEFT, RIGHT]) {
      const via = followDirection(from, direction)
      const to = followDirection(via, direction)
      if (isValidBoardPosition(from) &&
        isValidBoardPosition(via) &&
        isValidBoardPosition(to)) {
        yield { from, via, to }
      }
    }
  }
}

const BOARD_POSITIONS = Array.from(boardPositionGenerator())
const ALL_POSSIBLE_ACTIONS = Array.from(allPossibleActionsGenerator(BOARD_POSITIONS))

export class Solitaire {

  constructor() {
    this._boardState = {}
    this.reset()
  }

  get boardPositions() {
    return BOARD_POSITIONS
  }

  get actions() {
    return ALL_POSSIBLE_ACTIONS
  }

  get boardState() {
    return this._boardState
  }

  get validActions() {
    const validActions = []
    this.actions.forEach(action => {
      if (this._boardState[action.from.key] &&
        this._boardState[action.via.key] &&
        !this._boardState[action.to.key]) {
        validActions.push(action)
      }
    })
    return validActions
  }

  isValidMove = (from, to) =>
    Boolean(this._findAction(from, to))

  makeMove = (from, to) => {
    const action = this._findAction(from, to)
    if (action) {
      this._boardState[action.from.key] = false
      this._boardState[action.via.key] = false
      this._boardState[action.to.key] = true
    }
  }

  reset = () => {
    for (const boardPosition of this.boardPositions) {
      this._boardState[boardPosition.key] = true
    }
    this._boardState[BOARD_POSITION_CENTRE.key] = false
  }

  _findAction = (from, to) => {
    for (const action of this.validActions) {
      if (action.from.sameAs(from) && action.to.sameAs(to)) {
        return action
      }
    }
    return undefined
  }
}
