function profile(ctx, next) {
  render('profile');

  const editProfileForm = document.forms['edit-profile'];
  const fileInput       = qs('[name="profile_picture"]', editProfileForm);
  const fields          = qsa('input[readonly]', editProfileForm);
  const EDIT_CLASS      = 'has-edit-mode';

  function setEditMode() {
    editProfileForm.classList.add(EDIT_CLASS);
    fields.forEach(f => f.removeAttribute('readonly'));
  }

  function unsetEditMode() {
    editProfileForm.classList.remove(EDIT_CLASS);
    fields.forEach(f => f.setAttribute('readonly', true));
  }

  fileInput.addEventListener('change', (e) => {
    const url = window.URL.createObjectURL(e.target.files[0]);
    console.log(url);
    // const img = document.createElement('img');
    // img.width = 140;
    // img.height = 140;
    // img.src = url;
    // qs('.profile__uploader').appendChild(img);
    qs('.profile__pic').style.backgroundImage = `url(${url})`;
  });

  editProfileForm.addEventListener('submit', (e) => {
    const { name, profile_picture } = editProfileForm.elements;

    e.preventDefault();
  });

  delegate(editProfileForm, 'click', '[data-action]', (e) => {
    const { action } = e.target.dataset;

    console.log(action);

    switch (action) {
      case 'edit':
        return setEditMode();
      case 'cancel':
        return unsetEditMode();
      default:
        unsetEditMode();
    }
  });
}
