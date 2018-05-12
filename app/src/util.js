import { reaction, observable, runInAction } from 'mobx'
import { fromResource } from 'mobx-utils'

import pMap from 'p-map'
import range from 'lodash/range'
import { asyncComputed as originalAsyncComputed } from 'computed-async-mobx'

export const uid = () => {
  return `${+(new Date())}-${Math.random()}`
}

export const createFromEthereumBlock = (blockNumber) => (initial, dataFn, fn) => {
  let disposer
  let isBusy = observable.box(false)
  const resource = fromResource(
    (sink) => {
      disposer = reaction(
        () => [dataFn(), blockNumber],
        async ([data]) => {
          try {
            runInAction(() => isBusy.set(true))
            sink(await fn(data))
          } catch (error) {
            // @TODO(handle errors)
            console.error(error)
            debugger
          } finally {
            runInAction(() => isBusy.set(false))
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

  return {
    ...resource,
    busy: isBusy.get.bind(isBusy),
  }
}

export const asyncComputed = (initial, fn) => {
  // wrap asyncComputed so it follows the same api as fromResource
  const computed = originalAsyncComputed(initial, 15000, fn)
  return {
    busy: () => computed.busy,
    current: computed.get,
  }
}

export const collect = async (times, mapper) => pMap(
  range(times),
  mapper,
  { concurrency: 10 }
)
