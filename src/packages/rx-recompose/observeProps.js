import createElement from 'recompose/createElement'
import createHelper from 'recompose/createHelper'
import createComponent from './createComponent'

const observeProps = ownerPropsToChildProps => BaseComponent =>
  createComponent(ownerProps$ =>
    Observable.create(observer => {
      const subscription = ownerPropsToChildProps(ownerProps$).subscribe({
        next: childProps => {
          return observer.next(
            createElement(BaseComponent, childProps)
          )
        }
      })
      return () => subscription.unsubscribe()
    })
  )

export default createHelper(observeProps, 'observeProps')
