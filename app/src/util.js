import { reaction } from 'mobx'
import { fromResource } from 'mobx-utils'

import pMap from 'p-map'
import range from 'lodash/range'
import { asyncComputed as originalAsyncComputed } from 'computed-async-mobx'

export const uid = () => {
  return `${+(new Date())}-${Math.random()}`
}

export const createFromEthereumBlock = (blockNumber) => (initial, dataFn, fn) => {
  let disposer
  return fromResource(
    (sink) => {
      disposer = reaction(
        () => [dataFn(), blockNumber],
        async ([data]) => {
          try {
            sink(await fn(data))
          } catch (error) {
            // @TODO(handle errors)
            console.error(error)
            debugger
          }
        },
        { fireImmediately: true }
      )
    },
    () => {
      disposer()
    },
    initial
  )
}

export const asyncComputed = (initial, fn) => {
  // wrap asyncComputed so it follows the same api as fromResource
  const computed = originalAsyncComputed(initial, 1000, fn)
  return {
    current: computed.get,
  }
}

export const collect = async (times, mapper) => pMap(
  range(times),
  mapper,
  { concurrency: 10 }
)
