(() => {

  App.addController('user', (ctx) => {

    App.fetchTemplate('user').then(tpl => {

      App.render(tpl(ctx));

      console.log(ctx);

    });

  });

})();
