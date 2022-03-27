globalThis.getConfig = ({
  backend = {},
  frontend = {},
}) => ({
  port: 3000,
  rootFolder: '',
  boardSetup: {
    width: 10,
    height: 10,
    testMode: false,
  },
  widgets: [{
    id: 'example-widget',
    widget: 'plugin.widget',
    position: {
      top: 0,
      left: 0,
      width: 10,
      height: 10,
    },
    inputs: {},
  }],
  plugins: [{
    name: 'plugin',
    author: '',
    email: '',
    widgets: {
      widget: {
        html: [],
        css: [],
        frontend,
        backend,
        variables: [],
      },
    },
  }],
});