const createEventHandler = () => {
  let observer
  const stream = Observable.create(o => {
    observer = o
  })
  return {
    handler: value => observer.next(value),
    stream
  }
}

export default createEventHandler
