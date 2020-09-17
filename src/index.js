import { Solitaire } from './solitaire.js'
import * as svg from './svg.js'

let selectedBoardPosition = undefined

const findBoardPieceElement = (boardElement, boardPosition) => {
  const boardPieceElements = boardElement.querySelectorAll('.board-piece')
  for (const boardPieceElement of boardPieceElements) {
    if (boardPieceElement.dataset.key === boardPosition.key) {
      return boardPieceElement
    }
  }
  return undefined
}

const updateSelectedBoardPiece = boardElement => {
  const boardPieceElements = boardElement.querySelectorAll('.board-piece')
  for (const boardPieceElement of boardPieceElements) {
    boardPieceElement.classList.remove('board-piece--selected')
    if (selectedBoardPosition && boardPieceElement.dataset.key === selectedBoardPosition.key) {
      boardPieceElement.classList.add('board-piece--selected')
    }
  }
}

const onBoardClick = (solitaire, boardElement) => ({ offsetX, offsetY }) => {
  if (solitaire.done) {
    return
  }
  const clickedBoardPosition = svg.svgCoordsToBoardPosition(solitaire.boardState, offsetX, offsetY)
  if (!clickedBoardPosition) {
    return
  }
  const boardPieceElement = findBoardPieceElement(boardElement, clickedBoardPosition)
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
  updateSelectedBoardPiece(boardElement)
}

const main = () => {
  const solitaire = new Solitaire()
  const boardElement = document.querySelector('.board')
  svg.initialiseBoard(boardElement)
  svg.drawBoardPositions(boardElement, solitaire.boardState)
  svg.drawBoardPieces(boardElement, solitaire.boardState)
  boardElement.addEventListener('click', onBoardClick(solitaire, boardElement))
}

main()
