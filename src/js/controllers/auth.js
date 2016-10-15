(() => {

  App.addController('auth', (ctx, next) => {

    const auth = firebase.auth();
    const user = auth.currentUser;

    if (user) {
      ctx.user = user;
      return next();
    }

    if (ctx.path === '/login') {
      next();
    } else {
      page.redirect('/login');
    }

    // if (ctx.init) {

    //   const unsubscribe = auth.onAuthStateChanged((user) => {
    //     if (user) {
    //       ctx.user = user;
    //       next();
    //     } else {
    //       page('/login');
    //     }
    //     unsubscribe();
    //   });

    // } else {

    //   if (user) {
    //     ctx.user = user;
    //     next();
    //   } else {
    //     page('/login');
    //   }

    // }
  });

})();
