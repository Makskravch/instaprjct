class Editor {
  constructor(el, props) {
    this.root             = isDomElement(el) ? el : qs(el);
    this.props            = Object.assign({}, Editor.defaults, props);
    this.canvasContainer  = qs(this.props.canvasContainer, this.root);
    this.filtersContainer = qs(this.props.filtersContainer, this.root);
    this.fileInput        = qs(this.props.fileInput, this.root);
    this.triggerReset     = qs(this.props.triggerReset, this.root);
    this.triggerUpload    = qs(this.props.triggerUpload, this.root);
    this.file             = null;
    this.filter           = null;
    this._processing      = false;

    if (!this.filtersContainer) {
      this.filtersContainer = this.root;
    }

    this.triggerReset.style.display = 'none';

    this._bindEvents();
    console.log(this);
  }

  applyFilter(filter, cb = noop) {
    if (!(filter in this.caman)) {
      console.log(`There is no filter with name "${filter}"`);
      return;
    }

    if (this.filter === filter || this._processing) {
      return;
    }

    this._processing = true;
    this._toggleBusyState();
    this.caman.revert();
    this.caman[filter]();
    this.caman.render(() => {
      this._processing = false;
      this._toggleBusyState();
      this.filter = filter;
      this._highlightActiveFilter();
      cb();
    });
  }

  resetFilter() {
    if (!this.filter) return;
    this.filter = null;
    this.caman && this.caman.revert();
    this._highlightActiveFilter();
    this.triggerReset.style.display = 'none';
  }

  upload() {
    console.log(this, 'uploading');
  }

  _bindEvents() {
    this.triggerReset.addEventListener('click', (e) => this.resetFilter(e));
    this.triggerUpload.addEventListener('click', (e) => this.upload(e));
    this.fileInput.addEventListener('change', e => this._onFileChange(e));
    delegate(
      this.filtersContainer,
      'click',
      '[data-filter]',
      this._onFilterClick.bind(this)
    );
  }

  _onFileChange(e) {
    this.file = this.fileInput.files[0];
    console.log(this.file);
    this._initEditor();
  }

  _onFilterClick(e) {
    const target     = e.delegateTarget;
    const { filter } = target.dataset;
    if (!filter) return;
    this.applyFilter(filter);
  }

  _highlightActiveFilter() {
    const { activeClass } = this.props;
    const prevActive = qs('.is-active', this.filtersContainer);
    const nextActive = this.filter
      ? qs(`[data-filter="${this.filter}"]`, this.filtersContainer)
      : null;
    prevActive && prevActive.classList.remove(activeClass);
    nextActive && nextActive.classList.add(activeClass);
    this.triggerReset.style.display = '';
  }

  _toggleBusyState() {
    const { busyClass } = this.props;
    const isBusy   = this.root.classList.contains(busyClass);
    const triggers = [this.triggerReset, this.triggerUpload];
    const method   = isBusy ? 'removeAttribute' : 'setAttribute';

    this.root.classList.toggle(busyClass);
    triggers.forEach(el => el[method]('disabled', true));
  }

  _initEditor() {
    const { busyClass, hasImageClass, imageMaxSize } = this.props;
    const url    = URL.createObjectURL(this.file);
    const canvas = document.createElement('canvas');

    if (this.canvas) {
      this.canvas.parentNode.replaceChild(canvas, this.canvas);
    } else {
      this.canvasContainer.appendChild(canvas);
    }

    this.canvas = canvas;
    this._toggleBusyState();
    this.caman = Caman(this.canvas, url, (caman) => {
      const { originalWidth, originalHeight } = caman;
      const ratio  = originalWidth / originalHeight;
      const width  = originalWidth > imageMaxSize ? imageMaxSize : originalWidth;
      const height = Math.round(width / ratio);

      caman.resize({ width, height }).render();

      this._toggleBusyState();
      this.root.classList.add(hasImageClass);
    });
  }
}

Editor.defaults = {
  activeClass: 'is-active',
  busyClass: 'is-busy',
  hasImageClass: 'has-image',
  filtersContainer: '.editor-presets',
  canvasContainer: '.editor-canvas-container',
  triggerReset: '.editor-reset',
  triggerUpload: '.editor-upload',
  fileInput: 'input[type="file"]',
  imageMaxSize: 1200
};

Editor.FILTERS = [
  'vintage',
  'lomo',
  'clarity',
  'sinCity',
  'sunrise',
  'crossProcess',
  'orangePeel',
  'love',
  'grungy',
  'jarques',
  'pinhole',
  'oldBoot',
  'glowingSun',
  'hazyDays',
  'herMajesty',
  'nostalgia',
  'hemingway',
  'concentrate'
];
