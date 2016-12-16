'use strict'

const PreCommitRule = require('../')

module.exports = new PreCommitRule({
  preCommitTasks: ['rm -rf gradle', 'nuke gradle', 'echo "DELETE gralde"'],
  strict: true
})
