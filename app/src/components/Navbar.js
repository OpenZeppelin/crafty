import React from 'react'
import { observer, inject } from 'mobx-react'
import { withRouter, NavLink } from 'react-router-dom'

import './NavBar.css'

const NavBar = withRouter(inject('store')(observer(({ className, store }) => (
  <div className={`${className} nav-bar`}>
{
 //    <NavLink
 //     className='nav-item'
 //     exact
 //     to={'/'}
 //   >
 //     Featured
 //   </NavLink>
}
    <NavLink
      className='nav-item'
      exact
      to={'/'}
    >
      Discover
    </NavLink>
    {store.web3Context.currentAddress &&
      <NavLink
        className='nav-item'
        exact
        to={`/tokens/${store.web3Context.currentAddress}`}
      >
        Wallet
      </NavLink>
    }
    <NavLink
      className='nav-item'
      exact
      to={'/craft'}
    >
      New Recipe
    </NavLink>
  </div>
))))

export default NavBar
