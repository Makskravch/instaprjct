function profile(ctx, next) {
  render('profile');

  const editProfileForm = document.forms['edit-profile'];
  const fileInput = qs('[name="profilePic"]');

  fileInput.addEventListener('change', (e) => {
    const url = window.URL.createObjectURL(e.target.files[0]);
    // const img = document.createElement('img');
    // img.width = 140;
    // img.height = 140;
    // img.src = url;
    // qs('.profile__uploader').appendChild(img);
    qs('.profile__pic').style.backgroundImage = `url(${url})`;
  });

  editProfileForm.addEventListener('submit', (e) => {
    const { displayName, file } = editProfileForm.elements;

    e.preventDefault();
  });
}
