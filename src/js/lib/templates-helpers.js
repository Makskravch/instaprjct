(function() {

  const icons = {
    twitter     : 'fa fa-twitter',
    facebook    : 'fa fa-facebook',
    vkontakte   : 'fa fa-vk',
    website     : 'fa fa-globe',
    publicEmail : 'fa fa-envelope-o',
    phoneNumber : 'fa fa-phone'
  };

  const socialLinkTemplates = {
    twitter     : (param) => `https://twitter.com/${param}`,
    facebook    : (param) => `https://www.facebook.com/${param}`,
    vkontakte   : (param) => `https://vk.com/${param}`,
    website     : (param) => param,
  };

  Handlebars.registerHelper('socialIconFor', (name) => {
    return icons[name] || '';
  });

  Handlebars.registerHelper('socialLinkFor', (name, value) => {
    const tpl = socialLinkTemplates[name];
    if (!tpl) return name;
    return tpl(value);
  });

  Handlebars.registerHelper('decamelize', (str) => {
    return str
      .split(/(?=[A-Z])/)
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  });

  Handlebars.registerHelper('formatDate', (dateString) => {
    return moment(dateString).fromNow(true);
  });

  Handlebars.registerHelper('sortBy', (collection, propName, invert) => {
    console.time('sort');
    const copy = Array.isArray(collection)
      ? collection.slice()
      : Object.keys(collection).map(k => collection[k]);

    const sorted = copy.sort((a, b) => {
      if (!(propName in a) || !(propName in b)) return -1;
      if (a[propName] === b[propName]) return 0;
      return a[propName] > b[propName] ? 1 : -1;
    });

    // strict equal with 'true' here is required
    // because Handlebars helper always will be invoked
    // with 'options' as last parameter, and when 'invert'
    // is omited then 'invert' === 'options'
    if (invert === true) sorted.reverse();
    console.timeEnd('sort');
    return sorted;
  });

} ());
