import { Solitaire } from './solitaire.js'

const BOARD_SIZE = 400

const createSvgElement = (elementName, cssClass, attributes = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', elementName)
  element.setAttribute('class', cssClass)
  Object.entries(attributes).forEach(([name, value]) =>
    element.setAttribute(name, value))
  return element
}

const drawBoardPositions = (boardElement, boardPositions) => {
  for (const [row, col] of Object.values(boardPositions)) {
    const attributes = {
      cx: BOARD_SIZE / 8 * (col + 1),
      cy: BOARD_SIZE / 8 * (row + 1),
      r: BOARD_SIZE / 80
    }
    const boardPositionElement = createSvgElement('circle', 'board-position', attributes)
    boardElement.appendChild(boardPositionElement)
  }
}

const main = () => {
  const boardElement = document.querySelector('.board')
  boardElement.style.width = BOARD_SIZE
  boardElement.style.height = BOARD_SIZE
  const solitaire = new Solitaire()
  drawBoardPositions(boardElement, solitaire.boardPositions)
}

main()
