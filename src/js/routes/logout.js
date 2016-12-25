function logout() {
  firebase.auth().signOut().then(() => page.redirect('/'));
}
