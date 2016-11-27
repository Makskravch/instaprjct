function add(ctx, next) {
  render('add', { presets: Editor.PRESETS });
  new Editor('#editor');
}
