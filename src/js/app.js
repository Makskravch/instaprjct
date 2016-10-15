(() => {

  const App = window.App = {
    controllers: {},

    addController(name, fn) {
      this.controllers[name] = fn;
    },

    render(html = '') {
      if (typeof html !== 'string') {
        throw new TypeError('App.render() takes only string as parameter');
      }
      this.rootElement.innerHTML = html;
    }
  };

  firebase.initializeApp({
    apiKey: 'AIzaSyDdklaao0vq0DcAkCXzYFoZeVJTy9kOoGA',
    authDomain: 'prjctr-84d57.firebaseapp.com',
    databaseURL: 'https://prjctr-84d57.firebaseio.com',
    storageBucket: 'prjctr-84d57.appspot.com',
    messagingSenderId: '459426391837'
  });

})();
