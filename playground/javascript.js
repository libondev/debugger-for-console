/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

const num = 10

const str = 'Hello'

const reg = /abcdefg/

const arr = ['a', 'b', 'c']
const multiArr = [
  ...arr,
  ...arr,
]

const [...list] = [...arr]

const arrowFn = (..._args) => {}

const stringWithSpacesAndQuotes = `Hello\" \' \` World`

const obj = {
  name: 'John',
  age: 20,
}

function fnScope() {

  const say = 'hello,' + 'world!';

  const obj = {
    name: 'John',
    age: 20,
    value: [
      {
        test() {

        }
      }
    ]
  }

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

  const arr = new Array([
    1,
    2,
    3,
  ])

  const METHODS = {
    mount({
      aaa,
      bbb,
    }) {
      app = app.$mount('#app')
    },

    unmount() {
      app.$destroy()

    }
  }
}

if (Math.random() > 0.5) {
  fnScope(

    '123',

  )

} else {
  initApp(

    '456',

  )

}
