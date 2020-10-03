import { Solitaire } from './solitaire.js'
import * as svg from './svg.js'

let selectedBoardPosition = undefined

const onBoardClick = (solitaire, boardElement) => ({ offsetX, offsetY }) => {
  if (solitaire.done) return
  const clickedBoardPosition = svg.svgCoordsToBoardPosition(solitaire.boardPositions, offsetX, offsetY)
  if (!clickedBoardPosition) return
  const boardPieceElement = svg.findBoardPieceElement(boardElement, clickedBoardPosition)
  if (selectedBoardPosition) {
    if (selectedBoardPosition.sameAs(clickedBoardPosition)) {
      selectedBoardPosition = undefined
    } else {
      if (boardPieceElement) {
        selectedBoardPosition = clickedBoardPosition
      } else {
        if (solitaire.isValidMove(selectedBoardPosition, clickedBoardPosition)) {
          solitaire.makeMove(selectedBoardPosition, clickedBoardPosition)
          svg.drawBoardPieces(boardElement, solitaire.occupiedBoardPositions)
          selectedBoardPosition = undefined
        }
      }
    }
  } else {
    if (boardPieceElement) {
      selectedBoardPosition = clickedBoardPosition
    }
  }
  svg.updateSelectedBoardPiece(boardElement, selectedBoardPosition)
}

const onReset = (solitaire, boardElement) => {
  solitaire.reset()
  svg.drawBoardPieces(boardElement, solitaire.occupiedBoardPositions)
}

const main = () => {
  const boardElement = document.querySelector('.board')
  const resetButtonElement = document.getElementById('reset-btn')
  const solitaire = new Solitaire()
  svg.initialiseBoard(boardElement, solitaire.boardPositions)
  svg.drawBoardPieces(boardElement, solitaire.occupiedBoardPositions)
  boardElement.addEventListener('click', onBoardClick(solitaire, boardElement))
  resetButtonElement.addEventListener('click', () => onReset(solitaire, boardElement))
}

main()
