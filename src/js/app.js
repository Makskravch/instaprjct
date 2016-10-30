'use strict';

(() => {

  firebase.initializeApp({
    apiKey: 'AIzaSyDdklaao0vq0DcAkCXzYFoZeVJTy9kOoGA',
    authDomain: 'prjctr-84d57.firebaseapp.com',
    databaseURL: 'https://prjctr-84d57.firebaseio.com',
    storageBucket: 'prjctr-84d57.appspot.com',
    messagingSenderId: '459426391837'
  });

  //=require 'lib/*.js'
  //=require 'classes/*.js'
  //=require 'middlewares/*.js'
  //=require 'routes/*.js'

  const { location, history, templates } = window;
  const rootElement = qs('#root');

  function render(tplName, data = {}) {
    const user = firebase.auth().currentUser;
    const userData = user ? user.toJSON() : null;
    data = Object.assign(data, { user: userData });
    rootElement.innerHTML = templates[tplName](data);
  }

  function render404() {
    render('404');
  }

  page('*', auth);
  page('/', main);
  page('/login', login);
  page('/logout', logout);
  page('/signup', signup);
  page('/profile', profile);
  page('/profile/edit', profileEdit);
  page('*', render404);

  // simulate firebase 'onready' behavior
  const unsubsribe = firebase.auth().onAuthStateChanged(() => {
    page();
    unsubsribe();
  });

})();
