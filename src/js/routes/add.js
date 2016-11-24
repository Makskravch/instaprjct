function add(ctx, next) {
  render('add', {
    presets: [
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
    ]
  });

  const canvas = document.getElementById('canvas');

  window.cc = Caman(canvas, 'img/demo-image.jpg', (c) => {
    console.log(c);
    const { originalWidth, originalHeight } = c;
    const ratio = originalWidth / originalHeight;
    c.resize({
      width: 600,
      height: Math.ceil(600 / ratio)
    }).render();
  });

  delegate(document.getElementById('presets'), 'click', 'button', (e) => {
    console.log(e.target.dataset.preset);
    cc.revert(true);
    cc[e.target.dataset.preset]();
    cc.render();
  });
}
