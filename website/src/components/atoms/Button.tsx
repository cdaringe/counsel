import * as React from 'react'
import './Button.css'

export default (props: React.HTMLAttributes<HTMLButtonElement>) => {
  const { className, style = {}, ...rest } = props
  return (
    <button
      className={`button ${className || ''}`}
      style={{ backgroundColor: '', ...style }}
      {...rest}
    />
  )
}
