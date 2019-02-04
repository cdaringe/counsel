// Layoot >> Layout, due to gatsby having a bug where there is
// some sort of internal symbol collision and it uses the default
// starter Layout
import * as React from 'react'
import Layoot from './Layoot'
import { graphql } from 'gatsby'

export default ({ data }: any) => {
  const {
    html,
    headings,
    frontmatter: { title },
    fields: { slug }
  } = data.markdownRemark
  return (
    <Layoot {...{ headings, slug }}>
      <h1 style={{ fontSize: '1.9em' }}>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Layoot>
  )
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields {
        slug
      }
      frontmatter {
        title
      }
      headings {
        value
        depth
      }
    }
  }
`
