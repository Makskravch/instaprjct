(() => {

  App.addController('logout', (ctx) => {
    if (!ctx.user) return;

    firebase.auth().signOut().then(() => page('/'));
  });

})();
