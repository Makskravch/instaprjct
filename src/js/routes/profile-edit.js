function profileEdit(ctx, next) {
  render('profile-edit', ctx);

  // init picture uploader
  new ProfilePictureUploader('#profile-picture');

  const publicInfoForm     = document.forms['public-info'];
  const deleteProfileForm  = document.forms['delete-profile'];
  const PHONE_VALIDATOR_RE = /^\+?\d{10,12}$/;
  const user               = firebase.auth().currentUser;
  const profileDbRef       = firebase.database().ref(`users/${user.uid}`);

  function updateUserInfo(newData) {
    const info  = pick(newData, ['displayName', 'phoneNumber', 'social', 'about']);
    const { displayName } = info;

    if (isEmptyObject(info)) {
      return Promise.resolve();
    }

    if (displayName !== undefined) {
      user.updateProfile({ displayName }).catch(err => console.log(err));
    }

    return profileDbRef.transaction((data) => Object.assign({}, data, info));
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

  // profile update form
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

  // account deletion form
  new VForm('#delete-profile', {
    fields: {
      'usernameConfirm': {
        validate: 'required',
        customValidator(val) {
          return val === deleteProfileForm.elements['username'].value
            || 'Wrong username';
        }
      }
    },
    onValid(f) {
      f.setLoadingState();
      if (!confirm('Are you sure? Last chance to change your mind.')) {
        return f.resetState();
      }
      deleteAccount().then(() => page.redirect('/'));
    }
  });

  function deleteAccount() {
    return firebase.Promise.all([
      user.delete(),
      profileDbRef.remove()
    ])
    .catch(defaultErrorHandler);
  }
}
