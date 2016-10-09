(() => {

  const {
    authController,
    userController,
    loginController,
    mainController
  } = App.controllers;

  page('*', authController);
  page('/', mainController);
  page('/login', loginController);
  page('/user', userController);
  page();

})();
