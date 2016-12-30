class Post {
  /**
   * @param  {string|Object} post - Post id as string or already retrieved data of post
   * @return {void}
   */
  constructor(post, props = {}) {
    this.props = Object.assign({}, Post.defaults, props);
    this.element = document.createElement('article');
    this.element.classList = 'post';

    this._setupDbRef(post);
    this.render();
  }

  render() {
    this.element.innerHTML = this.props.template(this.data);
  }

  getElement() {
    return this.element;
  }

  _onDataRetrieved(snapshot) {
    this.data = snapshot.val();
    this.render();
    console.log(this);
  }

  _onDataChanged(snapshot) {
    const key = snapshot.key;
    const value = snapshot.val();
    this.data[key] = value;
    this.render();
    console.log(this);
  }

  _setupDbRef(post) {
    const that = this;
    const id = typeof post === 'string' ? post : post.id;
    this.dbRef = firebase.database().ref(`posts/${id}`);
    this.dbRef.once('value', this._onDataRetrieved.bind(this));
    this.dbRef.on('child_changed', this._onDataChanged.bind(this));
  }
}

Post.defaults = {
  template: Handlebars.partials.post
};
