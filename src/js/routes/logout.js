function logout() {
  firebase.auth().signOut().then(() => redirectTo('/'));
}
