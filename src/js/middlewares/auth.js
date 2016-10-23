const unlockedPaths = [
  '/',
  '/login',
  '/signup'
];

function auth(ctx, next) {
  const user = firebase.auth().currentUser;
  if (user) {
    ctx.user = user.toJSON();
    return next();
  } else if (!unlockedPaths.includes(ctx.pathname)) {
    page.redirect('/login');
  }
  next();
}
