const unlockedPaths = [
  '/',
  '/login',
  '/signup'
];

function auth(ctx, next) {
  const user = firebase.auth().currentUser;

  render('preloader');

  if (user) {
    firebase
      .database()
      .ref(`users/${user.uid}`)
      .once('value')
      .then(snapshot => {
        ctx.user = ctx.profile = snapshot.val();
        next();
      })
      .catch(err => console.log(err));
  } else if (!unlockedPaths.includes(ctx.pathname)) {
    return page.redirect('/login');
  } else {
    next();
  }
}
