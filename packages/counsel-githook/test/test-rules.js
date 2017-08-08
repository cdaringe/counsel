'use strict'

const GitHookRule = require('../')

module.exports = {
  preCommitWithTasks: new GitHookRule({
    hooks: {
      precommit: ['lint', 'test']
    }
  }),
  preCommitWithTasksNoVariants: new GitHookRule({
    hooks: {
      precommit: {
        tasks: ['lint', 'test'],
        variants: []
      }
    }
  }),
  preCommitWithCommand: new GitHookRule({
    hooks: {
      precommit: 'TEST-SHELL-COMMAND'
    }
  })
}
