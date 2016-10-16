(() => {

  const {
    auth,
    user,
    login,
    logout,
    main
  } = App.controllers;

  // page('*', auth);
  page('/', main);
  page('/login', login);
  page('/logout', logout);
  page('/user', user);
  page('*', App.renderer);
  page();

})();
