import React from 'react'

import Emoji from './Emoji'

import './Footer.css'

const Footer = () => (
  <footer className='grid-x grid-padding-x space-between flex-center'>
  	<div className='flex-center'>
  		<a target="_blank" href="https://github.com/zeppelinos/crafty">
  			<img alt='Github' className='github' src='./images/github.svg'/>
  		</a>
  		<div>
	  		<span className='light'>Last block:</span>
	  		<span className='strong'> #3212515 (mined 21 seconds ago)</span>
  		</div>
  	</div>
    <div className='cell auto'>
      <p className='light'>
        Powered by <a target="_blank" href='https://XLNT.co'>XLNT</a> and <a target="_blank" href='http://zeppelinos.org/'>Zeppelin_OS</a>
      </p>
    </div>
  </footer>
)

export default Footer
