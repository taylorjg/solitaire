import { SolitaireEnv } from './solitaire.js'
import { TrainingAgent, pickBestValidPredictionIndices } from './training-agent.js'
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
    const stateTensor = tf.tensor([this._observation])
    const predictionTensor = this._model.predict(stateTensor)
    const validActionIndices = this._solitaireEnv.validActionIndices
    const bestValidPredictionIndices = pickBestValidPredictionIndices(
      validActionIndices,
      predictionTensor)
    return bestValidPredictionIndices[0]
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

// ------------------------------------------------------------

const playOneGame = (agent, onDone) => {
  agent.reset()
  while (!agent.done) {
    const { actionIndex } = agent.chooseAction()
    const tuple = agent.step(actionIndex)
    if (tuple.done) {
      console.log(`moves: ${JSON.stringify(agent.moves)}; final reward: ${tuple.reward}`)
      onDone && onDone(tuple)
    }
  }
}

// ------------------------------------------------------------

// https://github.com/tensorflow/tfjs-examples/blob/master/snake-dqn/dqn.js
const copyWeights = (destNetwork, srcNetwork) => {
  let originalDestNetworkTrainable
  if (destNetwork.trainable !== srcNetwork.trainable) {
    originalDestNetworkTrainable = destNetwork.trainable
    destNetwork.trainable = srcNetwork.trainable
  }

  destNetwork.setWeights(srcNetwork.getWeights())

  if (originalDestNetworkTrainable != null) {
    destNetwork.trainable = originalDestNetworkTrainable
  }
}

// ------------------------------------------------------------

class MovingAverager {
  constructor(bufferLength) {
    this.buffer = []
    for (let i = 0; i < bufferLength; ++i) {
      this.buffer.push(null)
    }
  }

  append(x) {
    this.buffer.shift()
    this.buffer.push(x)
  }

  average() {
    // return this.buffer.reduce((x, prev) => x + prev) / this.buffer.length
    const len = this.buffer.filter(x => x !== null).length
    return this.buffer.reduce((x, prev) => x + prev) / len
  }
}

// ------------------------------------------------------------

const config = {
  epsilonInit: 0.5,
  epsilonFinal: 0.01,
  epsilonDecayFrames: 1e5,
  learningRate: 1e-3,
  replayBufferSize: 1e4,
  syncEveryFrames: 1e3,
  maxNumFrames: 1e6,
  batchSize: 64,
  gamma: 0.99,
  cumulativeRewardThreshold: -10
}

const onTrain = async solitaireEnv => {
  const trainingAgent = new TrainingAgent(solitaireEnv, config)
  for (let i = 0; i < config.replayBufferSize; ++i) {
    trainingAgent.playStep()
  }
  const rewardAverager = new MovingAverager(100)
  const optimizer = tf.train.adam(config.learningRate)
  while (true) {
    trainingAgent.trainOnReplayBatch(config.batchSize, config.gamma, optimizer)
    const { cumulativeReward, done } = trainingAgent.playStep()
    if (done) {
      rewardAverager.append(cumulativeReward)
      const averageReward = rewardAverager.average()
      console.log('averageReward:', averageReward, 'frameCount: ', trainingAgent.frameCount, 'epsilon:', trainingAgent.epsilon)
      if (averageReward >= config.cumulativeRewardThreshold || trainingAgent.frameCount >= config.maxNumFrames) {
        break
      }
      await tf.nextFrame()
    }
    if (trainingAgent.frameCount % config.syncEveryFrames === 0) {
      copyWeights(trainingAgent.targetNetwork, trainingAgent.onlineNetwork)
      console.log('Sync\'ed weights from online network to target network')
    }
  }
}

// ------------------------------------------------------------

const main = async () => {
  try {
    const trainButtonElement = document.getElementById('train-btn')
    const boardElement = document.querySelector('.board')
    const moveButtonElement = document.getElementById('move-btn')
    const autoButtonElement = document.getElementById('auto-btn')
    const resetButtonElement = document.getElementById('reset-btn')
    const rewardRowElement = document.querySelector('.reward-row')
    const finalRewardElement = document.getElementById('final-reward')
    const elements = {
      trainButtonElement,
      boardElement,
      moveButtonElement,
      autoButtonElement,
      resetButtonElement,
      rewardRowElement,
      finalRewardElement
    }
    const solitaireEnv = new SolitaireEnv()

    trainButtonElement.addEventListener('click', () => onTrain(solitaireEnv))

    const agent = new RandomAgent(solitaireEnv)
    svg.initialiseBoard(boardElement, agent.boardState)
    moveButtonElement.addEventListener('click', () => onMove(elements, agent))
    autoButtonElement.addEventListener('click', () => onAuto(elements, agent))
    resetButtonElement.addEventListener('click', () => onReset(elements, agent))

    const tuples = []
    U.range(10).forEach(() => {
      playOneGame(agent, tuple => tuples.push(tuple))
    })
    const finalRewards = tuples.map(tuple => tuple.reward)
    const worstFinalReward = Math.min(...finalRewards)
    const bestFinalReward = Math.max(...finalRewards)
    const averageFinalReward = finalRewards.reduce((acc, finalReward) => acc + finalReward, 0) / finalRewards.length
    console.log({ worstFinalReward, bestFinalReward, averageFinalReward })
  } catch (error) {
    console.log(`[main] ERROR: ${error.message}`)
  }
}

main()
