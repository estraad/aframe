/* global AFRAME */
var AFRAME_INJECTED = require('../../constants').AFRAME_INJECTED;
var registerComponent = require('../../core/component').registerComponent;
var utils = require('../../utils/');

var INSPECTOR_DEV_URL = 'https://aframe.io/aframe-inspector/dist/aframe-inspector.js';
var INSPECTOR_RELEASE_URL = 'https://unpkg.com/aframe-inspector@0.9.0/dist/aframe-inspector.min.js';
var INSPECTOR_URL = process.env.INSPECTOR_VERSION === 'dev' ? INSPECTOR_DEV_URL : INSPECTOR_RELEASE_URL;
var LOADING_MESSAGE = 'Loading Inspector';
var LOADING_ERROR_MESSAGE = 'Error loading Inspector';

module.exports.Component = registerComponent('inspector', {
  schema: {
    url: {default: INSPECTOR_URL}
  },

  init: function () {
    this.firstPlay = true;
    this.onKeydown = this.onKeydown.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.initOverlay();
    window.addEventListener('keydown', this.onKeydown);
    window.addEventListener('message', this.onMessage);
  },

  play: function () {
    var urlParam;
    if (!this.firstPlay) { return; }
    urlParam = utils.getUrlParameter('inspector');
    if (urlParam !== 'false' && !!urlParam) {
      this.openInspector();
      this.firstPlay = false;
    }
  },

  initOverlay: function () {
    var dotsHTML = '<span class="dots"><span>.</span><span>.</span><span>.</span></span>';
    this.loadingMessageEl = document.createElement('div');
    this.loadingMessageEl.classList.add('a-inspector-loader');
    this.loadingMessageEl.innerHTML = LOADING_MESSAGE + dotsHTML;
  },

  remove: function () {
    this.removeEventListeners();
  },

  /**
   * <ctrl> + <alt> + i keyboard shortcut.
   */
  onKeydown: function (evt) {
    var shortcutPressed = evt.keyCode === 73 && (evt.ctrlKey && evt.altKey || evt.getModifierState('AltGraph'));
    if (!shortcutPressed) { return; }
    this.openInspector();
  },

  showLoader: function () {
    document.body.appendChild(this.loadingMessageEl);
  },

  hideLoader: function () {
    document.body.removeChild(this.loadingMessageEl);
  },

  /**
   * postMessage. aframe.io uses this to create a button on examples to open Inspector.
   */
  onMessage: function (evt) {
    if (evt.data === 'INJECT_AFRAME_INSPECTOR') { this.openInspector(); }
  },

  openInspector: function (focusEl) {
    var self = this;
    var script;

    // Already injected. Open.
    if (AFRAME.INSPECTOR || AFRAME.inspectorInjected) {
      AFRAME.INSPECTOR.open(focusEl);
      return;
    }

    this.showLoader();

    // Inject.
    script = document.createElement('script');
    script.src = this.data.url;
    script.setAttribute('data-name', 'aframe-inspector');
    script.setAttribute(AFRAME_INJECTED, '');
    script.onload = function () {
      AFRAME.INSPECTOR.open(focusEl);
      self.hideLoader();
      self.removeEventListeners();
    };
    script.onerror = function () {
      self.loadingMessageEl.innerHTML = LOADING_ERROR_MESSAGE;
    };
    document.head.appendChild(script);
    AFRAME.inspectorInjected = true;
  },

  removeEventListeners: function () {
    window.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('message', this.onMessage);
  }
});
