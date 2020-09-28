import { ReplayMemory } from './replay_memory.js'
import * as U from './utils.js'

const createModel = () => {
  const model = tf.sequential()
  model.add(tf.layers.dense({ inputShape: [33], units: 100, activation: 'relu' }))
  model.add(tf.layers.dense({ units: 100, activation: 'relu' }))
  model.add(tf.layers.dense({ units: 100, activation: 'relu' }))
  model.add(tf.layers.dense({ units: 76 }))
  model.summary()
  return model
}

export const pickBestValidPredictionIndices = (validActionIndices, predictionTensor) => {
  const rows1 = predictionTensor.arraySync()
  const rows2 = rows1.map(U.zipWithIndex)
  const rows3 = rows2.map(row => row.filter(([index]) => validActionIndices.includes(index)))
  const rows4 = rows3.map(row => row.sort(([, value1], [, value2]) => value2 - value1))
  const rows5 = rows4.map(([[index]]) => index)
  return rows5
}

export class TrainingAgent {
  constructor(solitaireEnv, config) {
    this.solitaireEnv = solitaireEnv

    this.epsilonInit = config.epsilonInit
    this.epsilonFinal = config.epsilonFinal
    this.epsilonDecayFrames = config.epsilonDecayFrames
    this.epsilonIncrement_ = (this.epsilonFinal - this.epsilonInit) / this.epsilonDecayFrames

    this.onlineNetwork = createModel()
    this.targetNetwork = createModel()
    this.targetNetwork.trainable = false

    this.optimizer = tf.train.adam(config.learningRate)

    this.replayMemory = new ReplayMemory(config.replayBufferSize)
    this.frameCount = 0
    this.reset()
  }

  reset() {
    this.cumulativeReward_ = 0
    this.state_ = this.solitaireEnv.reset()
  }

  playStep() {
    this.epsilon = this.frameCount >= this.epsilonDecayFrames
      ? this.epsilonFinal
      : this.epsilonInit + this.epsilonIncrement_ * this.frameCount
    this.frameCount++

    let actionIndex
    if (Math.random() < this.epsilon) {
      const validActionIndices = this.solitaireEnv.validActionIndices
      const randomIndex = Math.floor(Math.random() * validActionIndices.length)
      actionIndex = validActionIndices[randomIndex]
    } else {
      tf.tidy(() => {
        const stateTensor = tf.tensor([this.state_])
        const predictionTensor = this.onlineNetwork.predict(stateTensor)
        const validActionIndices = this.solitaireEnv.validActionIndices
        const bestValidPredictionIndices = pickBestValidPredictionIndices(validActionIndices, predictionTensor)
        actionIndex = bestValidPredictionIndices[0]
      })
    }

    const { observation: nextState, reward, done } = this.solitaireEnv.step(actionIndex)

    this.replayMemory.append([this.state_, actionIndex, reward, done, nextState])

    this.state_ = nextState

    this.cumulativeReward_ += reward
    const output = {
      actionIndex,
      cumulativeReward: this.cumulativeReward_,
      done
    }
    if (done) {
      this.reset()
    }
    return output
  }

  trainOnReplayBatch(batchSize, gamma, optimizer) {
    const batch = this.replayMemory.sample(batchSize)
    const lossFunction = () => tf.tidy(() => {
      const stateTensor = tf.tensor(batch.map(example => example[0]))
      const actionTensor = tf.tensor1d(batch.map(example => example[1]), 'int32')
      const qs = this.onlineNetwork.apply(stateTensor, { training: true })
        .mul(tf.oneHot(actionTensor, this.solitaireEnv.numActions)).sum(-1)

      const nextStateTensor = tf.tensor(batch.map(example => example[4]))
      const nextMaxQTensor = this.targetNetwork.predict(nextStateTensor).max(-1)

      const doneTensor = tf.tensor1d(batch.map(example => example[3])).asType('float32')
      const doneMask = tf.scalar(1).sub(doneTensor)
      const rewardTensor = tf.tensor1d(batch.map(example => example[2]))
      const targetQs = rewardTensor.add(nextMaxQTensor.mul(doneMask).mul(gamma))

      return tf.losses.meanSquaredError(targetQs, qs)
    })

    const grads = tf.variableGrads(lossFunction)
    optimizer.applyGradients(grads.grads)
    tf.dispose(grads)
  }
}
