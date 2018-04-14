import React from 'react'

import Emoji from './Emoji'

import './Footer.css'

const Footer = () => (
  <footer className='grid-x grid-padding-x align-bottom'>
    <div className='cell auto'>
      <p><Emoji e='🎈' /> Made by Zeppelin</p>
    </div>
  </footer>
)

export default Footer
