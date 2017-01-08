function main(ctx, next) {
  render('main', ctx);

  if (!ctx.user) {
    return;
  }

  const feed  = qs('#feed');
  const dbRef = firebase.database().ref();

  dbRef
    .child('posts')
    .limitToLast(10)
    .once('value', snapshot => {
      const entries = snapshot.val();
      if (!entries) return;
      sortBy(entries, 'created').forEach(entry => {
        const post = new Post(entry, { currentUser: ctx.user });
        feed.insertBefore(post.getElement(), feed.firstElementChild);
      });
    });
}
