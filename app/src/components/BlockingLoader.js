import React from 'react'
import Tetris from 'react-tetris'
import { Portal } from 'react-portal'
import { observer } from 'mobx-react'

import './Tetris.css'
import './BlockingLoader.css'

@observer
class BlockingLoader extends React.Component {
  componentDidUpdate (prevProps) {
    if (!prevProps.open && this.props.open) {
      // opening
      document.getElementsByTagName('BODY')[0].style.overflow = 'hidden'
    } else if (prevProps.open && !this.props.open) {
      // closing
      document.getElementsByTagName('BODY')[0].style.overflow = 'auto'
    }
  }

  render () {
    if (!this.props.open) { return null }

    if (this.props.canClose) {
      this.props.requestClose()
      return null
    }

    return (
      <Portal>
        <div className='blocking-loader modal-layer'>
          <div className='modal'>
            <h2 className='black-bold-text big-text'>{this.props.title}</h2>
            <p>Please accept the transaction on your wallet when it appears. Why not play a nice game of Tetris meanwhile?</p>
            <Tetris>
              {({
                Gameboard,
              }) => {
                return (
                  <div className='game-board-container'>
                    <Gameboard />
                  </div>
                )
              }}
            </Tetris>
          </div>
        </div>
      </Portal>
    )
  }
}

export default BlockingLoader
