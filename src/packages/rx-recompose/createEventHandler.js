const createEventHandler = () => {
  const observers = []
  const stream = new Observable(observer => {
    observers.push(observer)
    return () => {
      const i = observers.indexOf(observer)
      observers.splice(i, 1)
    }
  })
  return {
    handler: value => observers.forEach(observer => observer.next(value)),
    stream
  }
}

export default createEventHandler
