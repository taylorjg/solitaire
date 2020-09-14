import { Solitaire } from './solitaire.js'

const BOARD_SIZE = 400
const BOARD_POSITION_RADIUS = BOARD_SIZE / 100
const BOARD_PIECE_RADIUS = BOARD_SIZE / 40

let selectedPiece = undefined

const createSvgElement = (elementName, cssClass, attributes = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', elementName)
  element.setAttribute('class', cssClass)
  Object.entries(attributes).forEach(([name, value]) =>
    element.setAttribute(name, value))
  return element
}

const drawBoardPositions = (boardElement, boardPositions) => {
  for (const [row, col] of boardPositions) {
    const attributes = {
      cx: BOARD_SIZE / 8 * (col + 1),
      cy: BOARD_SIZE / 8 * (row + 1),
      r: BOARD_POSITION_RADIUS
    }
    const boardPositionElement = createSvgElement('circle', 'board-position', attributes)
    boardElement.appendChild(boardPositionElement)
  }
}

const drawBoardPieces = (boardElement, boardState) => {
  const boardPieceElements = boardElement.querySelectorAll('.board-piece')
  for (const boardPieceElement of boardPieceElements) {
    boardElement.removeChild(boardPieceElement)
  }
  for (const [key, value] of Object.entries(boardState)) {
    if (!value) {
      continue
    }
    const [row, col] = Solitaire.keyToBoardPosition(key)
    const attributes = {
      cx: BOARD_SIZE / 8 * (col + 1),
      cy: BOARD_SIZE / 8 * (row + 1),
      r: BOARD_PIECE_RADIUS
    }
    const boardPieceElement = createSvgElement('circle', 'board-piece', attributes)
    boardPieceElement.dataset.key = key
    boardElement.appendChild(boardPieceElement)
  }
}

const findBoardPieceElement = (boardElement, boardPosition) => {
  const key = Solitaire.boardPositionToKey(boardPosition)
  const boardPieceElements = boardElement.querySelectorAll('.board-piece')
  for (const boardPieceElement of boardPieceElements) {
    if (boardPieceElement.dataset.key === key) {
      return boardPieceElement
    }
  }
  return undefined
}

const boardClickToBoardPosition = (boardPositions, offsetX, offsetY) => {
  for (const [row, col] of boardPositions) {
    const rowY = BOARD_SIZE / 8 * (row + 1)
    const colX = BOARD_SIZE / 8 * (col + 1)
    const dx = Math.abs(colX - offsetX)
    const dy = Math.abs(rowY - offsetY)
    if (dx <= BOARD_PIECE_RADIUS && dy <= BOARD_PIECE_RADIUS) {
      return [row, col]
    }
  }
  return undefined
}

const sameBoardPosition = (pos1, pos2) =>
  pos1[0] === pos2[0] && pos1[1] === pos2[1]

const onBoardClick = (boardElement, boardPositions) => ({ offsetX, offsetY }) => {
  const boardPosition = boardClickToBoardPosition(boardPositions, offsetX, offsetY)
  if (!boardPosition) {
    return
  }
  const boardPieceElement = findBoardPieceElement(boardElement, boardPosition)
  if (selectedPiece) {
    if (sameBoardPosition(selectedPiece, boardPosition)) {
      selectedPiece = undefined
      boardPieceElement.classList.remove('board-piece--selected')
    } else {
      // TODO: make move if valid
    }
  } else {
    selectedPiece = boardPosition
    boardPieceElement.classList.add('board-piece--selected')
  }
}

const main = () => {
  const solitaire = new Solitaire()
  const boardElement = document.querySelector('.board')
  boardElement.addEventListener('click', onBoardClick(boardElement, solitaire.boardPositions))
  boardElement.style.width = BOARD_SIZE
  boardElement.style.height = BOARD_SIZE
  drawBoardPositions(boardElement, solitaire.boardPositions)
  drawBoardPieces(boardElement, solitaire.boardState)
}

main()
