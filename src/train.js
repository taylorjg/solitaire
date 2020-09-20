import { SolitaireEnv } from './solitaire.js'
import * as svg from './svg.js'
import * as U from './utils.js'
import { ReplayMemory } from './replay_memory.js'

// ------------------------------------------------------------

const createModel = () => {
  const model = tf.sequential()
  model.add(tf.layers.dense({ inputShape: [33], units: 100, activation: 'relu' }))
  model.add(tf.layers.dense({ units: 100, activation: 'relu' }))
  model.add(tf.layers.dense({ units: 76 }))
  model.summary()
  return model
}

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
    const statesTensor = tf.tensor([this._observation])
    const predictionsTensor = this._model.predict(statesTensor)
    const validActionIndices = this._solitaireEnv.validActionIndices
    const bestValidPredictionIndices = pickBestValidPredictionIndices(
      validActionIndices,
      predictionsTensor)
    return bestValidPredictionIndices[0]
  }
}

// ------------------------------------------------------------

const pickBestValidPredictionIndices = (validActionIndices, predictionsTensor) => {
  const rows1 = predictionsTensor.arraySync()
  const rows2 = rows1.map(U.zipWithIndex)
  const rows3 = rows2.map(row => row.filter(([index]) => validActionIndices.includes(index)))
  const rows4 = rows3.map(row => row.sort(([, value1], [, value2]) => value2 - value1))
  const rows5 = rows4.map(([[index]]) => index)
  return rows5
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
    // const model = createModel()
    // const agent = new TrainedModelAgent(solitaireEnv, model)

    svg.initialiseBoard(boardElement, agent.boardState)
    moveButtonElement.addEventListener('click', () => onMove(elements, agent))
    autoButtonElement.addEventListener('click', () => onAuto(elements, agent))
    resetButtonElement.addEventListener('click', () => onReset(elements, agent))

    const tuples = []
    U.range(100).forEach(() => {
      agent.reset()
      while (!agent.done) {
        const { actionIndex } = agent.chooseAction()
        const tuple = agent.step(actionIndex)
        if (tuple.done) {
          console.log(`moves: ${JSON.stringify(agent.moves)}; reward: ${tuple.reward}`)
          tuples.push(tuple)
        }
      }
    })
    const finalRewards = tuples.map(t => t.reward)
    const minReward = Math.min(...finalRewards)
    const maxReward = Math.max(...finalRewards)
    console.log({ minReward, maxReward })
  } catch (error) {
    console.log(`[main] ERROR: ${error.message}`)
  }
}

main()
