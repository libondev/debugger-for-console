/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

const num = 10;

const str = 'Hello';

const reg = /abcdefg/;

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

const computedStyle = computed(() => {
  const styles = {
    ...config.style,
  };

  return styles;
});

function fnScope(length = obj['name'].length) {

  const say = 'hello,' + 'world!';

  const obj = {
    name: 'John',
    age: 20,
    value: [
      1,
      2,
      3,
    ]
  }

  const is = (
    1 &&
    2 ||
    3
  )

  const arrowFn = (arr) => {

  }

  const sortedEntries = Object.entries(obj).sort(
    (a, b) => parseInt(a[1]) - parseInt(b[1]),
  );

  obj.value?.[0]?.test();

  Promise.resolve()
    .then((res) => {

    })
    .catch((err) => {

    })
}

watch(
  () => preferences.theme.mode,
  () => globalThis.updateTheme(getLatestTheme()),
);

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

    obj['name'].length,

  )

} else {
  initApp(

    obj['name'].length,

  )

}
