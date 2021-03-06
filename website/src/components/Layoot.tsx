// Layoot >> Layout, due to gatsby having a bug where there is
// some sort of internal symbol collision and it uses the default
// starter Layout
import './Layoot.css'
import * as React from 'react'
import Helmet from 'react-helmet'
import Header from './Heeder'
import { Link } from 'gatsby'

const win = (typeof window !== 'undefined'
  ? window
  : { location: {} }) as Window

const smoothNav = (evt: any) => {
  const target = evt.currentTarget.getAttribute('href').replace(/([^#]+)#/, '')
  setTimeout(() => {
    win.location.hash = target
  }, 1000)
  const selector = `a[name=${target}]`
  const targetNode = document.querySelector(selector)
  if (targetNode) {
    evt.preventDefault()
    targetNode.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    })
  } else {
    console.warn(`unable to find node: ${selector}`)
  }
}

const navCaret = <span style={{ fontSize: '60%' }}>{'> '}</span>

export interface LayootProps {
  children: any
  headings?: { value: string; depth: number }[]
  slug?: string
}

export default ({ children, headings = [], slug = '' }: LayootProps) => {
  const pathname = (win.location.pathname || '').replace('/counsel', '')
  return (
    <div id='root'>
      <Helmet>
        <link
          href='https://fonts.googleapis.com/css?family=Ubuntu+Mono'
          rel='stylesheet'
        />
      </Helmet>
      <div id='primary'>
        <Header />
        {children}
      </div>
      <nav id='nav-menu'>
        <div id='nav-sticker'>
          <h3>nav</h3>
          <ul>
            <li>
              <Link to='/'>{pathname === '/' && navCaret}home</Link>
            </li>
            <li>
              <Link to='/docs/'>{pathname === '/docs/' && navCaret}docs</Link>
            </li>
          </ul>
          <hr />
          <ul>
            {headings.map(({ value, depth }) => {
              const hash = value.replace(/[^a-zA-Z]/g, '').toLowerCase()
              return (
                <li className={`nav-depth-${depth}`}>
                  <Link onClick={smoothNav} to={`${slug}#${hash}`}>
                    {(win.location.hash || '').endsWith(hash) && navCaret}
                    {value}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </div>
  )
}
