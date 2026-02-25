import React from 'react'
import { Logo } from './Logo'
import PunkIcon from './Icon'

const punkStep = () => {
  window.open('https://www.punkstep.com', '_blank')
}

const TopRightComponent = () => {
  return (
    <div className="top-right">
      <Logo />
      <PunkIcon onClick={punkStep} />
    </div>
  )
}

export default TopRightComponent
