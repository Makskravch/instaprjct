function login(ctx, next) {
  if (ctx.user) {
    return page.redirect('/profile');
  }

  render('login');

  console.log(ctx);
  const loginForm = document.forms['login-form'];

  loginForm && loginForm.addEventListener('submit', (e) => {
    const form = e.target;
    const auth = firebase.auth();
    const { email, password } = form.elements;
    let errors = 0;

    if (email.value.indexOf('@') === -1) {
      errors++;
      email.parentNode.classList.add('has-error');
    } else {
      email.parentNode.classList.remove('has-error');
    }

    if (password.value.length < 6) {
      errors++;
      password.parentNode.classList.add('has-error');
    } else {
      password.parentNode.classList.remove('has-error');
    }

    e.preventDefault();

    if (errors) {
      return alert('Form has invalid data');
    } else {
      auth
        .signInWithEmailAndPassword(email.value, password.value)
        .then(() => {
          page('/profile');
        })
        .catch(err => {
          console.log(err);
        });
    }

  });
}
