import { Solitaire } from './solitaire.js'
import * as svg from './svg.js'

let selectedBoardPosition = undefined

const onBoardClick = (solitaire, boardElement) => ({ offsetX, offsetY }) => {
  if (solitaire.done) return
  const clickedBoardPosition = svg.svgCoordsToBoardPosition(solitaire.boardState, offsetX, offsetY)
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
          svg.drawBoardPieces(boardElement, solitaire.boardState)
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

const main = () => {
  const solitaire = new Solitaire()
  const boardElement = document.querySelector('.board')
  svg.initialiseBoard(boardElement, solitaire.boardState)
  boardElement.addEventListener('click', onBoardClick(solitaire, boardElement))
}

main()