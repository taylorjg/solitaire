import { SolitaireEnv } from './solitaire.js'
import * as svg from './svg.js'
import * as U from './utils.js'

const AUTO_MOVE_DELAY = 50

const onMove = async (elements, solitaireEnv) => {
  if (solitaireEnv.done) return
  const savedDisabled = elements.moveButtonElement.disabled
  elements.moveButtonElement.disabled = true
  const validActionIndices = solitaireEnv.validActionIndices
  const randomIndex = Math.floor(Math.random() * validActionIndices.length)
  const actionIndex = validActionIndices[randomIndex]
  const action = solitaireEnv.action(actionIndex)
  svg.updateSelectedBoardPiece(elements.boardElement, action.from)
  await U.delay(AUTO_MOVE_DELAY)
  const { observation, reward, done } = solitaireEnv.step(actionIndex)
  if (done) {
    elements.rewardRowElement.classList.remove('reward-row--hidden')
    elements.finalRewardElement.innerText = reward
  }
  svg.updateSelectedBoardPiece(elements.boardElement, undefined)
  svg.drawBoardPieces(elements.boardElement, solitaireEnv.boardState)
  elements.moveButtonElement.disabled = savedDisabled
}

const onAuto = async (elements, solitaireEnv) => {
  elements.moveButtonElement.disabled = true
  elements.autoButtonElement.disabled = true
  elements.resetButtonElement.disabled = true
  if (solitaireEnv.done) {
    onReset(elements, solitaireEnv)
  }
  while (!solitaireEnv.done) {
    await onMove(elements, solitaireEnv)
    await U.delay(AUTO_MOVE_DELAY)
  }
  elements.moveButtonElement.disabled = false
  elements.autoButtonElement.disabled = false
  elements.resetButtonElement.disabled = false
}

const onReset = (elements, solitaireEnv) => {
  solitaireEnv.reset()
  svg.drawBoardPieces(elements.boardElement, solitaireEnv.boardState)
  elements.rewardRowElement.classList.add('reward-row--hidden')
}

const main = async () => {
  try {
    const boardElement = document.querySelector('.board')
    const moveButtonElement = document.getElementById('move-btn')
    const autoButtonElement = document.getElementById('auto-btn')
    const resetButtonElement = document.getElementById('reset-btn')
    const rewardRowElement = document.querySelector('.reward-row')
    const finalRewardElement = document.getElementById('final-reward')
    const elements = {
      boardElement,
      moveButtonElement,
      autoButtonElement,
      resetButtonElement,
      rewardRowElement,
      finalRewardElement
    }
    const solitaireEnv = new SolitaireEnv()
    svg.initialiseBoard(boardElement, solitaireEnv.boardState)
    moveButtonElement.addEventListener('click', () => onMove(elements, solitaireEnv))
    autoButtonElement.addEventListener('click', () => onAuto(elements, solitaireEnv))
    resetButtonElement.addEventListener('click', () => onReset(elements, solitaireEnv))
  } catch (error) {
    console.log(`[main] ERROR: ${error.message}`)
  }
}

main()
