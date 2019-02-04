import * as React from 'react'

import Layoot from '../components/Layoot'
import SEO from '../components/seo'

const NotFoundPage = () => (
  <Layoot>
    <SEO title='404: Not found' />
    <h1>NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Layoot>
)

export default NotFoundPage
