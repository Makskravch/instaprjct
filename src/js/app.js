(() => {

  //=require 'modules/helpers.js'
  //=require 'routes/*.js'

  const { location, history, helpers, templates } = window;
  const { qs, qsa } = helpers;
  const rootElement = qs('#root');

  const routes = {
    '/': main,
    '/login': login,
    '/logout': logout,
    '/user': user
  };

  function notFoundRoute() {
    renderTemplate('404');
  }

  function renderTemplate(templateName, data = {}) {
    const user    = firebase.auth().currentUser;
    const tplData = Object.assign({ user }, data);
    rootElement.innerHTML = templates[templateName](tplData);
  }

  function navigateTo(path, state = null) {
    history.pushState(state, '', path);
    render();
  }

  function redirectTo(path, state = null) {
    history.replaceState(state, '', path);
    render();
  }

  function checkUser() {
    if (!firebase.auth().currentUser) {
      redirectTo('/login');
    }
  }

  function render() {
    const route = routes[location.pathname];
    console.log(location.pathname, route);
    if (typeof route === 'function') {
      return route();
    }
    notFoundRoute();
  }

  function onClick(e) {
    if (
      e.target.tagName !== 'A'
      || e.target.pathname === location.pathname
    ) return;
    e.preventDefault();
    navigateTo(e.target.pathname);
  }

  window.addEventListener('popstate', render);
  document.addEventListener('click', onClick);

  render();

})();
