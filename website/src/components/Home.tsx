import * as React from 'react'
import Button from './atoms/Button'
import { Link } from 'gatsby'

const applyImg = require('../../../img/demo-apply.svg')

export default (props: any) => (
  <React.Fragment>
    <h4>the end of boilerplate.</h4>
    <p>
      bake structure, opinions, and rules into projects. it's similar to the
      popular{' '}
      <a href='https://yeoman.io/' target='_blank'>
        yeoman
      </a>
      {' '}package, but manages projects programmatically versus using boilerplate.
      counsel is for project maintainers. counsel makes sense for people who are
      developing many projects. counsel doesn't always make sense for teams or
      maintainers working on just a single project or two.
    </p>
    <div style={{ width: '100%', textAlign: 'center' }}>
      <img style={{ padding: '1em' }} alt='demo' src={applyImg} />
      <Link to='/docs/'>
        <Button>Get Started</Button>
      </Link>
    </div>
  </React.Fragment>
)
