import * as U from './utils.js'

export class BoardPosition {

  constructor(row, col) {
    this._row = row
    this._col = col
    this._key = `${row}:${col}`
  }

  get row() { return this._row }
  get col() { return this._col }
  get key() { return this._key }

  sameAs = other => this.key === other.key

  static fromKey = key => {
    const [row, col] = key.split(':').map(Number)
    return new BoardPosition(row, col)
  }
}

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

function* allPossibleActionsGenerator() {

  const isValidBoardPosition = boardPosition =>
    BOARD_POSITIONS.some(item => item.sameAs(boardPosition))

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

  for (const from of BOARD_POSITIONS) {
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
const BOARD_POSITION_CENTRE = new BoardPosition(3, 3)
const ALL_POSSIBLE_ACTIONS = Array.from(allPossibleActionsGenerator())

export class Solitaire {

  constructor() {
    this._boardState = new Map()
    this.reset()
  }

  get boardState() {
    return this._boardState
  }

  get done() {
    return this._validActions().length === 0
  }

  isValidMove = (from, to) =>
    Boolean(this._findAction(from, to))

  makeMove = (from, to) => {
    const action = this._findAction(from, to)
    this._makeMove(action)
  }

  makeMoveByActionIndex = actionIndex => {
    const action = ALL_POSSIBLE_ACTIONS[actionIndex]
    this._makeMove(action)
  }

  reset = () => {
    for (const boardPosition of BOARD_POSITIONS) {
      const value = !boardPosition.sameAs(BOARD_POSITION_CENTRE)
      this.boardState.set(boardPosition.key, value)
    }
  }

  _makeMove = action => {
    if (action) {
      this.boardState.set(action.from.key, false)
      this.boardState.set(action.via.key, false)
      this.boardState.set(action.to.key, true)
    }
  }

  _findAction = (from, to) => {
    for (const action of this._validActions()) {
      if (action.from.sameAs(from) && action.to.sameAs(to)) {
        return action
      }
    }
    return undefined
  }

  _validActions = () =>
    ALL_POSSIBLE_ACTIONS.filter(action =>
      this.boardState.get(action.from.key) &&
      this.boardState.get(action.via.key) &&
      !this.boardState.get(action.to.key)
    )
}

export class SolitaireEnv {

  constructor() {
    this._solitaire = new Solitaire()
  }

  get boardState() {
    return this._solitaire.boardState
  }

  get done() {
    return this._solitaire.done
  }

  get numActions() {
    return ALL_POSSIBLE_ACTIONS.length
  }

  action = (actionIndex) =>
    ALL_POSSIBLE_ACTIONS[actionIndex]

  get validActionIndices() {
    const indices = []
    ALL_POSSIBLE_ACTIONS.forEach((action, index) => {
      if (this.boardState.get(action.from.key) &&
        this.boardState.get(action.via.key) &&
        !this.boardState.get(action.to.key)) {
        indices.push(index)
      }
    })
    return indices
  }

  step = actionIndex => {
    this._solitaire.makeMoveByActionIndex(actionIndex)
    // TODO: return { observation, reward, done, info }
  }

  reset = () => {
    this._solitaire.reset()
    // TODO: return { observation, reward, done, info }
  }
}
