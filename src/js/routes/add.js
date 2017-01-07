function add(ctx, next) {
  render('add', ctx, { filters: Editor.FILTERS });

  new Editor('#editor', {
    onSave: () => {
      page.redirect('/');
    }
  });
}
