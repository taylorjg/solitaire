import { BoardPosition } from './solitaire.js'

const BOARD_SIZE = 400
const BOARD_POSITION_RADIUS = BOARD_SIZE / 100
const BOARD_PIECE_RADIUS = BOARD_SIZE / 32

const createSvgElement = (elementName, cssClass, attributes = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', elementName)
  element.setAttribute('class', cssClass)
  Object.entries(attributes).forEach(([name, value]) =>
    element.setAttribute(name, value))
  return element
}

export const boardPositionToSvgCoords = boardPosition =>
  [
    BOARD_SIZE / 8 * (boardPosition.col + 1),
    BOARD_SIZE / 8 * (boardPosition.row + 1)
  ]

export const svgCoordsToBoardPosition = (boardState, x, y) => {
  for (const key of boardState.keys()) {
    const boardPosition = BoardPosition.fromKey(key)
    const [boardPositionX, boardPositionY] = boardPositionToSvgCoords(boardPosition)
    const dx = Math.abs(boardPositionX - x)
    const dy = Math.abs(boardPositionY - y)
    if (dx <= BOARD_PIECE_RADIUS && dy <= BOARD_PIECE_RADIUS) {
      return boardPosition
    }
  }
  return undefined
}

export const drawBoardPositions = (boardElement, boardState) => {
  for (const key of boardState.keys()) {
    const boardPosition = BoardPosition.fromKey(key)
    const [cx, cy] = boardPositionToSvgCoords(boardPosition)
    const r = BOARD_POSITION_RADIUS
    const attributes = { cx, cy, r }
    const boardPositionElement = createSvgElement('circle', 'board-position', attributes)
    boardElement.appendChild(boardPositionElement)
  }
}

export const drawBoardPieces = (boardElement, boardState) => {
  const boardPieceElements = boardElement.querySelectorAll('.board-piece')
  for (const boardPieceElement of boardPieceElements) {
    boardElement.removeChild(boardPieceElement)
  }
  for (const [key, value] of boardState.entries()) {
    if (!value) {
      continue
    }
    const boardPosition = BoardPosition.fromKey(key)
    const [cx, cy] = boardPositionToSvgCoords(boardPosition)
    const r = BOARD_PIECE_RADIUS
    const attributes = { cx, cy, r }
    const boardPieceElement = createSvgElement('circle', 'board-piece', attributes)
    boardPieceElement.dataset.key = key
    boardElement.appendChild(boardPieceElement)
  }
}

export const initialiseBoard = boardElement => {
  boardElement.style.width = BOARD_SIZE
  boardElement.style.height = BOARD_SIZE
}
