import { Solitaire } from '../src/solitaire.js'
import chai from 'chai'
const expect = chai.expect

describe('Solitaire class', () => {

  it('should have the expected number of possible actions', () => {
    const solitaire = new Solitaire()
    expect(solitaire.actions).to.have.lengthOf(76)
  })

  it('should have the expected number of initial valid actions', () => {
    const solitaire = new Solitaire()
    expect(solitaire.validActions).to.have.lengthOf(4)
  })
})
