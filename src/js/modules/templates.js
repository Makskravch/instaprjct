(() => {

  const templates = {};

  /**
   * Fetch template from templates folder
   * @param  {String} template Template name without extension
   * @return {String}          Tempate as string
   */
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

  // precompile templates
  [
    'header'
  ].forEach(name => {
    fetchTemplate(name).then(str => {
      Handlebars.registerPartial(name, str);
    });
  });

  /**
   * Export templates
   */
  App.templates     = templates;
  App.fetchTemplate = fetchTemplate;

})();
