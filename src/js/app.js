(() => {

  firebase.initializeApp({
    apiKey: 'AIzaSyDdklaao0vq0DcAkCXzYFoZeVJTy9kOoGA',
    authDomain: 'prjctr-84d57.firebaseapp.com',
    databaseURL: 'https://prjctr-84d57.firebaseio.com',
    storageBucket: 'prjctr-84d57.appspot.com',
    messagingSenderId: '459426391837'
  });

  //=require 'helpers.js'
  //=require 'routes/*.js'

  const { location, history, templates } = window;
  const rootElement = qs('#root');
  const unlockedPaths = [
    '/',
    '/login',
    '/signup'
  ];

  function getUserData(currentUser) {
    if (!currentUser) return null;
    return pick(currentUser, [
      'displayName',
      'email',
      'photoURL',
      'isAnonymous',
      'emailVerified',
      'uid',
      'someProp'
    ]);
  }

  function render(tplName, data = {}) {
    const user = firebase.auth().currentUser;
    data = Object.assign(data, { user: getUserData(user) });
    rootElement.innerHTML = templates[tplName](data);
  }

  function render404() {
    render('404');
  }

  function auth(ctx, next) {
    const user = firebase.auth().currentUser;
    if (user) {
      ctx.user = pick(user, [
        'displayName',
        'email',
        'photoURL',
        'isAnonymous',
        'emailVerified',
        'uid',
        'someProp'
      ]);
      return next();
    } else if (!unlockedPaths.includes(ctx.pathname)) {
      page('/login');
    }
    next();
  }

  page('*', auth);
  page('/', main);
  page('/login', login);
  page('/logout', logout);
  page('/signup', signup);
  page('/user', user);
  page('*', render404);

  // simulate firebase 'onready' behavior
  const unsubsribe = firebase.auth().onAuthStateChanged(() => {
    page();
    unsubsribe();
  });

})();
