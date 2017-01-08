function login(ctx, next) {
  if (ctx.user) {
    return page.redirect('/profile');
  }

  render('login', ctx);

  new VForm('#login-form', {
    fields: {
      'email': {
        validate: ['required', 'email']
      },
      'password': {
        validate: 'required'
      }
    },
    onValid: (f) => {
      const { email, password } = f.serialize();

      firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          page.redirect('/');
        })
        .catch(defaultErrorHandler);
    }
  });
}
