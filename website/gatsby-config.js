module.exports = {
  pathPrefix: "/counsel",
  siteMetadata: {
    title: `counsels`,
    description: `the end of boilerplate. automatically bake structure, opinions, and business rules into projects`,
    author: `@cdaringe`,
  },
  plugins: [
    `gatsby-plugin-typescript`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    ...require('./config/markdown')
  ],
}
