import * as React from 'react'
import { Link } from 'gatsby'

const logo = require('../images/counsel.png')

export default () => (
  <div id='header'>
    <Link to='/'>
      <img id='header__logo' src={logo} />
    </Link>
    <h1>counsel</h1>
  </div>
)
