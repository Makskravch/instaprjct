function main(ctx, next) {
  if (!ctx.user) {
    return render('main');
  }

  const dbRef = firebase.database().ref();

  dbRef.child('posts').limitToLast(10).once('value', (ref) => {
    console.log(ref.val());
    render('main', { posts: values(ref.val()) });
  });
}
