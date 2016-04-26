import test from 'ava'
import { Observable } from 'rxjs/Observable'
import { createEventHandler } from '../'

// Observable polyfill
global.Observable = Observable

test('createEventHandler creates a subject that broadcasts new values when called as a function', t => {
  const result = []
  const eventHandler = createEventHandler()
  const subscription = eventHandler.subscribe(v => result.push(v))

  eventHandler(1)
  eventHandler(2)
  eventHandler(3)

  subscription.unsubscribe()
  t.deepEqual(result, [1, 2, 3])
})
