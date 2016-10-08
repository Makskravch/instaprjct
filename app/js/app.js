(() => {

  const App = window.App = {
    rootContainer: $('#page-content'),
    fetchingView: false,
    controllers: {},

    getView(view) {
      this.fetchingView = true;
      return fetch(`views/${view}.html`)
        .then(res => {
          this.fetchingView = false;
          return res.text();
        })
        .catch(err => {
          throw new Error(`Failed to fetch view "${view}"`);
        });
    },

    addController(name, fn) {
      this.controllers[`${name}Controller`] = fn;
    },

    renderView(view) {
      return this.getView(view)
        .then(html => {
          this.rootContainer.html(html);
          return this;
        });
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
