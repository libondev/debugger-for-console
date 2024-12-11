/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

const num = 10
const arr = ['a', 'b', 'c']

const obj = {
  name: 'John',
  age: 20,
}

const stringWithSpaces = `Hello\" \' \` World`
const [...list] = [...arr]

function printHello() {

  const test = 'TEST'

  obj.value?.[0]?.test()

  Promise.resolve()
    .then((res) => {

    })
    .catch((err) => {

    })
}

if (true) {
  printHello()
}

printHello()

const initApp = () => { }

const veryLongStatement = window.name.includes('abc'.toUpperCase())[0].toLowerCase().includes('a')

(() => {
  initApp(Vue)

  let app = new Vue({
    router,
    store,
    i18n,
    render: () => h(App)
  })

  const METHODS = {
    mount(param) {

      app = app.$mount('#app')
    },

    unmount() {
      app.$destroy()
    }
  }
})()
