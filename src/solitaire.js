import * as U from './utils.js'

const CENTRE_X = 3
const CENTRE_Y = 3

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
      yield [row, col]
    }
    row += 1
  }
}

// function* allPossibleActionsGenerator(boardPositions) {

//   const isValidBoardPosition = boardPosition => {
//     const index = boardPositions.findIndex(item => Solitaire.sameBoardPosition(item, boardPosition))
//     return index >= 0
//   }

//   const followDirection = (boardPosition, direction) => {
//     const [row, col] = boardPosition
//     switch (direction) {
//       case UP: return [row - 1, col]
//       case DOWN: return [row + 1, col]
//       case LEFT: return [row, col - 1]
//       case RIGHT: return [row, col + 1]
//     }
//   }

//   for (const from of boardPositions) {
//     for (const direction of [UP, DOWN, LEFT, RIGHT]) {
//       const via = followDirection(from, direction)
//       const to = followDirection(via, direction)
//       if (isValidBoardPosition(from) &&
//         isValidBoardPosition(via) &&
//         isValidBoardPosition(to)) {
//         const keyFrom = Solitaire.boardPositionToKey(from)
//         const keyVia = Solitaire.boardPositionToKey(via)
//         const keyTo = Solitaire.boardPositionToKey(to)
//         yield { from, via, to, keyFrom, keyVia, keyTo }
//       }
//     }
//   }
// }

const BOARD_POSITIONS = Array.from(boardPositionGenerator())
// const ALL_POSSIBLE_ACTIONS = Array.from(allPossibleActionsGenerator(BOARD_POSITIONS))

export class Solitaire {

  constructor() {
    this._actions = Solitaire.allPossibleActions(BOARD_POSITIONS)
    this._boardState = {}
    this.reset()
  }

  get boardPositions() {
    return BOARD_POSITIONS
  }

  get actions() {
    return this._actions
  }

  get boardState() {
    return this._boardState
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
    Boolean(this._findAction(from, to))

  makeMove = (from, to) => {
    const action = this._findAction(from, to)
    if (action) {
      this._boardState[action.keyFrom] = false
      this._boardState[action.keyVia] = false
      this._boardState[action.keyTo] = true
    }
  }

  reset = () => {
    for (const boardPosition of this.boardPositions) {
      const key = Solitaire.boardPositionToKey(boardPosition)
      this._boardState[key] = true
    }
    const keyCentre = Solitaire.boardPositionToKey([CENTRE_X, CENTRE_Y])
    this._boardState[keyCentre] = false
  }

  _findAction = (from, to) => {
    for (const action of this.validActions) {
      if (Solitaire.sameBoardPosition(action.from, from) &&
        Solitaire.sameBoardPosition(action.to, to)) {
        return action
      }
    }
    return undefined
  }

  static boardPositionToKey = ([row, col]) => `${row}-${col}`
  static keyToBoardPosition = key => key.split('-').map(Number)
  static sameBoardPosition = (pos1, pos2) => pos1[0] === pos2[0] && pos1[1] === pos2[1]

  static allPossibleActions = boardPositions => {

    const isValidBoardPosition = boardPosition => {
      const index = boardPositions.findIndex(item => Solitaire.sameBoardPosition(item, boardPosition))
      return index >= 0
    }

    const followDirection = (boardPosition, direction) => {
      const [row, col] = boardPosition
      switch (direction) {
        case UP: return [row - 1, col]
        case DOWN: return [row + 1, col]
        case LEFT: return [row, col - 1]
        case RIGHT: return [row, col + 1]
      }
    }

    const actions = []
    for (const from of boardPositions) {
      for (const direction of [UP, DOWN, LEFT, RIGHT]) {
        const via = followDirection(from, direction)
        const to = followDirection(via, direction)
        if (isValidBoardPosition(from) &&
          isValidBoardPosition(via) &&
          isValidBoardPosition(to)) {
          const keyFrom = Solitaire.boardPositionToKey(from)
          const keyVia = Solitaire.boardPositionToKey(via)
          const keyTo = Solitaire.boardPositionToKey(to)
          actions.push({ from, via, to, keyFrom, keyVia, keyTo })
        }
      }
    }
    return actions
  }
}
