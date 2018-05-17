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
      document.getElementsByTagName("BODY")[0].style.overflow = 'hidden';
      return (
        <Portal>
          <div className='blocking-loader modal-layer'>
            <div className="modal">
              <h2 className="black-bold-text big-text">{this.props.title}</h2>
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
                  <br/>
                  <button
                    className='btn'
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

    document.getElementsByTagName("BODY")[0].style.overflow = 'auto';
    return null
  }
}

export default BlockingLoader
