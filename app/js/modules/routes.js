(() => {

  const { checkAuth } = App.auth;

  const {
    checkUserController,
    loginController
  } = App.controllers;

  page('/login', loginController);

  page('*', checkUserController);

  page('/account', (ctx) => console.log(ctx.currentUser));


  // page('*', '/login');

  page();

})();
