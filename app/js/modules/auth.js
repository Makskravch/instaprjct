(() => {

  const {
    helpers: { qs, qsa },
    templates
  } = App;

  const userInfoEl = qs('#user-info');
  const auth       = firebase.auth();

  const checkAuth = (ctx, next) => {
    const { currentUser } = firebase.auth();
    console.log(currentUser ? currentUser : 'no user');
    next();
  };

  App.auth = {
    checkAuth
  };

})();
