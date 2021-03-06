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

export const svgCoordsToBoardPosition = (boardPositions, x, y) => {
  for (const boardPosition of boardPositions) {
    const [boardPositionX, boardPositionY] = boardPositionToSvgCoords(boardPosition)
    const dx = Math.abs(boardPositionX - x)
    const dy = Math.abs(boardPositionY - y)
    if (dx <= BOARD_PIECE_RADIUS && dy <= BOARD_PIECE_RADIUS) {
      return boardPosition
    }
  }
  return undefined
}

export const drawBoardPositions = (boardElement, boardPositions) => {
  for (const boardPosition of boardPositions) {
    const [cx, cy] = boardPositionToSvgCoords(boardPosition)
    const r = BOARD_POSITION_RADIUS
    const attributes = { cx, cy, r }
    const boardPositionElement = createSvgElement('circle', 'board-position', attributes)
    boardElement.appendChild(boardPositionElement)
  }
}

export const drawBoardPieces = (boardElement, occupiedBoardPositions) => {
  const boardPieceElements = boardElement.querySelectorAll('.board-piece')
  for (const boardPieceElement of boardPieceElements) {
    boardElement.removeChild(boardPieceElement)
  }
  for (const boardPosition of occupiedBoardPositions) {
    const [cx, cy] = boardPositionToSvgCoords(boardPosition)
    const r = BOARD_PIECE_RADIUS
    const attributes = { cx, cy, r }
    const boardPieceElement = createSvgElement('circle', 'board-piece', attributes)
    boardPieceElement.dataset.key = boardPosition.key
    boardElement.appendChild(boardPieceElement)
  }
}

export const findBoardPieceElement = (boardElement, boardPosition) => {
  const boardPieceElements = boardElement.querySelectorAll('.board-piece')
  for (const boardPieceElement of boardPieceElements) {
    if (boardPieceElement.dataset.key === boardPosition.key) {
      return boardPieceElement
    }
  }
  return undefined
}

export const updateSelectedBoardPiece = (boardElement, selectedBoardPosition) => {
  const boardPieceElements = boardElement.querySelectorAll('.board-piece')
  for (const boardPieceElement of boardPieceElements) {
    boardPieceElement.classList.remove('board-piece--selected')
    if (selectedBoardPosition && boardPieceElement.dataset.key === selectedBoardPosition.key) {
      boardPieceElement.classList.add('board-piece--selected')
    }
  }
}

export const initialiseBoard = (boardElement, boardPositions) => {
  boardElement.style.width = BOARD_SIZE
  boardElement.style.height = BOARD_SIZE
  drawBoardPositions(boardElement, boardPositions)
}
