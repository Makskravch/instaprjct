class Post {
  /**
   * @param  {string|Object} post - Post id as string or already retrieved data of post
   * @return {void}
   */
  constructor(post, props = {}) {
    this.props       = Object.assign({}, Post.defaults, props);
    this.tpl         = Handlebars.partials.post;
    this.currentUser = firebase.auth().currentUser.toJSON();

    this._setupDomElement();
    this._setupDbRef(post);
    this._bindEvents();
    this.render();
  }

  render() {
    console.time('render');
    this.element.innerHTML = this.tpl(
      Object.assign({}, this.data, {
        author: this.author,
        currentUser: this.currentUser
      })
    );
    console.timeEnd('render');
  }

  getElement() {
    return this.element;
  }

  addComment(value = '') {
    const id = generateID('comment-');
    const user = this.currentUser;
    this.dbRef.child(`comments/${id}`).set({
      id: id,
      author: user.displayName,
      authorId: user.uid,
      value,
      created: moment().toJSON(),
      edited: false
    }).then(() => this.render());
  }

  removeComment(id) {
    const comment = this.data.comments[id];
    const userId = this.currentUser.uid;
    if (!comment) {
      return console.log(`Entry has no comment with id ${id}`);
    }
    if (userId !== comment.authorId) {
      return alert('Only author of comment can delete it');
    }
    if (confirm('Are you sure you want to delete this comment?')) {
      this.dbRef.child(`comments/${id}`).remove().then(() => this.render());
    }
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
    this.element.setAttribute('data-post', this.data.id);
    console.log(this);
  }

  _onDataChanged(snapshot) {
    const key = snapshot.key;
    const value = snapshot.val();
    this.data[key] = value;
    this.render();
    console.log('data changed', key, value);
  }

  _setupDbRef(post) {
    const id = typeof post === 'string' ? post : post.id;
    this.dbRef = firebase.database().ref(`posts/${id}`);
    this.dbRef.once('value', this._onDataRetrieved.bind(this));
    this.dbRef.on('child_changed', this._onDataChanged.bind(this));
  }

  _bindEvents() {
    delegate(this.element, 'submit', 'form', (e) => {
      const value = e.delegateTarget.elements['comment'].value.trim();
      if (value) this.addComment(value);
      e.preventDefault();
    });

    delegate(this.element, 'click', '.comment__delete', (e) => {
      const parent = e.delegateTarget.closest('.comment');
      if (!parent) return;
      const id = parent.dataset.comment;
      this.removeComment(id);
      e.preventDefault();
    });
  }
}

Post.defaults = {};
