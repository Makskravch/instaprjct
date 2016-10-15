(() => {

  App.addController('user', (ctx, next) => {
    ctx.template = 'user';

    ctx.onAfterRender = () => {
      console.log(ctx);
    };

    next();
  });

})();
