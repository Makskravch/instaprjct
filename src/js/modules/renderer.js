(() => {

  const App = window.App || {};

  const rootElement = document.getElementById('page-content');
  const templates = {};

  const noop = () => {};

  const fetchTemplate = (name) => {
    const tpl = templates[name];

    if (tpl) return Promise.resolve(tpl);

    return fetch(`templates/${name}.hbs`)
      .then(res => {
        return res.text();
      })
      .then(str => {
        const tpl = Handlebars.compile(str);
        templates[name] = tpl;
        return tpl;
      })
      .catch(err => {
        throw new Error(`Failed to fetch template 'templates/${name}.hbs'`);
      });
  };

  [
    'header'
  ].forEach(name => {
    fetchTemplate(name).then(str => {
      Handlebars.registerPartial(name, str);
    });
  });

  const render = (ctx, next) => {
    const { template, onAfterRender = noop } = ctx;

    console.log('renderer');
    if (!template || typeof template !== 'string') return next();

    console.time('render');
    fetchTemplate(template).then(tpl => {
      rootElement.innerHTML = tpl(ctx);
      onAfterRender();
      ctx.onAfterRender = null;
      console.timeEnd('render');
      next();
    });
  };

  App.rootElement = rootElement;
  App.templates   = templates;
  App.renderer    = render;

})();
