(() => {

  App.addController('main', (ctx, next) => {

    App.fetchTemplate('main').then(tpl => {
      console.time('render');
      App.render(tpl(ctx));
      console.timeEnd('render');
    });

  });

})();
