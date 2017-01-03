class Post {
  /**
   * @param  {string|Object} post - Post id as string or already retrieved data of post
   * @return {void}
   */
  constructor(post, props = {}) {
    this.props = Object.assign({}, Post.defaults, props);
    this.tpl   = this.props.template;

    this._setupDomElement();
    this._setupDbRef(post);
    this.render();
  }

  render() {
    this.element.innerHTML = this.tpl(
      Object.assign({}, this.data, { author: this.author})
    );
  }

  getElement() {
    return this.element;
  }

  _setupDomElement() {
    this.element = document.createElement('article');
    this.element.classList = 'post';
  }

  _fetchAutor() {
    firebase
      .database()
      .ref(`users/${this.data.author}`)
      .once('value', snapshot => {
        this.author = snapshot.val();
        this.render();
      });
  }

  _onDataRetrieved(snapshot) {
    this.data = snapshot.val();
    this._fetchAutor();
    console.log(this);
  }

  _onDataChanged(snapshot) {
    const key = snapshot.key;
    const value = snapshot.val();
    this.data[key] = value;
    this.render();
    console.log('data changed', this);
  }

  _setupDbRef(post) {
    const id = typeof post === 'string' ? post : post.id;
    this.dbRef = firebase.database().ref(`posts/${id}`);
    this.dbRef.once('value', this._onDataRetrieved.bind(this));
    this.dbRef.on('child_changed', this._onDataChanged.bind(this));
  }
}

Post.defaults = {
  template: Handlebars.partials.post
};
