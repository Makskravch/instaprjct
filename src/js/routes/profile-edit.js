function profileEdit(ctx, next) {
  render('profile-edit');

  // init picture uploader
  new ProfilePictureUploader('#profile-picture');

  const publicInfoForm     = document.forms['public-info'];
  const NAME_VALIDATOR_RE  = /^\w+\s*\w*$/;
  const PHONE_VALIDATOR_RE = /^\d{10,12}$/;

  new VForm(publicInfoForm, {
    onValid(f) {
      console.log(f.serialize());
    },
    fields: {
      'public_email': {
        validate: 'email'
      },
      'display_name': {
        validate: 'required',
        customValidator(value) {
          return NAME_VALIDATOR_RE.test(value)
            || 'Field can contain only letters, numbers, or underscore sign';
        }
      },
      'phone_number': {
        customValidator(value) {
          return PHONE_VALIDATOR_RE.test(value)
            || 'Phone must contain from 10 to 12 digits';
        }
      }
    }
  });
}
