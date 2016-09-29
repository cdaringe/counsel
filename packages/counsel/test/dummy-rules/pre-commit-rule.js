'use strict'

const PreCommitRule = require('counsel-common').PreCommitRule

module.exports = new PreCommitRule({
  name: 'add-my-special-precommit-tasks',
  preCommitTasks: ['rm -rf gradle', 'because it\'s literally the worst']
})
