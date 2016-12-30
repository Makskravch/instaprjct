function main(ctx, next) {
  // if (!ctx.user) {
  //   return render('main');
  // }

  render('main');
  const feed  = qs('#feed');
  const dbRef = firebase.database().ref();

  dbRef
    .child('posts')
    .limitToLast(10)
    .on('child_added', snapshot => {
      const entry = snapshot.val();
      const post = new Post(entry);
      feed.insertBefore(post.getElement(), feed.firstElementChild);
    });
}
