import React from 'react'
import { observer, inject } from 'mobx-react'
import { withRouter, NavLink } from 'react-router-dom'

import './NavBar.css'

const NavBar = withRouter(inject('store')(observer(({ className, store }) => (
  <div className={`${className} nav-bar`}>
    <NavLink
      className='nav-item with-border'
      exact
      to={'/'}
    >
      Featured
    </NavLink>
    <NavLink
      className='nav-item with-border'
      exact
      to={'/discover'}
    >
      Discover
    </NavLink>
    {store.web3Context.currentAddress &&
      <NavLink
        className='nav-item with-border'
        exact
        to={`/tokens/${store.web3Context.currentAddress}`}
      >
        My Craftable Tokens
      </NavLink>
    }
    <NavLink
      className='nav-item with-border'
      exact
      to={'/craft'}
    >
      + Build a Craftable Token
    </NavLink>
  </div>
))))

export default NavBar
