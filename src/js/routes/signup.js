function signup(ctx, next) {
  render('signup');

  const auth = firebase.auth();
  const errorsContainer = qs('#errors');
  console.dir(errorsContainer);

  const errors = {
    'confirmation-error': 'Password must be the same in both fields'
  }

  function showError(errorName) {
    // render all error messages
    [].concat(errorName).forEach(name => {
      const item = document.createElement('li');
      item.className = 'list-group-item list-group-item-danger';
      item.setAttribute('data-error-name', name);
      item.textContent = errors[name];
      errorsContainer.appendChild(item);
    });

    // show error container
    if (errorsContainer.hidden) {
      errorsContainer.hidden = false;
    }
  }

  function hideError(errorName) {
    const error = qs(`[data-error-name="${errorName}"]`, errorsContainer);
    errorsContainer.removeChild(error);
    if (errorsContainer.childElementCount == 0) {
      errorsContainer.hidden = true;
    }
  }

  document.forms['signup-form'].addEventListener('submit', (e) => {
    const form = e.target;
    const { email, password, password_confirm } = form.elements;

    e.preventDefault();

    if (password.value !== password_confirm.value) {
      return showError('confirmation-error');
    }

    auth
      .createUserWithEmailAndPassword(email.value, password.value)
      .then(user => console.log(user))
      .catch(err => console.log(err));
  });
}
