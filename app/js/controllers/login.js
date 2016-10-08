(() => {

  App.addController('login', (ctx, next) => {

    App.renderView('login-form').then(() => {

      const auth = firebase.auth();

      auth.onAuthStateChanged((user) => {
        if (user) {
          ctx.currentUser = user;
          return page('/account');
        } else {
          alert('something going wrong');
        }
      });

      document.forms['login-form'].addEventListener('submit', (e) => {
        const form = e.target;
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
          auth.signInWithEmailAndPassword(email.value, password.value);
        }
      });

    });

  });

})();
