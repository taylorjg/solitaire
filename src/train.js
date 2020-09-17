import { SolitaireEnv } from './solitaire.js'
import * as svg from './svg.js'
import * as U from './utils.js'

const onMove = (solitaireEnv, boardElement) => {
  if (solitaireEnv.done) return
  const validActionIndices = solitaireEnv.validActionIndices
  const randomIndex = Math.floor(Math.random() * validActionIndices.length)
  const actionIndex = validActionIndices[randomIndex]
  solitaireEnv.step(actionIndex)
  svg.drawBoardPieces(boardElement, solitaireEnv.boardState)
}

const onAuto = async (solitaireEnv, boardElement) => {
  if (solitaireEnv.done) {
    onReset(solitaireEnv, boardElement)
  }
  for (;;) {
    if (solitaireEnv.done) break
    onMove(solitaireEnv, boardElement)
    await U.delay(100)
  }
}

const onReset = (solitaireEnv, boardElement) => {
  solitaireEnv.reset()
  svg.drawBoardPieces(boardElement, solitaireEnv.boardState)
}

const main = async () => {
  try {
    const solitaireEnv = new SolitaireEnv()
    const boardElement = document.querySelector('.board')
    svg.initialiseBoard(boardElement)
    svg.drawBoardPositions(boardElement, solitaireEnv.boardState)
    svg.drawBoardPieces(boardElement, solitaireEnv.boardState)
    const moveButton = document.getElementById('move-btn')
    const autoButton = document.getElementById('auto-btn')
    const resetButton = document.getElementById('reset-btn')
    moveButton.addEventListener('click', () => onMove(solitaireEnv, boardElement))
    autoButton.addEventListener('click', () => onAuto(solitaireEnv, boardElement))
    resetButton.addEventListener('click', () => onReset(solitaireEnv, boardElement))
  } catch (error) {
    console.log(`[main] ERROR: ${error.message}`)
  }
}

main()
