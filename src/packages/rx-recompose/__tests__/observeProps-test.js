import test from 'ava'
import React from 'react'
import { Observable } from 'rxjs/Observable'
import { combineLatest } from 'rxjs/operator/combineLatest'
import { startWith } from 'rxjs/operator/startWith'
import { scan } from 'rxjs/operator/scan'
import { _do } from 'rxjs/operator/do'
import { map } from 'rxjs/operator/map'
import { withState, compose, branch } from 'recompose'
import identity from 'lodash/identity'
import { observeProps, createEventHandler } from '../'
import { mount, shallow } from 'enzyme'

// Observable polyfill
global.Observable = Observable

test('maps a stream of owner props to a stream of child props', t => {
  const SmartButton = observeProps(props$ => {
    const { handler: onClick, stream: increment$ } = createEventHandler()
    const count$ = increment$
      ::startWith(0)
      ::scan(total => total + 1)

    return props$::combineLatest(count$, (props, count) => ({
      ...props,
      onClick,
      count
    }))
  })('button')

  t.is(SmartButton.displayName, 'observeProps(button)')

  const button = mount(<SmartButton pass="through" />).find('button')

  button.simulate('click')
  button.simulate('click')
  button.simulate('click')

  t.is(button.prop('count'), 3)
  t.is(button.prop('pass'), 'through')
})

test('works on initial render', t => {
  const SmartButton = observeProps(props$ => {
    const { handler: onClick, stream: increment$ } = createEventHandler()
    const count$ = increment$
      ::startWith(0)
      ::scan(total => total + 1)

    return props$::combineLatest(count$, (props, count) => ({
      ...props,
      onClick,
      count
    }))
  })('button')

  const button = shallow(<SmartButton pass="through" />).find('button')

  t.is(button.prop('count'), 0)
  t.is(button.prop('pass'), 'through')
})

test('receives prop updates', t => {
  const SmartButton = observeProps(props$ => {
    const { handler: onClick, stream: increment$ } = createEventHandler()
    const count$ = increment$
      ::startWith(0)
      ::scan(total => total + 1)

    return props$::combineLatest(count$, (props, count) => ({
      ...props,
      onClick,
      count
    }))
  })('button')

  const Container = withState('label', 'updateLabel', 'Count')(SmartButton)

  const button = mount(<Container />).find('button')
  const { updateLabel } = button.props()

  t.is(button.prop('label'), 'Count')
  updateLabel('Current count')
  t.is(button.prop('label'), 'Current count')
})

test('unsubscribes before unmounting', t => {
  const { handler: onClick, stream: increment$ } = createEventHandler()
  let count = 0

  const Container = compose(
    withState('observe', 'updateObserve', false),
    branch(
      props => props.observe,
      observeProps(() =>
        increment$
          ::_do(() => count += 1)
          ::map(() => ({}))
      ),
      identity
    )
  )('div')

  const div = mount(<Container />).find('div')
  const { updateObserve } = div.props()

  t.is(count, 0)
  updateObserve(true) // Mount component
  onClick()
  t.is(count, 1)
  onClick()
  t.is(count, 2)
  updateObserve(false) // Unmount component
  onClick()
  t.is(count, 2)
})

test('renders null until stream of props emits value', t => {
  let observer
  const props$ = new Observable(o => {
    observer = o
  })
  const Container = observeProps(() => props$)('div')
  const wrapper = mount(<Container />)

  t.false(wrapper.some('div'))
  observer.next({ foo: 'bar' })
  t.is(wrapper.find('div').prop('foo'), 'bar')
})
