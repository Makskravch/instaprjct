function signup(ctx, next) {
  if (ctx.user) {
    return page.redirect('/profile');
  }

  render('signup', ctx);

  const auth       = firebase.auth();
  const signupForm = document.forms['signup-form'];

  new VForm(signupForm, {
    fields: {
      'email': {
        validate: ['required', 'email']
      },
      'username': {
        validate: ['required', 'minLength[3]', 'maxLength[30]'],
        customValidator: (val) => {
          return /^[a-zA-Z0-9_]+$/.test(val)
            || 'Username can contain only letters and numbers';
        }
      },
      'displayName': {
        validate: 'maxLength[100]'
      },
      'password': {
        validate: ['required', 'minLength[6]']
      },
      'passwordConfirm': {
        validate: 'required',
        customValidator: (val) => {
          return val === signupForm.elements['password'].value
            || 'Wrong value. Must be the same as in "Password" field';
        }
      }
    },
    onValid: submit
  });

  /**
   * @param  {VForm} f - VForm class instance
   * @return {Void}
   */
  function submit(f) {
    const formData = f.serialize();
    const { username } = formData;

    f.setLoadingState();

    checkIfUserExist(username,
      // if not exist create new
      () => createNewUser(f, formData),
      // if already exist
      () => {
        f.resetState().setErrorState();
        alert(`Username "${username}" is already in use. Please, try again with another name.`);
      }
    ).catch(err => {
      f.resetState().setErrorState();
      defaultErrorHandler(err);
    });
  }

  /**
   * @param  {string} username
   * @param  {Function} cbNo  - Callback if user with given username not exist.
   * @param  {Function} cbYes - Callback if user with given username exist.
   * @return {Void}
   */
  function checkIfUserExist(username, cbNo = noop, cbYes = noop) {
    return firebase
      .database()
      .ref('users')
      .orderByChild('username')
      .equalTo(username)
      .once('value', snapshot => {
        const val = snapshot.val();
        val ? cbYes(val) : cbNo();
      });
  }

  /**
   * @param  {VForm} f     - VForm class instance.
   * @param  {Object} data - Serialized form data.
   * @return {Void}
   */
  function createNewUser(f, data) {
    console.log('creation');
    const { email, password, username, displayName } = data;

    auth
      .createUserWithEmailAndPassword(email, password)
      // update firebase internal user's displayName
      .then(user => {
        user.updateProfile({ displayName });
        user.sendEmailVerification();
        return user;
      })
      // create user in our database
      .then(user => {
        const { uid, photoURL } = user;
        return firebase
          .database()
          .ref(`users/${uid}`)
          .set({ uid, username, displayName, photoURL });
      })
      // when user was successfull created
      .then(() => {
        f.resetState().setSuccessState();
        setTimeout(() => {
          f.element.reset();
          page.redirect('/');
        }, 1000);
      })
      // when something going wrong
      .catch(err => {
        f.resetState().setErrorState();
        defaultErrorHandler(err);
      });
  }
}
