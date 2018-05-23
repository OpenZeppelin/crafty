import React from 'react'
import { observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { now } from 'mobx-utils'

import Subtitle from './Subtitle'
import Emoji from './Emoji'

@inject('store')
@observer
class WithWeb3Context extends React.Component {
  static defaultProps = {
    read: false,
    write: false,
  }

  @observable start = now()

  renderNotice = (children) => {
    // avoid flashing the screen when loading
    if (Date.now() - this.start < 300) {
      return null
    }
    return (
      <Subtitle className='with-border hella-spacing'>
        {children}
      </Subtitle>
    )
  }

  render () {
    const { read, write } = this.props
    const { web3Context, domain, ui } = this.props.store

    if (read && !domain.canRead) {
      // the app needs read abilities for this component
      // but we don't have it

      if (!web3Context.hasWeb3) {
        return this.renderNotice(
          <p className='text-center'>
            We need a web3 connection to display this content! Connect to this website with
            MetaMask, Mist, or a mobile dApp browser like Cipher, Toshi, or Status.
          </p>
        )
      }

      if (!web3Context.hasNetwork) {
        return this.renderNotice(
          <p className='text-center'>
            We have a web3 connection, but it&#39;s not connected to a network! Check your internet connection?
          </p>
        )
      }

      if (!domain.hasCrafty) {
        return this.renderNotice(
          <p className='text-center'>
            We&#39;re connected to a network, but the Crafty contract isn&#39;t available.
            Are you sure you&#39;re connected to the right network?
          </p>
        )
      }

      return this.renderNotice(
        <p className='text-center'>
          ¯\_(ツ)_/¯ Whelp, something went horribly wrong here.
        </p>
      )
    }

    if (write && !web3Context.canWrite) {
      // we need write permissions for this component
      // but we don't have them

      if (web3Context.isLocked) {
        if (ui.isMetaMask) {
          return this.renderNotice(
            <p className='text-center'>
              Your MetaMask is locked! <Emoji e='🔐' />
            </p>
          )
        } else {
          return this.renderNotice(
            <p className='text-center'>
              We&#39;ve got a web3 connection, but no access to accounts!
            </p>
          )
        }
      }

      return this.renderNotice(
        <p className='text-center'>
          ¯\_(ツ)_/¯ Whelp, something went horribly wrong here.
        </p>
      )
    }

    // we either require no permissions or have all of them

    // so render the children
    return this.props.children || this.props.render()
  }
}

export default WithWeb3Context
