(() => {

  const App = window.App || {};

  const userInfo = ({ email = '', displayName = '' }) =>
    `<span>${email}</span><br><span>${displayName}</span>`;

  /**
   * Export templates
   */
  App.templates = {
    userInfo
  };

})();
