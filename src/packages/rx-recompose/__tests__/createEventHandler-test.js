import test from 'ava'
import { Observable } from 'rxjs/Observable'
import { createEventHandler } from '../'

// Observable polyfill
global.Observable = Observable

test('createEventHandler returns an object with a handler and a stream', t => {
  const result = []
  const { handler, stream } = createEventHandler()
  const subscription = stream.subscribe(v => result.push(v))

  handler(1)
  handler(2)
  handler(3)

  subscription.unsubscribe()
  t.deepEqual(result, [1, 2, 3])
})

test('handles multiple subscribers', t => {
  const result1 = []
  const result2 = []
  const { handler, stream } = createEventHandler()
  const subscription1 = stream.subscribe(v => result1.push(v))
  const subscription2 = stream.subscribe(v => result2.push(v))

  handler(1)
  handler(2)
  handler(3)

  subscription1.unsubscribe()
  subscription2.unsubscribe()

  t.deepEqual(result1, [1, 2, 3])
  t.deepEqual(result2, [1, 2, 3])
})
