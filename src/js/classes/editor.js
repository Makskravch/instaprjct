class Editor {
  constructor(el, props) {
    this.root             = isDomElement(el) ? el : qs(el);
    this.props            = Object.assign({}, Editor.defaults, props);
    this.canvasContainer  = qs(this.props.canvasContainer, this.root);
    this.presetsContainer = qs(this.props.presetsContainer, this.root);
    this.fileInput        = qs(this.props.fileInput, this.root);
    this.file             = null;
    this._processing      = false;

    if (!this.presetsContainer) {
      this.presetsContainer = this.root;
    }

    this.fileInput.addEventListener('change', e => this._onFileChange(e));
    delegate(
      this.presetsContainer,
      'click',
      '[data-filter]',
      this._onFilterClick.bind(this)
    );

    console.log(this);
  }

  _onFileChange(e) {
    this.file = this.fileInput.files[0];
    console.log(this.file);
    this.init();
  }

  _onFilterClick(e) {
    const { filter } = e.delegateTarget.dataset;
    if (!filter) return;
    this.applyFilter(filter);
  }

  applyFilter(filter) {
    if (!(filter in this.caman)) {
      console.log(`There is no filter "${filter}"`);
      return;
    }

    if (this.filter === filter || this._processing) {
      return;
    }

    this._processing = true;
    this.toggleBusyState();
    this.caman.revert();
    this.caman[filter]();
    this.caman.render(() => {
      this._processing = false;
      this.toggleBusyState();
      this.filter = filter;
    });
  }

  toggleBusyState() {
    this.root.classList.toggle(this.props.busyClass);
  }

  init() {
    const { busyClass, hasImageClass } = this.props;
    const url    = URL.createObjectURL(this.file);
    const canvas = document.createElement('canvas');

    if (this.canvas) {
      this.canvas.parentNode.replaceChild(canvas, this.canvas);
    } else {
      this.canvasContainer.appendChild(canvas);
    }

    this.canvas = canvas;

    this.toggleBusyState();
    this.caman = Caman(this.canvas, url, () => {
      this.toggleBusyState();
      this.root.classList.add(hasImageClass);
    });
  }
}

Editor.defaults = {
  busyClass: 'is-busy',
  hasImageClass: 'has-image',
  presetsContainer: '.editor-presets',
  canvasContainer: '.editor-canvas-container',
  fileInput: 'input[type="file"]'
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
