import React from 'react'
import { observer, inject } from 'mobx-react'

import Emoji from './Emoji'

import './Header.css'

const InfoBar = inject('store')(observer(({ store, className }) => (
  <div className={`${className} info-bar`}>
    {!store.web3Context.web3 &&
      <span className='info-item'>No web3 injected <Emoji e='⚠' /></span>
    }
    {store.web3Context.web3 && !store.web3Context.currentAddress &&
      <span className='info-item'>web3 injected but locked <Emoji e='🔐' /></span>
    }
    {store.web3Context.web3 && store.web3Context.currentAddress && [
      <span className='info-item' key='network'>
        {store.web3Context.network.description} 🌐
        {store.ui.isMetaMask && <Emoji e='🐱' />}
      </span>,
      <span className='info-item' key='address'>
        {store.web3Context.currentAddress.substr(0, 8)}… <Emoji e='👤' />
      </span>,
      <span className='info-item' key='crafty'>
        {store.domain.crafty
          ? <span>{store.domain.crafty.address.substring(0, 8)}… <Emoji e='🚧' /></span>
          : <span>Crafty contract not detected <Emoji e='⚠' /></span>
        }
      </span>,
    ]}
  </div>
)))

const Header = ({ children }) => (
  <header className='grid-y grid-padding-y'>
    <InfoBar className='cell shrink' />
    <div className='cell auto header-content'>
      <h1>{children}</h1>
    </div>
  </header>
)

export default Header
