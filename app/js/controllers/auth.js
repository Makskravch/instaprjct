(() => {

  App.addController('auth', (ctx, next) => {

    const currentUser = firebase.auth().currentUser;

    console.log(currentUser);
    if (currentUser) {
      ctx.user = currentUser;
      next();
    } else {
      // page('/login');
    }


  });

})();
