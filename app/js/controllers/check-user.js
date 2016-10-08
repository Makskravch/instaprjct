(() => {

  App.addController('checkUser', (ctx, next) => {

    const currentUser = firebase.auth().currentUser;

    if (currentUser) {
      console.log(currentUser);
      return next(currentUser);
    }

    page('/login');

  });

})();
