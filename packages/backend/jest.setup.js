globalThis.getConfig = ({
  backend = {},
  frontend = {},
}) => ({
  boardSetup: {
    height: 10,
    testMode: false,
    width: 10,
  },
  plugins: [{
    author: '',
    email: '',
    name: 'plugin',
    widgets: {
      widget: {
        backend,
        css: [],
        frontend,
        html: [],
        variables: [],
      },
    },
  }],
  port: 3000,
  rootFolder: '',
  widgets: [{
    id: 'example-widget',
    inputs: {},
    plugin: 'plugin',
    position: {
      height: 10,
      left: 0,
      top: 0,
      width: 10,
    },
    widget: 'widget',
  }],
});