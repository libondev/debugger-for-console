/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

const num = 10
const arr = ['a', 'b', 'c']

const obj = {
  name: 'John',
  age: 20,
}

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

const longStatement = window.name.includes('abc')[0].toUpperCase().toLowerCase()

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
