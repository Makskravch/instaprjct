function fetchProfile(ctx, next) {
  render('preloader');
  firebase
    .database()
    .ref(`users/${ctx.user.uid}`)
    .once('value')
    .then((snapshot) => {
      ctx.profile = snapshot.val();
      next();
    })
    .catch(err => console.log(err));
}
