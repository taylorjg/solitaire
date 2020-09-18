import { SolitaireEnv } from './solitaire.js'
import * as svg from './svg.js'
import * as U from './utils.js'

const onMove = async (buttons, solitaireEnv, boardElement) => {
  if (solitaireEnv.done) return
  const savedDisabled = buttons.moveButton.disabled
  buttons.moveButton.disabled = true
  const validActionIndices = solitaireEnv.validActionIndices
  const randomIndex = Math.floor(Math.random() * validActionIndices.length)
  const actionIndex = validActionIndices[randomIndex]
  const action = solitaireEnv.action(actionIndex)
  svg.updateSelectedBoardPiece(boardElement, action.from)
  await U.delay(250)
  const { observation, reward, done } = solitaireEnv.step(actionIndex)
  if (done) {
    console.log({ observation, reward, done })
  }
  svg.updateSelectedBoardPiece(boardElement, undefined)
  svg.drawBoardPieces(boardElement, solitaireEnv.boardState)
  buttons.moveButton.disabled = savedDisabled
}

const onAuto = async (buttons, solitaireEnv, boardElement) => {
  buttons.moveButton.disabled = true
  buttons.autoButton.disabled = true
  buttons.resetButton.disabled = true
  if (solitaireEnv.done) {
    onReset(buttons, solitaireEnv, boardElement)
  }
  for (; ;) {
    if (solitaireEnv.done) break
    await onMove(buttons, solitaireEnv, boardElement)
    await U.delay(250)
  }
  buttons.moveButton.disabled = false
  buttons.autoButton.disabled = false
  buttons.resetButton.disabled = false
}

const onReset = (_buttons, solitaireEnv, boardElement) => {
  solitaireEnv.reset()
  svg.drawBoardPieces(boardElement, solitaireEnv.boardState)
}

const main = async () => {
  try {
    const solitaireEnv = new SolitaireEnv()
    const boardElement = document.querySelector('.board')
    svg.initialiseBoard(boardElement, solitaireEnv.boardState)
    const moveButton = document.getElementById('move-btn')
    const autoButton = document.getElementById('auto-btn')
    const resetButton = document.getElementById('reset-btn')
    const buttons = { moveButton, autoButton, resetButton }
    moveButton.addEventListener('click', () => onMove(buttons, solitaireEnv, boardElement))
    autoButton.addEventListener('click', () => onAuto(buttons, solitaireEnv, boardElement))
    resetButton.addEventListener('click', () => onReset(buttons, solitaireEnv, boardElement))
  } catch (error) {
    console.log(`[main] ERROR: ${error.message}`)
  }
}

main()
