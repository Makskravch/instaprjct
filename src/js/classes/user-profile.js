class UserProfile {

  constructor(element, props = {}) {
    element = isDomElement(element) ? element : qs(element);

    if (element.tagName !== 'FORM') {
      throw new TypeError('A root element for UserProfile must be a form');
    }

    this.element        = element;
    this.props          = Object.assign({}, UserProfile.defults, props);
    this.picUploader    = this.element.elements[this.props.inputs.picture];
    this.picElement     = qs(this.props.pictureElement, this.element);
    this.errorContainer = qs(this.props.errorContainer, this.element);
    this.errors         = [];
    this.picFile        = null;
    this._editMode      = false;
    this._loading       = false;

    // bind methods to instance
    this._onPictureChange         = this._onPictureChange.bind(this);
    this._onPictureUploadProgress = this._onPictureUploadProgress.bind(this);

    // init
    this._setupActionTrigers();

    console.log(this);
  }

  enterEditMode() {
    if (this._editMode) return;
    this._bindEvents();
    this.element.classList.add(this.props.editClass);
    this._toggleInputs(true);
    this._editMode = true;
  }

  exitEditMode() {
    if (!this._editMode) return;
    this._unbindEvents();
    this.element.classList.remove(this.props.editClass);
    this._toggleInputs(false);
    this.picFile = null;
    this.resetError();
    this._editMode = false;
  }

  enterLoadingState() {
    if (this._loading) return;
    this.element.classList.add(this.props.loadingClass);
    this._toggleAllControls(false);
    this._loading = true;
  }

  exitLoadingState() {
    if (!this._loading) return;
    this.element.classList.remove(this.props.loadingClass);
    this._toggleAllControls(true);
    this._loading = false;
  }

  save() {
    if (!this._editMode || this._loading) return;

    const user     = firebase.auth().currentUser;
    const userRef  = firebase.database().ref(`users/${user.uid}`);
    const { name } = this.props.inputs;
    const newName  = this.element.elements[name].value.trim();

    this.enterLoadingState();

    this._uploadPicture()
      // get uploaded picture url and update user profile
      .then(({ downloadURL }) => {
        return user.updateProfile({
          displayName: newName,
          photoURL: downloadURL
        });
      })
      // update user data in database
      .then(() => {
        console.log(user.toJSON());
        return userRef.transaction((data) => {
          return Object.assign({}, data, user.toJSON());
        });
      })
      .then(() => {
        this.exitLoadingState();
        this.exitEditMode();
      })
      // handle any error
      .catch(err => {
        console.dir(err);
        this.showError(err.message);
        this.exitLoadingState();
      });
  }

  _onPictureUploadProgress(snapshot) {
    const progress = snapshot.bytesTransferred / snapshot.totalBytes;
    console.log(progress);
  }

  _uploadPicture() {
    const file = this.picFile;

    if (!file || !file.size) {
      return Promise.resolve({});
    }

    const user = firebase.auth().currentUser;
    const ext  = file.name.split('.').slice(-1)[0];
    const path = `avatars/${user.uid}.${ext}`;
    const ref  = firebase.storage().ref(path);
    const task = ref.put(file);

    task.on('state_changed', this._onPictureUploadProgress);

    return task;
  }

  delete() {
    if (!this._editMode) return;
  }

  showError(id) {
    if (typeof id !== undefined) {
      this._addError(id);
    }

    if (!this.errors.length) return;

    const errors = this.errors.map(id =>
      this.props.validationsErrors[id] || id
    ).join('<br>');

    this.errorContainer.innerHTML = errors;
    this.errorContainer.hidden = false;
  }

  resetError() {
    if (!this.errors.length) return;
    this.errors = [];
    this.errorContainer.hidden = true;
    this.errorContainer.innerHTML = '';
  }

  _bindEvents() {
    this.picUploader.addEventListener('change', this._onPictureChange);
  }

  _unbindEvents() {
    this.picUploader.removeEventListener('change', this._onPictureChange);
  }

  _onPictureChange(e) {
    const file = e.target.files[0];
    this.resetError();

    if (!file) return;

    const tmpUrl     = window.URL.createObjectURL(file);
    const validation = UserProfile.isValidPictureFile(file);

    if (validation === true) {
      this.picFile = file;
      this.picElement.style.backgroundImage = `url(${tmpUrl})`;
    } else {
      this.showError(validation);
    }
  }

  _setupActionTrigers() {
    const { actions, actionTrigger } = this.props;

    delegate(this.element, 'click', actionTrigger, (e) => {
      e.preventDefault();
      switch (e.delegateTarget.dataset['profileAction']) {
        case actions.edit:
          return this.enterEditMode();
        case actions.cancel:
          return this.exitEditMode();
        case actions.save:
          return this.save();
        case actions.delete:
          return this.delete();
      }
    });
  }

  _addError(id) {
    // this.errors = this.errors.concat(id).reduce((res, err) => {
    //   return res.indexOf(err) === -1 ? res.concat(err) : res;
    // }, []);
    this.errors = this.errors.concat(id);
  }

  _toggleInputs(state = true) {
    [].slice.call(this.element.elements)
      .filter(el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
      .forEach(el => {
        if (state === true) {
          el.removeAttribute('readonly');
        } else {
          el.setAttribute('readonly', true);
        }
      });
  }

  _toggleAllControls(state = true) {
    [].slice.call(this.element.elements)
      .forEach(el => {
        if (state === true) {
          el.removeAttribute('disabled');
        } else {
          el.setAttribute('disabled', true);
        }
      });
  }

}

UserProfile.defults = {
  editClass: 'is-edit',
  loadingClass: 'is-loading',
  actionTrigger: '[data-profile-action]',
  pictureElement: '.profile__pic',
  errorContainer: '.profile__errors',
  validationsErrors: {
    'invalid-file-type': 'Invalid file type. Only images are supported',
    'to-large-file': 'Maximum file size for user avatar is 1MB'
  },
  actions: {
    edit: 'edit',
    save: 'save',
    delete: 'delete',
    cancel: 'cancel'
  },
  inputs: {
    name: 'name',
    picture: 'picture'
  }
};

UserProfile.maxFileSize = 1024000;

/**
 * Check type and size of file for user avatar
 *
 * @param  {File}  file instance of File
 * @return {Boolean|Array}  true if file is ok, otherwise array with error id's
 */
UserProfile.isValidPictureFile = function(file) {
  const errors = [];

  if (!/image/.test(file.type)) {
    errors.push('invalid-file-type');
  }

  if (file.size > this.maxFileSize) {
    errors.push('to-large-file');
  }

  return errors.length ? errors : true;
};
