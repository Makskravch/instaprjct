function profileEdit(ctx, next) {
  render('profile-edit', ctx);

  // init picture uploader
  new ProfilePictureUploader('#profile-picture');

  const publicInfoForm     = document.forms['public-info'];
  const PHONE_VALIDATOR_RE = /^\+?\d{10,12}$/;

  function updateUserInfo(newData) {
    const user  = firebase.auth().currentUser;
    const dbRef = firebase.database().ref(`users/${user.uid}`);
    const info  = pick(newData, ['displayName', 'phoneNumber', 'social', 'about']);
    const { displayName } = info;

    if (isEmptyObject(info)) {
      return Promise.resolve();
    }

    if (displayName !== undefined) {
      user.updateProfile({ displayName }).catch(err => console.log(err));
    }

    return dbRef.transaction((data) => Object.assign({}, data, info));
  }

  function submitForm(f) {
    const data = f.serialize();

    if (isEmptyObject(data)) {
      return f.setInvalidState();
    }

    f.setLoadingState();

    updateUserInfo(data)
      .then(() => {
        f.resetState().setSuccessState();
      })
      .catch(err => {
        console.log(err);
        f.resetState().setErrorState();
      });
  }

  new VForm(publicInfoForm, {
    onValid: submitForm,
    fields: {
      'phoneNumber': {
        customValidator(value) {
          return PHONE_VALIDATOR_RE.test(value)
            || 'Phone must contain from 10 to 12 digits';
        }
      },
      'about': {
        validate: 'maxLength[140]',
        control: 'textarea'
      }
    }
  });
}
