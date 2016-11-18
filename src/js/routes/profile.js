function profile(ctx, next) {
  render('profile-show', {
    profile: ctx.profile
  });
}
