class Editor {
  constructor(el, props) {
    this.root            = isDomElement(el) ? el : qs(el);
    this.props           = Object.assign({}, Editor.defaults, props);
    this.canvasContainer = qs(this.props.canvasContainer, this.root);
    this.fileInput       = qs(this.props.fileInput, this.root);
    this.file            = null;

    this.fileInput.addEventListener('change', e => this._onFileChange(e));

    console.log(this);
  }

  _onFileChange(e) {
    this.file = this.fileInput.files[0];
    console.log(this.file);
    this.init();
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

    this.root.classList.add(busyClass);
    this.caman = Caman(this.canvas, url, () => {
      console.log(this.caman);
      this.root.classList.remove(busyClass);
      this.root.classList.add(hasImageClass);
    });
    window.cc = this.caman;
    console.log(url);
  }
}

Editor.defaults = {
  busyClass: 'is-busy',
  hasImageClass: 'has-image',
  canvasContainer: '.editor-canvas-container',
  fileInput: 'input[type="file"]'
};

Editor.PRESETS = [
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
