(() => {

  App.addController('main', (ctx, next) => {
    ctx.template = 'main';

    ctx.onAfterRender = () => {
      console.log('done');
    };

    next();
  });

})();
