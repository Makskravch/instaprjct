function fetchProfile(ctx, next) {
  render('preloader');
  const dbRef = firebase.database().ref(`users/${ctx.user.uid}`);
  dbRef.once('value').then((snapshot) => {
    ctx.profile = snapshot.val();
    next();
  });
}
