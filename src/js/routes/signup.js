function signup(ctx, next) {
  if (ctx.user) {
    return page.redirect('/profile');
  }

  render('signup');

  const auth            = firebase.auth();
  const signupForm      = document.forms['signup-form'];
  const submitBtn       = qs('[type="submit"]', signupForm);
  const errorsContainer = qs('#errors', signupForm);

  const messages = {
    'invalid-email': 'Email is invalid',
    'short-password': 'Password must be at least 6 characters',
    'confirmation-error': 'Wrong password'
  };

  function renderError(errors = []) {
    return [].concat(errors).map(err => {
      return `
        <li class="list-group-item list-group-item-danger">
          <span>${err}</span>
        </li>
      `;
    }).join('');
  }

  function showErrors(errors) {
    // render all error messages
    errorsContainer.innerHTML = renderError(errors);
    // show error container
    errorsContainer.hidden = false;
  }

  function hideErrors(errorName) {
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

  function onUserCreated(user) {
    const usersRef = firebase.database().ref(`users/${user.uid}`);
    const userData = pick(user, ['uid', 'email', 'displayName', 'photoURL']);
    usersRef.set(userData)
      .then(() => {
        user.sendEmailVerification();
        page.redirect('/profile');
      });
  }

  function onUserCreationError(error) {
    unsetLoadingState();
    showErrors(error.message);
  }

  signupForm.addEventListener('submit', (e) => {
    const errors = [];
    const form   = e.target;
    const { email, password, password_confirm } = form.elements;

    e.preventDefault();

    if (email.value.indexOf('@') === -1) {
      errors.push('Email is invalid');
    }

    if (password.value.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (password.value !== password_confirm.value) {
      errors.push('Wrong password');
    }

    if (errors.length) {
      return showErrors(errors);
    }

    setLoadingState();
    hideErrors();
    auth
      .createUserWithEmailAndPassword(email.value, password.value)
      .then(onUserCreated)
      .catch(onUserCreationError);
  });
}
