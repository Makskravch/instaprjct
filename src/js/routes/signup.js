function signup(ctx, next) {
  render('signup');

  const auth            = firebase.auth();
  const signupForm      = document.forms['signup-form'];
  const submitBtn       = qs('[type="submit"]', signupForm);
  const errorsContainer = qs('#errors', signupForm);

  const errors = {
    'confirmation-error': 'Password must be the same in both fields'
  }

  function renderError(error) {
    errorsContainer.innerHTML = [].concat(error).map(err => {
      return `
        <li class="list-group-item list-group-item-danger">
          <span>${err}</span>
        </li>
      `;
    }).join('');
  }

  function showError(error) {
    // render all error messages
    renderError(error);

    // show error container
    if (errorsContainer.hidden) {
      errorsContainer.hidden = false;
    }
  }

  function hideError(errorName) {
    errorsContainer.innerHTML = '';
    errorsContainer.hidden = true;
  }

  function setLoadingState() {
    signupForm.classList.add('is-loading');
    submitBtn.setAttribute('disabled', true);
  }

  function unsetLoadingState() {
    signupForm.classList.remove('is-loading');
    submitBtn.removeAttribute('disabled');
  }

  signupForm.addEventListener('submit', (e) => {
    const form = e.target;
    const { email, password, password_confirm } = form.elements;

    e.preventDefault();

    if (password.value !== password_confirm.value) {
      return showError(errors['confirmation-error']);
    }

    setLoadingState();
    hideError();
    auth
      .createUserWithEmailAndPassword(email.value, password.value)
      .then(() => page('/profile'))
      .catch(err => {
        unsetLoadingState();
        showError(err.message);
      });
  });
}
