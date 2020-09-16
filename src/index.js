import { Solitaire, BoardPosition } from './solitaire.js'

const BOARD_SIZE = 400
const BOARD_POSITION_RADIUS = BOARD_SIZE / 100
const BOARD_PIECE_RADIUS = BOARD_SIZE / 32

let selectedBoardPosition = undefined

const createSvgElement = (elementName, cssClass, attributes = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', elementName)
  element.setAttribute('class', cssClass)
  Object.entries(attributes).forEach(([name, value]) =>
    element.setAttribute(name, value))
  return element
}

const boardPositionToSvgCoords = boardPosition =>
  [
    BOARD_SIZE / 8 * (boardPosition.col + 1),
    BOARD_SIZE / 8 * (boardPosition.row + 1)
  ]

const svgCoordsToBoardPosition = (boardState, x, y) => {
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

const drawBoardPositions = (boardElement, boardState) => {
  for (const key of boardState.keys()) {
    const boardPosition = BoardPosition.fromKey(key)
    const [cx, cy] = boardPositionToSvgCoords(boardPosition)
    const r = BOARD_POSITION_RADIUS
    const attributes = { cx, cy, r }
    const boardPositionElement = createSvgElement('circle', 'board-position', attributes)
    boardElement.appendChild(boardPositionElement)
  }
}

const drawBoardPieces = (boardElement, boardState) => {
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

const findBoardPieceElement = (boardElement, boardPosition) => {
  const boardPieceElements = boardElement.querySelectorAll('.board-piece')
  for (const boardPieceElement of boardPieceElements) {
    if (boardPieceElement.dataset.key === boardPosition.key) {
      return boardPieceElement
    }
  }
  return undefined
}

// TODO:
// selectBoardPiece(boardPosition)
// deselectBoardPiece(boardPosition)

const onBoardClick = (solitaire, boardElement) => ({ offsetX, offsetY }) => {
  const clickedBoardPosition = svgCoordsToBoardPosition(solitaire.boardState, offsetX, offsetY)
  if (!clickedBoardPosition) {
    return
  }
  const boardPieceElement = findBoardPieceElement(boardElement, clickedBoardPosition)
  if (selectedBoardPosition) {
    if (selectedBoardPosition.sameAs(clickedBoardPosition)) {
      // deselectBoardPiece(boardPosition)
      selectedBoardPosition = undefined
      boardPieceElement.classList.remove('board-piece--selected')
    } else {
      if (boardPieceElement) {
        const oldBoardPieceElement = findBoardPieceElement(boardElement, selectedBoardPosition)
        if (oldBoardPieceElement) {
          // deselectBoardPiece(boardPosition)
          oldBoardPieceElement.classList.remove('board-piece--selected')
        }
        // selectBoardPiece(boardPosition)
        selectedBoardPosition = clickedBoardPosition
        boardPieceElement.classList.add('board-piece--selected')
      } else {
        if (solitaire.isValidMove(selectedBoardPosition, clickedBoardPosition)) {
          solitaire.makeMove(selectedBoardPosition, clickedBoardPosition)
          drawBoardPieces(boardElement, solitaire.boardState)
          selectedBoardPosition = undefined
        }
      }
    }
  } else {
    if (boardPieceElement) {
      // selectBoardPiece(boardPosition)
      selectedBoardPosition = clickedBoardPosition
      boardPieceElement.classList.add('board-piece--selected')
    }
  }
}

const main = () => {
  const solitaire = new Solitaire()
  const boardElement = document.querySelector('.board')
  boardElement.addEventListener('click', onBoardClick(solitaire, boardElement))
  boardElement.style.width = BOARD_SIZE
  boardElement.style.height = BOARD_SIZE
  drawBoardPositions(boardElement, solitaire.boardState)
  drawBoardPieces(boardElement, solitaire.boardState)
}

main()
