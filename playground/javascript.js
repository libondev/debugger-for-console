/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

const num = 10

const str = 'Hello'

const reg = /abcdefg/

const arr = ['a', 'b', 'c']

const [...list] = [...arr]

const arrowFn = (..._args) => {}

const stringWithSpacesAndQuotes = `Hello\" \' \` World`

const obj = {
  name: 'John',
  age: 20,
}

function fnScope() {

  const say = 'hello,' + 'world!';
  console.debug('🚀jav…:25/(say):\n', say)

  obj.value?.[0]?.test()

  Promise.resolve()
    .then((res) => {

    })
    .catch((err) => {

    })
}

const veryLongStatement = window.name.includes('abc'.toUpperCase())[0].toLowerCase().includes('a')?.length

function initApp(Vue) {
  let app = new Vue({
    router,
    store,
    i18n,
    render: () => h(App),
  })

  const METHODS = {
    mount(param) {

      app = app.$mount('#app')
    },

    unmount() {
      app.$destroy()

    }
  }
}

if (Math.random() > 0.5) {
  fnScope(

  )

} else {
  initApp(

  )

}
