import { SolitaireEnv } from './solitaire.js'
import * as svg from './svg.js'
import * as U from './utils.js'

// ------------------------------------------------------------

class AgentBase {

  constructor(solitaireEnv) {
    this._solitaireEnv = solitaireEnv
    this._observation = []
    this._moves = []
    this.reset()
  }

  get done() {
    return this._solitaireEnv.done
  }

  get solved() {
    return this._solitaireEnv.solved
  }

  get boardState() {
    return this._solitaireEnv.boardState
  }

  get moves() {
    return this._moves
  }

  chooseAction = () => {
    const actionIndex = this._chooseActionIndex()
    const action = this._solitaireEnv.action(actionIndex)
    return { action, actionIndex }
  }

  _chooseActionIndex = () => {
    throw new Error('Abstract method must be overridden by derived class')
  }

  step = actionIndex => {
    this._moves.push(actionIndex)
    const tuple = this._solitaireEnv.step(actionIndex)
    this._observation = tuple.observation
    return tuple
  }

  reset = () => {
    this._observation = this._solitaireEnv.reset()
    this._moves = []
  }
}

// ------------------------------------------------------------

class RandomAgent extends AgentBase {

  constructor(solitaireEnv) {
    super(solitaireEnv)
  }

  _chooseActionIndex = () => {
    const validActionIndices = this._solitaireEnv.validActionIndices
    const randomIndex = Math.floor(Math.random() * validActionIndices.length)
    const actionIndex = validActionIndices[randomIndex]
    return actionIndex
  }
}

// ------------------------------------------------------------

class TrainedModelAgent extends AgentBase {

  constructor(solitaireEnv, model) {
    super(solitaireEnv)
    this._model = model
  }

  _chooseActionIndex = () => {
    // TODO: use this._model to choose an action index based on this._observation
  }
}

// ------------------------------------------------------------

const AUTO_MOVE_DELAY = 50

const onMove = async (elements, agent) => {

  if (agent.done) return

  const savedDisabled = elements.moveButtonElement.disabled
  elements.moveButtonElement.disabled = true

  const { action, actionIndex } = agent.chooseAction()
  svg.updateSelectedBoardPiece(elements.boardElement, action.from)

  await U.delay(AUTO_MOVE_DELAY)

  const tuple = agent.step(actionIndex)
  svg.updateSelectedBoardPiece(elements.boardElement, undefined)
  svg.drawBoardPieces(elements.boardElement, agent.boardState)

  if (tuple.done) {
    elements.rewardRowElement.classList.remove('reward-row--hidden')
    elements.finalRewardElement.innerText = tuple.reward
    console.log(`moves: ${JSON.stringify(agent.moves)}; reward: ${tuple.reward}`)
  }

  elements.moveButtonElement.disabled = savedDisabled
}

const onAuto = async (elements, agent) => {
  elements.moveButtonElement.disabled = true
  elements.autoButtonElement.disabled = true
  elements.resetButtonElement.disabled = true
  if (agent.done) {
    onReset(elements, agent)
  }
  while (!agent.done) {
    await onMove(elements, agent)
    await U.delay(AUTO_MOVE_DELAY)
  }
  elements.moveButtonElement.disabled = false
  elements.autoButtonElement.disabled = false
  elements.resetButtonElement.disabled = false
}

const onReset = (elements, agent) => {
  agent.reset()
  svg.drawBoardPieces(elements.boardElement, agent.boardState)
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
    const agent = new RandomAgent(solitaireEnv)
    svg.initialiseBoard(boardElement, agent.boardState)
    moveButtonElement.addEventListener('click', () => onMove(elements, agent))
    autoButtonElement.addEventListener('click', () => onAuto(elements, agent))
    resetButtonElement.addEventListener('click', () => onReset(elements, agent))
  } catch (error) {
    console.log(`[main] ERROR: ${error.message}`)
  }
}

main()
