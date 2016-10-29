function profile(ctx, next) {
  render('profile');

  new UserProfile('#edit-profile');
}
