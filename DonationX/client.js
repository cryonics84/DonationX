import createClient from 'monsterr'
import stage1 from './src/stages/stage1/client'

const stages = [
  stage1
]

let options = {
  canvasBackgroundColor: 'green',
  htmlContainerHeight: 0, // Hide html
    hideChat: true
}

let events = {}
let commands = {}

createClient({
  events,
  commands,
  options,
  stages
})