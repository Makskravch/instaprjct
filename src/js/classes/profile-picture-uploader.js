class ProfilePictureUploader {
  constructor(element, props = {}) {
    this.element        = isDomElement(element) ? element : qs(element);
    this.props          = Object.assign({}, ProfilePictureUploader.defaults, props);
    this.input          = qs(this.props.input, this.element);
    this.progressBar    = qs(this.props.progressBar, this.element);
    this.pictureElement = qs(this.props.pictureElement, this.element);
    this.errorContainer = qs(this.props.errorContainer, this.element);
    this.file           = null;
    this._edited        = false;
    this._loading       = false;

    this._onPictureChange      = this._onPictureChange.bind(this);
    this._actionTriggerHandler = this._actionTriggerHandler.bind(this);
    this._onUploadProgress     = this._onUploadProgress.bind(this);

    this._bindEvents();

    console.log(this);
  }

  _save() {
    if (!this._edited || this._loading) return;

    const user    = firebase.auth().currentUser;
    const userRef = firebase.database().ref(`users/${user.uid}`);

    const updateUserInDB = (newData) =>
      userRef.transaction((data) => Object.assign({}, data, newData));

    // update user profile and then uppdate user data storen database
    const updateProfile = ({
      downloadURL: photoURL,
      metadata: { fullPath: photoPath }
    } = {}) => {
      return user
        .updateProfile({ photoURL })
        .then(() => updateUserInDB({ photoURL, photoPath }));
    };

    const endSaving = () => {
      this._exitEditedState();
      this._exitLoadingState();
      this._setPicture();
    };

    const handleError = (err) => {
      console.error(err);
      this._showError('saving-error');
      this._exitLoadingState();
    };

    this._enterLoadingState();

    this._uploadPicture()
      .then(updateProfile)
      .then(endSaving)
      .catch(handleError);
  }

  _cancel() {
    this._setPicture();
    this._exitEditedState();
  }

  _uploadPicture() {
    const file = this.file;

    if (!file || !file.size) {
      return Promise.resolve();
    }

    const user     = firebase.auth().currentUser;
    const now      = new Date();
    const year     = now.getFullYear();
    const month    = now.getMonth() + 1;
    const extName  = file.name.split('.').slice(-1)[0] || '';
    const fileName = `${user.uid.slice(0, 5)}-${Date.now()}.${extName}`;
    const path     = `avatars/${year}_${month}/${fileName}`;
    const storRef  = firebase.storage().ref(path);
    const task     = storRef.put(file);

    const deleteExist = (existPath) => {
      firebase.storage().ref(existPath).delete().catch(err => console.error(err));
    };

    // delete old avatar file if exist
    firebase
      .database()
      .ref(`users/${user.uid}/photoPath`)
      .once(
        'value',
        (snapshot) => {
          const existPath = snapshot.val();
          if (existPath) {
            deleteExist(existPath);
          }
        },
        (err) => console.error(err)
      );

    task.on('state_changed', this._onUploadProgress);

    return task;
  }

  _onUploadProgress(snapshot) {
    const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
    this.progressBar.style.width = progress + '%';
  }

  _bindEvents() {
    this.input.addEventListener('change', this._onPictureChange);
    delegate(this.element, 'click', this.props.actionTrigger, this._actionTriggerHandler);
  }

  _showError(errId) {
    if (!errId || !errId.length) return;

    const error = [].concat(errId).map(id => {
      return this.props.validationsErrors[id] || id;
    }).join('<br>');

    this.errorContainer.innerHTML = error;
    this.element.classList.add(this.props.errorClass);
  }

  _resetError() {
    this.element.classList.remove(this.props.errorClass);
    this.errorContainer.innerHTML = '';
  }

  _enterEditedState() {
    if (this._edited) return;
    this.element.classList.add(this.props.editedClass);
    this._edited = true;
  }

  _exitEditedState() {
    if (!this._edited) return;
    this.element.classList.remove(this.props.editedClass);
    this._edited = false;
  }

  _enterLoadingState() {
    if (this._loading) return;
    this._toggleActionsTriggers(false);
    this.element.classList.add(this.props.loadingClass);
    this._loading = true;
  }

  _exitLoadingState() {
    if (!this._loading) return;
    this._toggleActionsTriggers(true);
    this.element.classList.remove(this.props.loadingClass);
    this._loading = false;
  }

  _toggleActionsTriggers(state = false) {
    qsa(this.props.actionTrigger, this.element).forEach(el => {
      if (state === true) {
        el.removeAttribute('disabled');
      } else {
        el.setAttribute('disabled', true);
      }
    });
  }

  _actionTriggerHandler(e) {
    const { actions } = this.props;
    const { action } = e.target.dataset;

    e.preventDefault();

    switch (action) {
      case actions.save:
        return this._save();
      case actions.cancel:
        return this._cancel();
      default:
        return;
    }
  }

  _onPictureChange() {
    const file = this.input.files[0];
    this._resetError();

    if (!file) return;

    const tmpUrl     = window.URL.createObjectURL(file);
    const validation = ProfilePictureUploader.isValidFile(file);

    if (validation === true) {
      this.file = file;
      this._setPicture(tmpUrl);
      this._enterEditedState();
    } else {
      this._showError(validation);
      this._exitEditedState();
    }
  }

  _setPicture(url) {
    url = (typeof url === 'string')
      ? url
      : (firebase.auth().currentUser.photoURL || '');

    this.pictureElement.style.backgroundImage = `url(${url})`;
  }

}

ProfilePictureUploader.defaults = {
  input: 'input[type="file"]',
  actionTrigger: '[data-action]',
  progressBar: '.progress-bar',
  pictureElement: '.profile-picture__picture',
  errorContainer: '.profile-picture__error',
  editedClass: 'is-edited',
  loadingClass: 'is-loading',
  errorClass: 'has-error',
  actions: {
    save: 'save',
    cancel: 'cancel'
  },
  validationsErrors: {
    'invalid-file-type': 'Invalid file type. Only images are supported',
    'to-large-file': 'Image should be less than 1MB',
    'saving-error': 'Looks like something broke. Please retry'
  }
};

ProfilePictureUploader.maxFileSize = 1024000;

/**
 * Check type and size of file for user avatar
 *
 * @param  {File}  file instance of File
 * @return {Boolean|Array}  true if file is ok, otherwise array with error id's
 */
ProfilePictureUploader.isValidFile = function(file) {
  const errors = [];

  if (!/image/.test(file.type)) {
    errors.push('invalid-file-type');
  }

  if (file.size > this.maxFileSize) {
    errors.push('to-large-file');
  }

  return errors.length ? errors : true;
};
