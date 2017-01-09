class Post {
  /**
   * @param  {string|Object} post - Post id as string or already retrieved data of post
   * @return {void}
   */
  constructor(post, props = {}) {
    this.props       = Object.assign({}, Post.defaults, props);
    this.tpl         = Handlebars.partials.post;
    this.currentUser = this.props.currentUser;
    this.liked       = false; // is post liked by currentUser?

    this._onDataRetrieved = this._onDataRetrieved.bind(this);
    this.toggleLike       = this.toggleLike.bind(this);
    this.delete           = this.delete.bind(this);

    this._setupDomElement();
    this._setupDbRef(post);
    this._bindEvents();
  }

  render() {
    console.time('render');
    this.element.innerHTML = this.tpl(
      Object.assign({}, this.data, {
        author: this.author,
        currentUser: this.currentUser,
        liked: this.liked,
        likesCount: Object.keys((this.data && this.data.likes) || {}).length,
        isOwner: this.data.author === this.currentUser.uid
      })
    );
    console.log(this);
    console.timeEnd('render');
  }

  getElement() {
    return this.element;
  }

  addComment(value = '') {
    const id = generateID('comment-');
    const { uid, username } = this.currentUser;
    this.dbRef.child(`comments/${id}`).set({
      id,
      value,
      author: username,
      authorId: uid,
      created: moment().toJSON()
    })
    .catch(defaultErrorHandler);
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
      this.dbRef.child(`comments/${id}`).remove().catch(defaultErrorHandler);
    }
  }

  toggleLike() {
    const { uid, displayName } = this.currentUser;
    const ref = this.dbRef.child(`likes/${uid}`);

    const done = (bool) => {
      this.liked = bool;
    };

    if (this.liked) {
      // if post is already liked then unlike
      ref.remove().then(() => done(false));
    } else {
      ref.set({
        userName: displayName,
        userId: uid,
        created: moment().toJSON()
      }).then(() => done(true));
    }
  }

  delete() {
    if (this.data.author !== this.currentUser.uid) {
      return console.log('Only owner can delete this post');
    }

    if (!confirm('Are you sure?')) {
      return;
    }

    // remove all listeners from db reference
    this.dbRef.off();

    firebase.Promise.all([
      // remove entry in database
      this.dbRef.remove(),
      // delete image file from storage
      firebase.storage().ref(this.data.storagePath).delete()
    ])
    .then(() => {
      this.element.parentNode.removeChild(this.element);
    })
    .catch(defaultErrorHandler);
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
    this.author || this._fetchAutor();
    this.element.setAttribute('data-post', this.data.id);
    this.liked = !!(this.data.likes && this.data.likes[this.currentUser.uid]);
    this.render();
    console.log('data retrived', this.data);
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
    this.dbRef.on('value', this._onDataRetrieved);
  }

  _bindEvents() {
    delegate(this.element, 'submit', '.post__add-comment', (e) => {
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

    delegate(this.element, 'click', '.post__like', this.toggleLike);
    delegate(this.element, 'click', '.post__delete', this.delete);
  }
}

Post.defaults = {
  currentUser: {}
};
