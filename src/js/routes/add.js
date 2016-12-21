function add(ctx, next) {
  render('add', { filters: Editor.FILTERS });
  new Editor('#editor');
}
