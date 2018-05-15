import React from 'react'
import Tetris from 'react-tetris'
import { Portal } from 'react-portal'
import { observer } from 'mobx-react'

import './Tetris.css'
import './BlockingLoader.css'

@observer
class BlockingLoader extends React.Component {
  render () {
    if (this.props.open) {
      return (
        <Portal>
          <div className='blocking-loader'>
            <div>
              <h2>{this.props.title}</h2>
              <p>Why not play a nice game of Tetris?</p>
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
              {this.props.canClose &&
                <div>
                  {this.props.finishText}
                  <button
                    className='button inverted'
                    onClick={this.props.requestClose}
                  >
                    Done Playing
                  </button>
                </div>
              }
            </div>
          </div>
        </Portal>
      )
    }

    return null
  }
}

export default BlockingLoader
