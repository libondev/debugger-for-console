/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

const num = 10;

const str = 'Hello';

const reg = /abcdefg/;

const arr = ['a', 'b', 'c'];
const multiArr = [...arr, ...arr];

const [...list] = [...arr];

const arrowFn = (..._args) => {};

const stringWithSpacesAndQuotes = `Hello\" \' \` World`;

const obj = {
    name: 'John',
    age: 20
};

const computedStyle = computed(() => {
    const styles = {
        ...config.style
    };

    return styles;
});

async function fnScope(length = obj['name'].length) {
    const say = 'hello,' + 'world!';

    const obj = {
        name: 'John',
        age: 20,
        value: [1, 2, 3]
    };

    const is = (1 && 2) || 3;

    const arrowFn = (arr) => {};

    const sortedEntries = Object.entries(obj).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));

    obj.value?.[0]?.test();

    const res = await fetch('https://api.github.com/users/octocat', {
        data: fn(data)
    });

    Promise.resolve()
        .then((res) => {})
        .catch((err) => {});
}

watch(
    () => preferences.theme.mode,
    () => globalThis.updateTheme(getLatestTheme())
);

const veryLongStatement = window.name.includes('abc'.toUpperCase())[0].toLowerCase().includes('a')?.length;

function initApp(Vue) {
    let app = new Vue({
        router,
        store,
        i18n,
        render: () => h(App)
    });

    const arr = new Array([1, 2, 3]);

    setSelectedImage(result.assets[0].uri);

    const METHODS = {
        mount({ aaa, bbb }) {
            app = app.$mount('#app');
        },

        unmount() {
            app.$destroy();
        }
    };
}

if (Math.random() > 0.5) {
    fnScope(obj['name'].length);
}

export function getTemplate(colors) {
    const { background, foreground, ...theme } = colors;

    theme.key ||= theme.css;

    return theme;
}
