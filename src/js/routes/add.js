function add(ctx, next) {
  render('add', ctx, { filters: Editor.FILTERS });

  new Editor('#editor', {
    currentUser: ctx.user,
    onSave: () => {
      page.redirect('/');
    }
  });
}
