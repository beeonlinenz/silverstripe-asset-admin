(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var FileBackend = (function (_Events) {
	_inherits(FileBackend, _Events);

	function FileBackend(fetch_url, search_url, update_url, delete_url, limit, bulkActions, $folder, currentFolder) {
		_classCallCheck(this, FileBackend);

		_get(Object.getPrototypeOf(FileBackend.prototype), 'constructor', this).call(this);

		this.fetch_url = fetch_url;
		this.search_url = search_url;
		this.update_url = update_url;
		this.delete_url = delete_url;
		this.limit = limit;
		this.bulkActions = bulkActions;
		this.$folder = $folder;
		this.folder = currentFolder;

		this.page = 1;
	}

	/**
  * @func fetch
  * @param number id
  * @desc Fetches a collection of Files by ParentID.
  */

	_createClass(FileBackend, [{
		key: 'fetch',
		value: function fetch(id) {
			var _this = this;

			if (typeof id === 'undefined') {
				return;
			}

			this.page = 1;

			this.request('POST', this.fetch_url, { id: id }).then(function (json) {
				_this.emit('onFetchData', json);
			});
		}
	}, {
		key: 'search',
		value: function search() {
			var _this2 = this;

			this.page = 1;

			this.request('GET', this.search_url).then(function (json) {
				_this2.emit('onSearchData', json);
			});
		}
	}, {
		key: 'more',
		value: function more() {
			var _this3 = this;

			this.page++;

			this.request('GET', this.search_url).then(function (json) {
				_this3.emit('onMoreData', json);
			});
		}
	}, {
		key: 'navigate',
		value: function navigate(folder) {
			var _this4 = this;

			this.page = 1;
			this.folder = folder;

			this.persistFolderFilter(folder);

			this.request('GET', this.search_url).then(function (json) {
				_this4.emit('onNavigateData', json);
			});
		}
	}, {
		key: 'persistFolderFilter',
		value: function persistFolderFilter(folder) {
			if (folder.substr(-1) === '/') {
				folder = folder.substr(0, folder.length - 1);
			}

			this.$folder.val(folder);
		}
	}, {
		key: 'delete',
		value: function _delete(ids) {
			var _this5 = this;

			var filesToDelete = [];

			// Allows users to pass one or more ids to delete.
			if (Object.prototype.toString.call(ids) !== '[object Array]') {
				filesToDelete.push(ids);
			} else {
				filesToDelete = ids;
			}

			this.request('GET', this.delete_url, {
				'ids': filesToDelete
			}).then(function () {
				// Using for loop because IE10 doesn't handle 'for of',
				// which gets transcompiled into a function which uses Symbol,
				// the thing IE10 dies on.
				for (var i = 0; i < filesToDelete.length; i += 1) {
					_this5.emit('onDeleteData', filesToDelete[i]);
				}
			});
		}
	}, {
		key: 'filter',
		value: function filter(name, type, folder, createdFrom, createdTo, onlySearchInFolder) {
			this.name = name;
			this.type = type;
			this.folder = folder;
			this.createdFrom = createdFrom;
			this.createdTo = createdTo;
			this.onlySearchInFolder = onlySearchInFolder;

			this.search();
		}
	}, {
		key: 'save',
		value: function save(id, values) {
			var _this6 = this;

			var updates = { id: id };

			values.forEach(function (field) {
				updates[field.name] = field.value;
			});

			this.request('POST', this.update_url, updates).then(function () {
				_this6.emit('onSaveData', id, updates);
			});
		}
	}, {
		key: 'request',
		value: function request(method, url) {
			var _this7 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var defaults = {
				'limit': this.limit,
				'page': this.page
			};

			if (this.name && this.name.trim() !== '') {
				defaults.name = decodeURIComponent(this.name);
			}

			if (this.folder && this.folder.trim() !== '') {
				defaults.folder = decodeURIComponent(this.folder);
			}

			if (this.createdFrom && this.createdFrom.trim() !== '') {
				defaults.createdFrom = decodeURIComponent(this.createdFrom);
			}

			if (this.createdTo && this.createdTo.trim() !== '') {
				defaults.createdTo = decodeURIComponent(this.createdTo);
			}

			if (this.onlySearchInFolder && this.onlySearchInFolder.trim() !== '') {
				defaults.onlySearchInFolder = decodeURIComponent(this.onlySearchInFolder);
			}

			this.showLoadingIndicator();

			return _jQuery2['default'].ajax({
				'url': url,
				'method': method,
				'dataType': 'json',
				'data': _jQuery2['default'].extend(defaults, data)
			}).always(function () {
				_this7.hideLoadingIndicator();
			});
		}
	}, {
		key: 'showLoadingIndicator',
		value: function showLoadingIndicator() {
			(0, _jQuery2['default'])('.cms-content, .ui-dialog').addClass('loading');
			(0, _jQuery2['default'])('.ui-dialog-content').css('opacity', '.1');
		}
	}, {
		key: 'hideLoadingIndicator',
		value: function hideLoadingIndicator() {
			(0, _jQuery2['default'])('.cms-content, .ui-dialog').removeClass('loading');
			(0, _jQuery2['default'])('.ui-dialog-content').css('opacity', '1');
		}
	}]);

	return FileBackend;
})(_events2['default']);

exports['default'] = FileBackend;
module.exports = exports['default'];

},{"events":14,"jQuery":"jQuery"}],2:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _stateConfigureStore = require('../state/configureStore');

var _stateConfigureStore2 = _interopRequireDefault(_stateConfigureStore);

var _sectionsGalleryController = require('../sections/gallery/controller');

var _sectionsGalleryController2 = _interopRequireDefault(_sectionsGalleryController);

var _backendFileBackend = require('../backend/file-backend');

var _backendFileBackend2 = _interopRequireDefault(_backendFileBackend);

function getVar(name) {
	var parts = window.location.href.split('?');

	if (parts.length > 1) {
		parts = parts[1].split('#');
	}

	var variables = parts[0].split('&');

	for (var i = 0; i < variables.length; i++) {
		var _parts = variables[i].split('=');

		if (decodeURIComponent(_parts[0]) === name) {
			return decodeURIComponent(_parts[1]);
		}
	}

	return null;
}

function hasSessionStorage() {
	return typeof window.sessionStorage !== 'undefined' && window.sessionStorage !== null;
}

function getProps(props) {
	var $componentWrapper = (0, _jQuery2['default'])('.asset-gallery').find('.asset-gallery-component-wrapper'),
	    $search = (0, _jQuery2['default'])('.cms-search-form'),
	    initialFolder = (0, _jQuery2['default'])('.asset-gallery').data('asset-gallery-initial-folder'),
	    currentFolder = getVar('q[Folder]') || initialFolder,
	    backend,
	    defaults;

	if ($search.find('[type=hidden][name="q[Folder]"]').length == 0) {
		$search.append('<input type="hidden" name="q[Folder]" />');
	}

	// Do we need to set up a default backend?
	if (typeof props === 'undefined' || typeof props.backend === 'undefined') {
		backend = new _backendFileBackend2['default']($componentWrapper.data('asset-gallery-fetch-url'), $componentWrapper.data('asset-gallery-search-url'), $componentWrapper.data('asset-gallery-update-url'), $componentWrapper.data('asset-gallery-delete-url'), $componentWrapper.data('asset-gallery-limit'), $componentWrapper.data('asset-gallery-bulk-actions'), $search.find('[type=hidden][name="q[Folder]"]'), currentFolder);

		backend.emit('filter', getVar('q[Name]'), getVar('q[AppCategory]'), getVar('q[Folder]'), getVar('q[CreatedFrom]'), getVar('q[CreatedTo]'), getVar('q[CurrentFolderOnly]'));
	}

	defaults = {
		backend: backend,
		current_folder: currentFolder,
		cmsEvents: {},
		initial_folder: initialFolder,
		name: (0, _jQuery2['default'])('.asset-gallery').data('asset-gallery-name')
	};

	return _jQuery2['default'].extend(true, defaults, props);
}

var props = getProps();
var store = (0, _stateConfigureStore2['default'])(); //Create the redux store

_reactDom2['default'].render(_react2['default'].createElement(
	_reactRedux.Provider,
	{ store: store },
	_react2['default'].createElement(_sectionsGalleryController2['default'], props)
), (0, _jQuery2['default'])('.asset-gallery-component-wrapper')[0]);

},{"../backend/file-backend":1,"../sections/gallery/controller":8,"../state/configureStore":10,"jQuery":"jQuery","react":"react","react-dom":"react-dom","react-redux":"react-redux"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _stateGalleryActions = require('../../state/gallery/actions');

var galleryActions = _interopRequireWildcard(_stateGalleryActions);

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var BulkActionsComponent = (function (_SilverStripeComponent) {
	_inherits(BulkActionsComponent, _SilverStripeComponent);

	function BulkActionsComponent(props) {
		_classCallCheck(this, BulkActionsComponent);

		_get(Object.getPrototypeOf(BulkActionsComponent.prototype), 'constructor', this).call(this, props);

		this.onChangeValue = this.onChangeValue.bind(this);
	}

	_createClass(BulkActionsComponent, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var $select = (0, _jQuery2['default'])(_reactDom2['default'].findDOMNode(this)).find('.dropdown');

			$select.chosen({
				'allow_single_deselect': true,
				'disable_search_threshold': 20
			});

			// Chosen stops the change event from reaching React so we have to simulate a click.
			$select.change(function () {
				return _reactAddonsTestUtils2['default'].Simulate.click($select.find(':selected')[0]);
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var _this = this;

			return _react2['default'].createElement(
				'div',
				{ className: 'gallery__bulk-actions fieldholder-small' },
				_react2['default'].createElement(
					'select',
					{ className: 'dropdown no-change-track no-chzn', tabIndex: '0', 'data-placeholder': this.props.gallery.bulkActions.placeholder, style: { width: '160px' } },
					_react2['default'].createElement('option', { selected: true, disabled: true, hidden: true, value: '' }),
					this.props.gallery.bulkActions.options.map(function (option, i) {
						return _react2['default'].createElement(
							'option',
							{ key: i, onClick: _this.onChangeValue, value: option.value },
							option.label
						);
					})
				)
			);
		}
	}, {
		key: 'getOptionByValue',
		value: function getOptionByValue(value) {
			// Using for loop because IE10 doesn't handle 'for of',
			// which gets transcompiled into a function which uses Symbol,
			// the thing IE10 dies on.
			for (var i = 0; i < this.props.gallery.bulkActions.options.length; i += 1) {
				if (this.props.gallery.bulkActions.options[i].value === value) {
					return this.props.gallery.bulkActions.options[i];
				}
			}

			return null;
		}
	}, {
		key: 'getSelectedFiles',
		value: function getSelectedFiles() {
			return this.props.gallery.selectedFiles;
		}
	}, {
		key: 'applyAction',
		value: function applyAction(value) {
			// We only have 'delete' right now...
			switch (value) {
				case 'delete':
					this.props.backend['delete'](this.getSelectedFiles());
				default:
					return false;
			}
		}
	}, {
		key: 'onChangeValue',
		value: function onChangeValue(event) {
			var option = this.getOptionByValue(event.target.value);

			// Make sure a valid option has been selected.
			if (option === null) {
				return;
			}

			if (option.destructive === true) {
				if (confirm(_i18n2['default'].sprintf(_i18n2['default']._t('AssetGalleryField.BULK_ACTIONS_CONFIRM'), option.label))) {
					this.applyAction(option.value);
				}
			} else {
				this.applyAction(option.value);
			}

			// Reset the dropdown to it's placeholder value.
			(0, _jQuery2['default'])(_reactDom2['default'].findDOMNode(this)).find('.dropdown').val('').trigger('liszt:updated');
		}
	}]);

	return BulkActionsComponent;
})(_silverstripeComponent2['default']);

exports['default'] = BulkActionsComponent;
;

function mapStateToProps(state) {
	return {
		gallery: state.assetAdmin.gallery
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: (0, _redux.bindActionCreators)(galleryActions, dispatch)
	};
}

exports['default'] = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(BulkActionsComponent);
module.exports = exports['default'];

},{"../../state/gallery/actions":11,"i18n":"i18n","jQuery":"jQuery","react":"react","react-addons-test-utils":"react-addons-test-utils","react-dom":"react-dom","react-redux":"react-redux","redux":"redux","silverstripe-component":"silverstripe-component"}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _stateGalleryActions = require('../../state/gallery/actions');

var galleryActions = _interopRequireWildcard(_stateGalleryActions);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var FileComponent = (function (_SilverStripeComponent) {
	_inherits(FileComponent, _SilverStripeComponent);

	function FileComponent(props) {
		_classCallCheck(this, FileComponent);

		_get(Object.getPrototypeOf(FileComponent.prototype), 'constructor', this).call(this, props);

		this.getButtonTabIndex = this.getButtonTabIndex.bind(this);
		this.onFileNavigate = this.onFileNavigate.bind(this);
		this.onFileEdit = this.onFileEdit.bind(this);
		this.onFileDelete = this.onFileDelete.bind(this);
		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.preventFocus = this.preventFocus.bind(this);
		this.onFileSelect = this.onFileSelect.bind(this);
	}

	_createClass(FileComponent, [{
		key: 'handleDoubleClick',
		value: function handleDoubleClick(event) {
			if (event.target !== _reactDom2['default'].findDOMNode(this.refs.title) && event.target !== _reactDom2['default'].findDOMNode(this.refs.thumbnail)) {
				return;
			}

			this.onFileNavigate(event);
		}
	}, {
		key: 'onFileNavigate',
		value: function onFileNavigate(event) {
			if (this.isFolder()) {
				this.props.onFileNavigate(this.props, event);
				return;
			}

			this.onFileEdit(event);
		}
	}, {
		key: 'onFileSelect',
		value: function onFileSelect(event) {
			event.stopPropagation(); //stop triggering click on root element

			if (this.props.gallery.selectedFiles.indexOf(this.props.id) === -1) {
				this.props.actions.selectFiles(this.props.id);
			} else {
				this.props.actions.deselectFiles(this.props.id);
			}
		}
	}, {
		key: 'onFileEdit',
		value: function onFileEdit(event) {
			var _this = this;

			event.stopPropagation(); //stop triggering click on root element
			this.props.actions.setEditing(this.props.gallery.files.find(function (file) {
				return file.id === _this.props.id;
			}));
		}
	}, {
		key: 'onFileDelete',
		value: function onFileDelete(event) {
			event.stopPropagation(); //stop triggering click on root element
			this.props.onFileDelete(this.props, event);
		}
	}, {
		key: 'isFolder',
		value: function isFolder() {
			return this.props.category === 'folder';
		}
	}, {
		key: 'getThumbnailStyles',
		value: function getThumbnailStyles() {
			if (this.props.category === 'image') {
				return { 'backgroundImage': 'url(' + this.props.url + ')' };
			}

			return {};
		}
	}, {
		key: 'getThumbnailClassNames',
		value: function getThumbnailClassNames() {
			var thumbnailClassNames = 'item__thumbnail';

			if (this.isImageLargerThanThumbnail()) {
				thumbnailClassNames += ' item__thumbnail--large';
			}

			return thumbnailClassNames;
		}
	}, {
		key: 'isSelected',
		value: function isSelected() {
			return this.props.gallery.selectedFiles.indexOf(this.props.id) > -1;
		}
	}, {
		key: 'isFocussed',
		value: function isFocussed() {
			return this.props.gallery.focus === this.props.id;
		}
	}, {
		key: 'getButtonTabIndex',
		value: function getButtonTabIndex() {
			if (this.isFocussed()) {
				return 0;
			} else {
				return -1;
			}
		}
	}, {
		key: 'getItemClassNames',
		value: function getItemClassNames() {
			var itemClassNames = 'item item--' + this.props.category;

			if (this.isFocussed()) {
				itemClassNames += ' item--focussed';
			}

			if (this.isSelected()) {
				itemClassNames += ' item--selected';
			}

			return itemClassNames;
		}
	}, {
		key: 'isImageLargerThanThumbnail',
		value: function isImageLargerThanThumbnail() {
			var dimensions = this.props.attributes.dimensions;

			return dimensions.height > _constants2['default'].THUMBNAIL_HEIGHT || dimensions.width > _constants2['default'].THUMBNAIL_WIDTH;
		}
	}, {
		key: 'handleKeyDown',
		value: function handleKeyDown(event) {
			event.stopPropagation();

			//if event doesn't come from the root element, do nothing
			if (event.target !== _reactDom2['default'].findDOMNode(this.refs.thumbnail)) {
				return;
			}

			//If space is pressed, allow focus on buttons
			if (this.props.spaceKey === event.keyCode) {
				event.preventDefault(); //Stop page from scrolling
				(0, _jQuery2['default'])(_reactDom2['default'].findDOMNode(this)).find('.item__actions__action').first().focus();
			}

			//If return is pressed, navigate folder
			if (this.props.returnKey === event.keyCode) {
				this.onFileNavigate(event);
			}
		}
	}, {
		key: 'handleFocus',
		value: function handleFocus() {
			this.props.actions.setFocus(this.props.id);
		}
	}, {
		key: 'handleBlur',
		value: function handleBlur() {
			this.props.actions.setFocus(false);
		}
	}, {
		key: 'preventFocus',
		value: function preventFocus(event) {
			//To avoid browser's default focus state when selecting an item
			event.preventDefault();
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2['default'].createElement(
				'div',
				{ className: this.getItemClassNames(), 'data-id': this.props.id, onDoubleClick: this.handleDoubleClick },
				_react2['default'].createElement(
					'div',
					{ ref: 'thumbnail', className: this.getThumbnailClassNames(), tabIndex: '0', onKeyDown: this.handleKeyDown, style: this.getThumbnailStyles(), onClick: this.onFileSelect, onMouseDown: this.preventFocus },
					_react2['default'].createElement(
						'div',
						{ className: 'item__actions' },
						_react2['default'].createElement('button', {
							className: 'item__actions__action item__actions__action--select [ font-icon-tick ]',
							type: 'button',
							title: _i18n2['default']._t('AssetGalleryField.SELECT'),
							tabIndex: this.getButtonTabIndex(),
							onClick: this.onFileSelect,
							onFocus: this.handleFocus,
							onBlur: this.handleBlur }),
						_react2['default'].createElement('button', {
							className: 'item__actions__action item__actions__action--remove [ font-icon-trash ]',
							type: 'button',
							title: _i18n2['default']._t('AssetGalleryField.DELETE'),
							tabIndex: this.getButtonTabIndex(),
							onClick: this.onFileDelete,
							onFocus: this.handleFocus,
							onBlur: this.handleBlur }),
						_react2['default'].createElement('button', {
							className: 'item__actions__action item__actions__action--edit [ font-icon-edit ]',
							type: 'button',
							title: _i18n2['default']._t('AssetGalleryField.EDIT'),
							tabIndex: this.getButtonTabIndex(),
							onClick: this.onFileEdit,
							onFocus: this.handleFocus,
							onBlur: this.handleBlur })
					)
				),
				_react2['default'].createElement(
					'p',
					{ className: 'item__title', ref: 'title' },
					this.props.title
				)
			);
		}
	}]);

	return FileComponent;
})(_silverstripeComponent2['default']);

FileComponent.propTypes = {
	id: _react2['default'].PropTypes.number,
	title: _react2['default'].PropTypes.string,
	category: _react2['default'].PropTypes.string,
	url: _react2['default'].PropTypes.string,
	dimensions: _react2['default'].PropTypes.shape({
		width: _react2['default'].PropTypes.number,
		height: _react2['default'].PropTypes.number
	}),
	onFileNavigate: _react2['default'].PropTypes.func,
	onFileEdit: _react2['default'].PropTypes.func,
	onFileDelete: _react2['default'].PropTypes.func,
	spaceKey: _react2['default'].PropTypes.number,
	returnKey: _react2['default'].PropTypes.number,
	onFileSelect: _react2['default'].PropTypes.func,
	selected: _react2['default'].PropTypes.bool
};

function mapStateToProps(state) {
	return {
		gallery: state.assetAdmin.gallery
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: (0, _redux.bindActionCreators)(galleryActions, dispatch)
	};
}

exports['default'] = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(FileComponent);
module.exports = exports['default'];

},{"../../constants":6,"../../state/gallery/actions":11,"i18n":"i18n","jQuery":"jQuery","react":"react","react-dom":"react-dom","react-redux":"react-redux","redux":"redux","silverstripe-component":"silverstripe-component"}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var TextFieldComponent = (function (_SilverStripeComponent) {
    _inherits(TextFieldComponent, _SilverStripeComponent);

    function TextFieldComponent(props) {
        _classCallCheck(this, TextFieldComponent);

        _get(Object.getPrototypeOf(TextFieldComponent.prototype), 'constructor', this).call(this, props);

        this.handleChange = this.handleChange.bind(this);
    }

    _createClass(TextFieldComponent, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'div',
                { className: 'field text' },
                _react2['default'].createElement(
                    'label',
                    { className: 'left', htmlFor: 'gallery_' + this.props.name },
                    this.props.label
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'middleColumn' },
                    _react2['default'].createElement('input', {
                        id: 'gallery_' + this.props.name,
                        className: 'text',
                        type: 'text',
                        name: this.props.name,
                        onChange: this.handleChange,
                        value: this.props.value })
                )
            );
        }
    }, {
        key: 'handleChange',
        value: function handleChange(event) {
            this.props.onChange();
        }
    }]);

    return TextFieldComponent;
})(_silverstripeComponent2['default']);

exports['default'] = TextFieldComponent;

TextFieldComponent.propTypes = {
    label: _react2['default'].PropTypes.string.isRequired,
    name: _react2['default'].PropTypes.string.isRequired,
    value: _react2['default'].PropTypes.string.isRequired,
    onChange: _react2['default'].PropTypes.func.isRequired
};
module.exports = exports['default'];

},{"react":"react","silverstripe-component":"silverstripe-component"}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

exports['default'] = {
	'THUMBNAIL_HEIGHT': 150,
	'THUMBNAIL_WIDTH': 200,
	'SPACE_KEY_CODE': 32,
	'RETURN_KEY_CODE': 13,
	'BULK_ACTIONS': [{
		value: 'delete',
		label: _i18n2['default']._t('AssetGalleryField.BULK_ACTIONS_DELETE'),
		destructive: true
	}],
	'BULK_ACTIONS_PLACEHOLDER': _i18n2['default']._t('AssetGalleryField.BULK_ACTIONS_PLACEHOLDER')
};
module.exports = exports['default'];

},{"i18n":"i18n"}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _stateGalleryActions = require('../../state/gallery/actions');

var galleryActions = _interopRequireWildcard(_stateGalleryActions);

var _componentsTextFieldIndex = require('../../components/text-field/index');

var _componentsTextFieldIndex2 = _interopRequireDefault(_componentsTextFieldIndex);

var EditorContainer = (function (_SilverStripeComponent) {
	_inherits(EditorContainer, _SilverStripeComponent);

	function EditorContainer(props) {
		_classCallCheck(this, EditorContainer);

		_get(Object.getPrototypeOf(EditorContainer.prototype), 'constructor', this).call(this, props);

		this.fields = [{
			'label': 'Title',
			'name': 'title',
			'value': this.props.file.title
		}, {
			'label': 'Filename',
			'name': 'basename',
			'value': this.props.file.basename
		}];

		this.onFieldChange = this.onFieldChange.bind(this);
		this.onFileSave = this.onFileSave.bind(this);
		this.onCancel = this.onCancel.bind(this);
	}

	_createClass(EditorContainer, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			_get(Object.getPrototypeOf(EditorContainer.prototype), 'componentDidMount', this).call(this);

			this.props.actions.setEditorFields(this.fields);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			_get(Object.getPrototypeOf(EditorContainer.prototype), 'componentWillUnmount', this).call(this);

			this.props.actions.setEditorFields();
		}
	}, {
		key: 'onFieldChange',
		value: function onFieldChange(event) {
			this.props.actions.updateEditorField({
				name: event.target.name,
				value: event.target.value
			});
		}
	}, {
		key: 'onFileSave',
		value: function onFileSave(event) {
			this.props.onFileSave(this.props.file.id, this.props.gallery.editorFields, event);
		}
	}, {
		key: 'onCancel',
		value: function onCancel(event) {
			this.props.actions.setEditing(false);
		}
	}, {
		key: 'render',
		value: function render() {
			var _this = this;

			return _react2['default'].createElement(
				'div',
				{ className: 'editor' },
				_react2['default'].createElement(
					'div',
					{ className: 'CompositeField composite cms-file-info nolabel' },
					_react2['default'].createElement(
						'div',
						{ className: 'CompositeField composite cms-file-info-preview nolabel' },
						_react2['default'].createElement('img', { className: 'thumbnail-preview', src: this.props.file.url })
					),
					_react2['default'].createElement(
						'div',
						{ className: 'CompositeField composite cms-file-info-data nolabel' },
						_react2['default'].createElement(
							'div',
							{ className: 'CompositeField composite nolabel' },
							_react2['default'].createElement(
								'div',
								{ className: 'field readonly' },
								_react2['default'].createElement(
									'label',
									{ className: 'left' },
									_i18n2['default']._t('AssetGalleryField.TYPE'),
									':'
								),
								_react2['default'].createElement(
									'div',
									{ className: 'middleColumn' },
									_react2['default'].createElement(
										'span',
										{ className: 'readonly' },
										this.props.file.type
									)
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.SIZE'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									this.props.file.size
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.URL'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									_react2['default'].createElement(
										'a',
										{ href: this.props.file.url, target: '_blank' },
										this.props.file.url
									)
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field date_disabled readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.CREATED'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									this.props.file.created
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field date_disabled readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.LASTEDIT'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									this.props.file.lastUpdated
								)
							)
						),
						_react2['default'].createElement(
							'div',
							{ className: 'field readonly' },
							_react2['default'].createElement(
								'label',
								{ className: 'left' },
								_i18n2['default']._t('AssetGalleryField.DIM'),
								':'
							),
							_react2['default'].createElement(
								'div',
								{ className: 'middleColumn' },
								_react2['default'].createElement(
									'span',
									{ className: 'readonly' },
									this.props.file.attributes.dimensions.width,
									' x ',
									this.props.file.attributes.dimensions.height,
									'px'
								)
							)
						)
					)
				),
				this.props.gallery.editorFields.map(function (field, i) {
					return _react2['default'].createElement(_componentsTextFieldIndex2['default'], {
						key: i,
						label: field.label,
						name: field.name,
						value: field.value,
						onChange: _this.onFieldChange });
				}),
				_react2['default'].createElement(
					'div',
					null,
					_react2['default'].createElement(
						'button',
						{
							type: 'submit',
							className: 'ss-ui-button ui-button ui-widget ui-state-default ui-corner-all font-icon-check-mark',
							onClick: this.onFileSave },
						_i18n2['default']._t('AssetGalleryField.SAVE')
					),
					_react2['default'].createElement(
						'button',
						{
							type: 'button',
							className: 'ss-ui-button ui-button ui-widget ui-state-default ui-corner-all font-icon-cancel-circled',
							onClick: this.onCancel },
						_i18n2['default']._t('AssetGalleryField.CANCEL')
					)
				)
			);
		}
	}]);

	return EditorContainer;
})(_silverstripeComponent2['default']);

EditorContainer.propTypes = {
	file: _react2['default'].PropTypes.shape({
		id: _react2['default'].PropTypes.number,
		title: _react2['default'].PropTypes.string,
		basename: _react2['default'].PropTypes.string,
		url: _react2['default'].PropTypes.string,
		size: _react2['default'].PropTypes.string,
		created: _react2['default'].PropTypes.string,
		lastUpdated: _react2['default'].PropTypes.string,
		dimensions: _react2['default'].PropTypes.shape({
			width: _react2['default'].PropTypes.number,
			height: _react2['default'].PropTypes.number
		})
	}),
	onFileSave: _react2['default'].PropTypes.func,
	onCancel: _react2['default'].PropTypes.func
};

function mapStateToProps(state) {
	return {
		gallery: state.assetAdmin.gallery
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: (0, _redux.bindActionCreators)(galleryActions, dispatch)
	};
}

exports['default'] = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(EditorContainer);
module.exports = exports['default'];

},{"../../components/text-field/index":5,"../../state/gallery/actions":11,"i18n":"i18n","jQuery":"jQuery","react":"react","react-redux":"react-redux","redux":"redux","silverstripe-component":"silverstripe-component"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _i18n = require('i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _componentsFileIndex = require('../../components/file/index');

var _componentsFileIndex2 = _interopRequireDefault(_componentsFileIndex);

var _editorControllerJs = require('../editor/controller.js');

var _editorControllerJs2 = _interopRequireDefault(_editorControllerJs);

var _componentsBulkActionsIndex = require('../../components/bulk-actions/index');

var _componentsBulkActionsIndex2 = _interopRequireDefault(_componentsBulkActionsIndex);

var _silverstripeComponent = require('silverstripe-component');

var _silverstripeComponent2 = _interopRequireDefault(_silverstripeComponent);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

var _stateGalleryActions = require('../../state/gallery/actions');

var galleryActions = _interopRequireWildcard(_stateGalleryActions);

function getComparator(field, direction) {
	return function (a, b) {
		if (direction === 'asc') {
			if (a[field] < b[field]) {
				return -1;
			}

			if (a[field] > b[field]) {
				return 1;
			}
		} else {
			if (a[field] > b[field]) {
				return -1;
			}

			if (a[field] < b[field]) {
				return 1;
			}
		}

		return 0;
	};
}

function getSort(field, direction) {
	var _this = this;

	var comparator = getComparator(field, direction);

	return function () {
		var folders = _this.props.gallery.files.filter(function (file) {
			return file.type === 'folder';
		});
		var files = _this.props.gallery.files.filter(function (file) {
			return file.type !== 'folder';
		});

		_this.props.actions.addFile(folders.sort(comparator).concat(files.sort(comparator)));
	};
}

var GalleryContainer = (function (_SilverStripeComponent) {
	_inherits(GalleryContainer, _SilverStripeComponent);

	function GalleryContainer(props) {
		_classCallCheck(this, GalleryContainer);

		_get(Object.getPrototypeOf(GalleryContainer.prototype), 'constructor', this).call(this, props);

		this.folders = [props.initial_folder];

		this.sort = 'name';
		this.direction = 'asc';

		this.sorters = [{
			'field': 'title',
			'direction': 'asc',
			'label': _i18n2['default']._t('AssetGalleryField.FILTER_TITLE_ASC'),
			'onSort': getSort.call(this, 'title', 'asc')
		}, {
			'field': 'title',
			'direction': 'desc',
			'label': _i18n2['default']._t('AssetGalleryField.FILTER_TITLE_DESC'),
			'onSort': getSort.call(this, 'title', 'desc')
		}, {
			'field': 'created',
			'direction': 'desc',
			'label': _i18n2['default']._t('AssetGalleryField.FILTER_DATE_DESC'),
			'onSort': getSort.call(this, 'created', 'desc')
		}, {
			'field': 'created',
			'direction': 'asc',
			'label': _i18n2['default']._t('AssetGalleryField.FILTER_DATE_ASC'),
			'onSort': getSort.call(this, 'created', 'asc')
		}];

		// Backend event listeners
		this.onFetchData = this.onFetchData.bind(this);
		this.onSaveData = this.onSaveData.bind(this);
		this.onDeleteData = this.onDeleteData.bind(this);
		this.onNavigateData = this.onNavigateData.bind(this);
		this.onMoreData = this.onMoreData.bind(this);
		this.onSearchData = this.onSearchData.bind(this);

		// User event listeners
		this.onFileSave = this.onFileSave.bind(this);
		this.onFileNavigate = this.onFileNavigate.bind(this);
		this.onFileDelete = this.onFileDelete.bind(this);
		this.onBackClick = this.onBackClick.bind(this);
		this.onMoreClick = this.onMoreClick.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	_createClass(GalleryContainer, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			_get(Object.getPrototypeOf(GalleryContainer.prototype), 'componentDidMount', this).call(this);

			if (this.props.initial_folder !== this.props.current_folder) {
				this.onNavigate(this.props.current_folder);
			} else {
				this.props.backend.search();
			}

			this.props.backend.on('onFetchData', this.onFetchData);
			this.props.backend.on('onSaveData', this.onSaveData);
			this.props.backend.on('onDeleteData', this.onDeleteData);
			this.props.backend.on('onNavigateData', this.onNavigateData);
			this.props.backend.on('onMoreData', this.onMoreData);
			this.props.backend.on('onSearchData', this.onSearchData);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			_get(Object.getPrototypeOf(GalleryContainer.prototype), 'componentWillUnmount', this).call(this);

			this.props.backend.removeListener('onFetchData', this.onFetchData);
			this.props.backend.removeListener('onSaveData', this.onSaveData);
			this.props.backend.removeListener('onDeleteData', this.onDeleteData);
			this.props.backend.removeListener('onNavigateData', this.onNavigateData);
			this.props.backend.removeListener('onMoreData', this.onMoreData);
			this.props.backend.removeListener('onSearchData', this.onSearchData);
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			var $select = (0, _jQuery2['default'])(_reactDom2['default'].findDOMNode(this)).find('.gallery__sort .dropdown');

			// We opt-out of letting the CMS handle Chosen because it doesn't re-apply the behaviour correctly.
			// So after the gallery has been rendered we apply Chosen.
			$select.chosen({
				'allow_single_deselect': true,
				'disable_search_threshold': 20
			});

			// Chosen stops the change event from reaching React so we have to simulate a click.
			$select.change(function () {
				return _reactAddonsTestUtils2['default'].Simulate.click($select.find(':selected')[0]);
			});
		}
	}, {
		key: 'getFileById',
		value: function getFileById(id) {
			var folder = null;

			for (var i = 0; i < this.props.gallery.files.length; i += 1) {
				if (this.props.gallery.files[i].id === id) {
					folder = this.props.gallery.files[i];
					break;
				}
			}

			return folder;
		}
	}, {
		key: 'getNoItemsNotice',
		value: function getNoItemsNotice() {
			if (this.props.gallery.count < 1) {
				return _react2['default'].createElement(
					'p',
					{ className: 'gallery__no-item-notice' },
					_i18n2['default']._t('AssetGalleryField.NOITEMSFOUND')
				);
			}

			return null;
		}
	}, {
		key: 'getBackButton',
		value: function getBackButton() {
			if (this.folders.length > 1) {
				return _react2['default'].createElement('button', {
					className: 'gallery__back ss-ui-button ui-button ui-widget ui-state-default ui-corner-all font-icon-level-up no-text',
					onClick: this.onBackClick,
					ref: 'backButton' });
			}

			return null;
		}
	}, {
		key: 'getBulkActionsComponent',
		value: function getBulkActionsComponent() {
			if (this.props.gallery.selectedFiles.length > 0 && this.props.backend.bulkActions) {
				return _react2['default'].createElement(_componentsBulkActionsIndex2['default'], {
					backend: this.props.backend });
			}

			return null;
		}
	}, {
		key: 'getMoreButton',
		value: function getMoreButton() {
			if (this.props.gallery.count > this.props.gallery.files.length) {
				return _react2['default'].createElement(
					'button',
					{
						className: 'gallery__load__more',
						onClick: this.onMoreClick },
					_i18n2['default']._t('AssetGalleryField.LOADMORE')
				);
			}

			return null;
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			if (this.props.gallery.editing !== false) {
				return _react2['default'].createElement(
					'div',
					{ className: 'gallery' },
					_react2['default'].createElement(_editorControllerJs2['default'], {
						file: this.props.gallery.editing,
						onFileSave: this.onFileSave,
						onCancel: this.onCancel })
				);
			}

			return _react2['default'].createElement(
				'div',
				{ className: 'gallery' },
				this.getBackButton(),
				this.getBulkActionsComponent(),
				_react2['default'].createElement(
					'div',
					{ className: 'gallery__sort fieldholder-small' },
					_react2['default'].createElement(
						'select',
						{ className: 'dropdown no-change-track no-chzn', tabIndex: '0', style: { width: '160px' } },
						this.sorters.map(function (sorter, i) {
							return _react2['default'].createElement(
								'option',
								{ key: i, onClick: sorter.onSort },
								sorter.label
							);
						})
					)
				),
				_react2['default'].createElement(
					'div',
					{ className: 'gallery__items' },
					this.props.gallery.files.map(function (file, i) {
						return _react2['default'].createElement(_componentsFileIndex2['default'], _extends({ key: i }, file, {
							spaceKey: _constants2['default'].SPACE_KEY_CODE,
							returnKey: _constants2['default'].RETURN_KEY_CODE,
							onFileDelete: _this2.onFileDelete,
							onFileNavigate: _this2.onFileNavigate }));
					})
				),
				this.getNoItemsNotice(),
				_react2['default'].createElement(
					'div',
					{ className: 'gallery__load' },
					this.getMoreButton()
				)
			);
		}
	}, {
		key: 'onFetchData',
		value: function onFetchData(data) {
			this.props.actions.addFile(data.files, data.count);
		}
	}, {
		key: 'onSaveData',
		value: function onSaveData(id, values) {
			this.props.actions.setEditing(false);
			this.props.actions.updateFile(id, { title: values.title, basename: values.basename });
		}
	}, {
		key: 'onDeleteData',
		value: function onDeleteData(data) {
			var files = this.props.gallery.files.filter(function (file) {
				return data !== file.id;
			});

			this.props.actions.addFile(files, this.props.gallery.count - 1);
		}
	}, {
		key: 'onNavigateData',
		value: function onNavigateData(data) {
			this.props.actions.addFile(data.files, data.count);
		}
	}, {
		key: 'onMoreData',
		value: function onMoreData(data) {
			this.props.actions.addFile(this.props.gallery.files.concat(data.files), data.count);
		}
	}, {
		key: 'onSearchData',
		value: function onSearchData(data) {
			this.props.actions.addFile(data.files, data.count);
		}
	}, {
		key: 'onFileDelete',
		value: function onFileDelete(file, event) {
			if (confirm(_i18n2['default']._t('AssetGalleryField.CONFIRMDELETE'))) {
				this.props.backend['delete'](file.id);
				this.emitFileDeletedCmsEvent();
			}

			event.stopPropagation();
		}
	}, {
		key: 'onFileNavigate',
		value: function onFileNavigate(file) {
			this.folders.push(file.filename);
			this.props.backend.navigate(file.filename);

			this.props.actions.deselectFiles();

			this.emitFolderChangedCmsEvent();
		}
	}, {
		key: 'emitFolderChangedCmsEvent',
		value: function emitFolderChangedCmsEvent() {
			var folder = {
				parentId: 0,
				id: 0
			};

			// The current folder is stored by it's name in our component.
			// We need to get it's id because that's how Entwine components (GridField) reference it.
			for (var i = 0; i < this.props.gallery.files.length; i += 1) {
				if (this.props.gallery.files[i].filename === this.props.backend.folder) {
					folder.parentId = this.props.gallery.files[i].parent.id;
					folder.id = this.props.gallery.files[i].id;
					break;
				}
			}

			this._emitCmsEvent('folder-changed.asset-gallery-field', folder);
		}
	}, {
		key: 'emitFileDeletedCmsEvent',
		value: function emitFileDeletedCmsEvent() {
			this._emitCmsEvent('file-deleted.asset-gallery-field');
		}
	}, {
		key: 'emitEnterFileViewCmsEvent',
		value: function emitEnterFileViewCmsEvent(file) {
			var id = 0;

			this._emitCmsEvent('enter-file-view.asset-gallery-field', file.id);
		}
	}, {
		key: 'emitExitFileViewCmsEvent',
		value: function emitExitFileViewCmsEvent() {
			this._emitCmsEvent('exit-file-view.asset-gallery-field');
		}
	}, {
		key: 'onNavigate',
		value: function onNavigate(folder) {
			var silent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			// Don't the folder if it exists already.
			if (this.folders.indexOf(folder) === -1) {
				this.folders.push(folder);
			}

			this.props.backend.navigate(folder);

			if (!silent) {
				this.emitFolderChangedCmsEvent();
			}
		}
	}, {
		key: 'onMoreClick',
		value: function onMoreClick(event) {
			event.stopPropagation();

			this.props.backend.more();

			event.preventDefault();
		}
	}, {
		key: 'onBackClick',
		value: function onBackClick(event) {
			if (this.folders.length > 1) {
				this.folders.pop();
				this.props.backend.navigate(this.folders[this.folders.length - 1]);
			}

			this.props.actions.deselectFiles();

			this.emitFolderChangedCmsEvent();

			event.preventDefault();
		}
	}, {
		key: 'onFileSave',
		value: function onFileSave(id, state, event) {
			this.props.backend.save(id, state);

			event.stopPropagation();
			event.preventDefault();
		}
	}]);

	return GalleryContainer;
})(_silverstripeComponent2['default']);

GalleryContainer.propTypes = {
	backend: _react2['default'].PropTypes.object.isRequired
};

function mapStateToProps(state) {
	return {
		gallery: state.assetAdmin.gallery
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: (0, _redux.bindActionCreators)(galleryActions, dispatch)
	};
}

exports['default'] = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(GalleryContainer);
module.exports = exports['default'];

},{"../../components/bulk-actions/index":3,"../../components/file/index":4,"../../constants":6,"../../state/gallery/actions":11,"../editor/controller.js":7,"i18n":"i18n","jQuery":"jQuery","react":"react","react-addons-test-utils":"react-addons-test-utils","react-dom":"react-dom","react-redux":"react-redux","redux":"redux","silverstripe-component":"silverstripe-component"}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var GALLERY = {
    ADD_FILE: 'ADD_FILE',
    UPDATE_FILE: 'UPDATE_FILE',
    SELECT_FILES: 'SELECT_FILES',
    DESELECT_FILES: 'DESELECT_FILES',
    SET_EDITING: 'SET_EDITING',
    SET_FOCUS: 'SET_FOCUS',
    SET_EDITOR_FIELDS: 'SET_EDITOR_FIELDS',
    UPDATE_EDITOR_FIELD: 'UPDATE_EDITOR_FIELD'
};
exports.GALLERY = GALLERY;

},{}],10:[function(require,module,exports){
/**
 * @file Factory for creating a Redux store.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = configureStore;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

// Used for handling async store updates.

var _reduxLogger = require('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

// Logs state changes to the console. Useful for debugging.

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

/**
 * @func createStoreWithMiddleware
 * @param function rootReducer
 * @param object initialState
 * @desc Creates a Redux store with some middleware applied.
 * @private
 */
var createStoreWithMiddleware = (0, _redux.applyMiddleware)(_reduxThunk2['default'], (0, _reduxLogger2['default'])())(_redux.createStore);

/**
 * @func configureStore
 * @param object initialState
 * @return object - A Redux store that lets you read the state, dispatch actions and subscribe to changes.
 */

function configureStore() {
  var initialState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var store = createStoreWithMiddleware(_reducer2['default'], initialState);

  return store;
}

;
module.exports = exports['default'];

},{"./reducer":13,"redux":"redux","redux-logger":16,"redux-thunk":"redux-thunk"}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.addFile = addFile;
exports.updateFile = updateFile;
exports.selectFiles = selectFiles;
exports.deselectFiles = deselectFiles;
exports.setEditing = setEditing;
exports.setFocus = setFocus;
exports.setEditorFields = setEditorFields;
exports.updateEditorField = updateEditorField;

var _actionTypes = require('../action-types');

/**
 * Adds a file to state.
 *
 * @param object|array file - File object or array of file objects.
 * @param number [count] - The number of files in the current view.
 */

function addFile(file, count) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.ADD_FILE,
            payload: { file: file, count: count }
        });
    };
}

/**
 * Updates a file with new data.
 *
 * @param number id - The id of the file to update.
 * @param object updates - The new values.
 */

function updateFile(id, updates) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.UPDATE_FILE,
            payload: { id: id, updates: updates }
        });
    };
}

/**
 * Selects a file or files. If no param is passed all files are selected.
 *
 * @param number|array ids - File id or array of file ids to select.
 */

function selectFiles() {
    var ids = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.SELECT_FILES,
            payload: { ids: ids }
        });
    };
}

/**
 * Deselects a file or files. If no param is passed all files are deselected.
 *
 * @param number|array ids - File id or array of file ids to deselect.
 */

function deselectFiles() {
    var ids = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.DESELECT_FILES,
            payload: { ids: ids }
        });
    };
}

/**
 * Starts editing the given file or stops editing if false is given.
 *
 * @param object|boolean file - The file to edit.
 */

function setEditing(file) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.SET_EDITING,
            payload: { file: file }
        });
    };
}

/**
 * Sets the focus state of a file.
 *
 * @param number|boolean id - the id of the file to focus on, or false.
 */

function setFocus(id) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.SET_FOCUS,
            payload: {
                id: id
            }
        });
    };
}

/**
 * Sets the state of the fields for the editor component.
 *
 * @param object editorFields - the current fields in the editor component
 */

function setEditorFields() {
    var editorFields = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.SET_EDITOR_FIELDS,
            payload: { editorFields: editorFields }
        });
    };
}

/**
 * Update the value of the given field.
 *
 * @param object updates - The values to update the editor field with.
 * @param string updates.name - The editor field name.
 * @param string updates.value - The new value of the field.
 * @param string [updates.label] - The field label.
 */

function updateEditorField(updates) {
    return function (dispatch, getState) {
        return dispatch({
            type: _actionTypes.GALLERY.UPDATE_EDITOR_FIELD,
            payload: { updates: updates }
        });
    };
}

},{"../action-types":9}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = galleryReducer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _deepFreeze = require('deep-freeze');

var _deepFreeze2 = _interopRequireDefault(_deepFreeze);

var _actionTypes = require('../action-types');

var _constantsJs = require('../../constants.js');

var _constantsJs2 = _interopRequireDefault(_constantsJs);

var initialState = {
    count: 0, // The number of files in the current view
    editing: false,
    files: [],
    selectedFiles: [],
    editing: false,
    focus: false,
    bulkActions: {
        placeholder: _constantsJs2['default'].BULK_ACTIONS_PLACEHOLDER,
        options: _constantsJs2['default'].BULK_ACTIONS
    },
    editorFields: []
};

/**
 * Reducer for the `assetAdmin.gallery` state key.
 *
 * @param object state
 * @param object action - The dispatched action.
 * @param string action.type - Name of the dispatched action.
 * @param object [action.payload] - Optional data passed with the action.
 */

function galleryReducer(state, action) {
    if (state === undefined) state = initialState;

    var nextState;

    switch (action.type) {
        case _actionTypes.GALLERY.ADD_FILE:
            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                count: action.payload.count !== 'undefined' ? action.payload.count : state.count,
                files: state.files.concat(action.payload.file)
            }));

        case _actionTypes.GALLERY.UPDATE_FILE:
            var fileIndex = state.files.map(function (file) {
                return file.id;
            }).indexOf(action.payload.id);
            var updatedFile = Object.assign({}, state.files[fileIndex], action.payload.updates);

            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                files: state.files.map(function (file) {
                    return file.id === updatedFile.id ? updatedFile : file;
                })
            }));

        case _actionTypes.GALLERY.SELECT_FILES:
            if (action.payload.ids === null) {
                // No param was passed, add everything that isn't currently selected, to the selectedFiles array.
                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                    selectedFiles: state.selectedFiles.concat(state.files.map(function (file) {
                        return file.id;
                    }).filter(function (id) {
                        return state.selectedFiles.indexOf(id) === -1;
                    }))
                }));
            } else if (typeof action.payload.ids === 'number') {
                // We're dealing with a single id to select.
                // Add the file if it's not already selected.
                if (state.selectedFiles.indexOf(action.payload.ids) === -1) {
                    nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                        selectedFiles: state.selectedFiles.concat(action.payload.ids)
                    }));
                } else {
                    // The file is already selected, so return the current state.
                    nextState = state;
                }
            } else {
                // We're dealing with an array if ids to select.
                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                    selectedFiles: state.selectedFiles.concat(action.payload.ids.filter(function (id) {
                        return state.selectedFiles.indexOf(id) === -1;
                    }))
                }));
            }

            return nextState;

        case _actionTypes.GALLERY.DESELECT_FILES:
            if (action.payload.ids === null) {
                // No param was passed, deselect everything.
                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, { selectedFiles: [] }));
            } else if (typeof action.payload.ids === 'number') {
                // We're dealing with a single id to deselect.
                var _fileIndex = state.selectedFiles.indexOf(action.payload.ids);

                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                    selectedFiles: state.selectedFiles.slice(0, _fileIndex).concat(state.selectedFiles.slice(_fileIndex + 1))
                }));
            } else {
                // We're dealing with an array if ids to deselect.
                nextState = (0, _deepFreeze2['default'])(Object.assign({}, state, {
                    selectedFiles: state.selectedFiles.filter(function (id) {
                        return action.payload.ids.indexOf(id) === -1;
                    })
                }));
            }

            return nextState;

        case _actionTypes.GALLERY.SET_EDITING:
            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                editing: action.payload.file
            }));

        case _actionTypes.GALLERY.SET_FOCUS:
            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                focus: action.payload.id
            }));

        case _actionTypes.GALLERY.SET_EDITOR_FIELDS:
            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                editorFields: action.payload.editorFields
            }));

        case _actionTypes.GALLERY.UPDATE_EDITOR_FIELD:
            var fieldIndex = state.editorFields.map(function (field) {
                return field.name;
            }).indexOf(action.payload.updates.name);
            var updatedField = Object.assign({}, state.editorFields[fieldIndex], action.payload.updates);

            return (0, _deepFreeze2['default'])(Object.assign({}, state, {
                editorFields: state.editorFields.map(function (field) {
                    return field.name === updatedField.name ? updatedField : field;
                })
            }));

        default:
            return state;
    }
}

module.exports = exports['default'];

},{"../../constants.js":6,"../action-types":9,"deep-freeze":15}],13:[function(require,module,exports){
/**
 * @file The reducer which operates on the Redux store.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _redux = require('redux');

var _galleryReducerJs = require('./gallery/reducer.js');

var _galleryReducerJs2 = _interopRequireDefault(_galleryReducerJs);

/**
 * Operates on the Redux store to update application state.
 *
 * @param object state - The current state.
 * @param object action - The dispatched action.
 * @param string action.type - The type of action that has been dispatched.
 * @param object [action.payload] - Optional data passed with the action.
 */
var rootReducer = (0, _redux.combineReducers)({
  assetAdmin: (0, _redux.combineReducers)({
    gallery: _galleryReducerJs2['default']
  })
});

exports['default'] = rootReducer;
module.exports = exports['default'];

},{"./gallery/reducer.js":12,"redux":"redux"}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],15:[function(require,module,exports){
module.exports = function deepFreeze (o) {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o.hasOwnProperty(prop)
    && o[prop] !== null
    && (typeof o[prop] === "object" || typeof o[prop] === "function")
    && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  
  return o;
};

},{}],16:[function(require,module,exports){
"use strict";

var repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};
var pad = function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
};
var formatTime = function formatTime(time) {
  return " @ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
};

// Use the new performance api to get better precision if available
var timer = typeof performance !== "undefined" && typeof performance.now === "function" ? performance : Date;

/**
 * Creates logger with followed options
 *
 * @namespace
 * @property {object} options - options for logger
 * @property {string} options.level - console[level]
 * @property {boolean} options.duration - print duration of each action?
 * @property {boolean} options.timestamp - print timestamp with each action?
 * @property {object} options.colors - custom colors
 * @property {object} options.logger - implementation of the `console` API
 * @property {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @property {boolean} options.collapsed - is group collapsed?
 * @property {boolean} options.predicate - condition which resolves logger behavior
 * @property {function} options.stateTransformer - transform state before print
 * @property {function} options.actionTransformer - transform action before print
 * @property {function} options.errorTransformer - transform error before print
 */

function createLogger() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _options$level = options.level;
  var level = _options$level === undefined ? "log" : _options$level;
  var _options$logger = options.logger;
  var logger = _options$logger === undefined ? window.console : _options$logger;
  var _options$logErrors = options.logErrors;
  var logErrors = _options$logErrors === undefined ? true : _options$logErrors;
  var collapsed = options.collapsed;
  var predicate = options.predicate;
  var _options$duration = options.duration;
  var duration = _options$duration === undefined ? false : _options$duration;
  var _options$timestamp = options.timestamp;
  var timestamp = _options$timestamp === undefined ? true : _options$timestamp;
  var transformer = options.transformer;
  var _options$stateTransfo = options.stateTransformer;
  var // deprecated
  stateTransformer = _options$stateTransfo === undefined ? function (state) {
    return state;
  } : _options$stateTransfo;
  var _options$actionTransf = options.actionTransformer;
  var actionTransformer = _options$actionTransf === undefined ? function (actn) {
    return actn;
  } : _options$actionTransf;
  var _options$errorTransfo = options.errorTransformer;
  var errorTransformer = _options$errorTransfo === undefined ? function (error) {
    return error;
  } : _options$errorTransfo;
  var _options$colors = options.colors;
  var colors = _options$colors === undefined ? {
    title: function title() {
      return "#000000";
    },
    prevState: function prevState() {
      return "#9E9E9E";
    },
    action: function action() {
      return "#03A9F4";
    },
    nextState: function nextState() {
      return "#4CAF50";
    },
    error: function error() {
      return "#F20404";
    }
  } : _options$colors;

  // exit if console undefined

  if (typeof logger === "undefined") {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }

  if (transformer) {
    console.error("Option 'transformer' is deprecated, use stateTransformer instead");
  }

  var logBuffer = [];
  function printBuffer() {
    logBuffer.forEach(function (logEntry, key) {
      var started = logEntry.started;
      var action = logEntry.action;
      var prevState = logEntry.prevState;
      var error = logEntry.error;
      var took = logEntry.took;
      var nextState = logEntry.nextState;

      var nextEntry = logBuffer[key + 1];
      if (nextEntry) {
        nextState = nextEntry.prevState;
        took = nextEntry.started - started;
      }
      // message
      var formattedAction = actionTransformer(action);
      var time = new Date(started);
      var isCollapsed = typeof collapsed === "function" ? collapsed(function () {
        return nextState;
      }, action) : collapsed;

      var formattedTime = formatTime(time);
      var titleCSS = colors.title ? "color: " + colors.title(formattedAction) + ";" : null;
      var title = "action " + formattedAction.type + (timestamp ? formattedTime : "") + (duration ? " in " + took.toFixed(2) + " ms" : "");

      // render
      try {
        if (isCollapsed) {
          if (colors.title) logger.groupCollapsed("%c " + title, titleCSS);else logger.groupCollapsed(title);
        } else {
          if (colors.title) logger.group("%c " + title, titleCSS);else logger.group(title);
        }
      } catch (e) {
        logger.log(title);
      }

      if (colors.prevState) logger[level]("%c prev state", "color: " + colors.prevState(prevState) + "; font-weight: bold", prevState);else logger[level]("prev state", prevState);

      if (colors.action) logger[level]("%c action", "color: " + colors.action(formattedAction) + "; font-weight: bold", formattedAction);else logger[level]("action", formattedAction);

      if (error) {
        if (colors.error) logger[level]("%c error", "color: " + colors.error(error, prevState) + "; font-weight: bold", error);else logger[level]("error", error);
      }

      if (colors.nextState) logger[level]("%c next state", "color: " + colors.nextState(nextState) + "; font-weight: bold", nextState);else logger[level]("next state", nextState);

      try {
        logger.groupEnd();
      } catch (e) {
        logger.log("—— log end ——");
      }
    });
    logBuffer.length = 0;
  }

  return function (_ref) {
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        // exit early if predicate function returns false
        if (typeof predicate === "function" && !predicate(getState, action)) {
          return next(action);
        }

        var logEntry = {};
        logBuffer.push(logEntry);

        logEntry.started = timer.now();
        logEntry.prevState = stateTransformer(getState());
        logEntry.action = action;

        var returnedValue = undefined;
        if (logErrors) {
          try {
            returnedValue = next(action);
          } catch (e) {
            logEntry.error = errorTransformer(e);
          }
        } else {
          returnedValue = next(action);
        }

        logEntry.took = timer.now() - logEntry.started;
        logEntry.nextState = stateTransformer(getState());

        printBuffer();

        if (logEntry.error) throw logEntry.error;
        return returnedValue;
      };
    };
  };
}

module.exports = createLogger;
},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2h1dGNoaW5zb24vRG9jdW1lbnRzL1NpdGVzLzQvYXNzZXQtYWRtaW4vamF2YXNjcmlwdC9zcmMvYmFja2VuZC9maWxlLWJhY2tlbmQuanMiLCIvVXNlcnMvc2h1dGNoaW5zb24vRG9jdW1lbnRzL1NpdGVzLzQvYXNzZXQtYWRtaW4vamF2YXNjcmlwdC9zcmMvYm9vdC9pbmRleC5qcyIsIi9Vc2Vycy9zaHV0Y2hpbnNvbi9Eb2N1bWVudHMvU2l0ZXMvNC9hc3NldC1hZG1pbi9qYXZhc2NyaXB0L3NyYy9jb21wb25lbnRzL2J1bGstYWN0aW9ucy9pbmRleC5qcyIsIi9Vc2Vycy9zaHV0Y2hpbnNvbi9Eb2N1bWVudHMvU2l0ZXMvNC9hc3NldC1hZG1pbi9qYXZhc2NyaXB0L3NyYy9jb21wb25lbnRzL2ZpbGUvaW5kZXguanMiLCIvVXNlcnMvc2h1dGNoaW5zb24vRG9jdW1lbnRzL1NpdGVzLzQvYXNzZXQtYWRtaW4vamF2YXNjcmlwdC9zcmMvY29tcG9uZW50cy90ZXh0LWZpZWxkL2luZGV4LmpzIiwiL1VzZXJzL3NodXRjaGluc29uL0RvY3VtZW50cy9TaXRlcy80L2Fzc2V0LWFkbWluL2phdmFzY3JpcHQvc3JjL2NvbnN0YW50cy5qcyIsIi9Vc2Vycy9zaHV0Y2hpbnNvbi9Eb2N1bWVudHMvU2l0ZXMvNC9hc3NldC1hZG1pbi9qYXZhc2NyaXB0L3NyYy9zZWN0aW9ucy9lZGl0b3IvY29udHJvbGxlci5qcyIsIi9Vc2Vycy9zaHV0Y2hpbnNvbi9Eb2N1bWVudHMvU2l0ZXMvNC9hc3NldC1hZG1pbi9qYXZhc2NyaXB0L3NyYy9zZWN0aW9ucy9nYWxsZXJ5L2NvbnRyb2xsZXIuanMiLCIvVXNlcnMvc2h1dGNoaW5zb24vRG9jdW1lbnRzL1NpdGVzLzQvYXNzZXQtYWRtaW4vamF2YXNjcmlwdC9zcmMvc3RhdGUvYWN0aW9uLXR5cGVzLmpzIiwiL1VzZXJzL3NodXRjaGluc29uL0RvY3VtZW50cy9TaXRlcy80L2Fzc2V0LWFkbWluL2phdmFzY3JpcHQvc3JjL3N0YXRlL2NvbmZpZ3VyZVN0b3JlLmpzIiwiL1VzZXJzL3NodXRjaGluc29uL0RvY3VtZW50cy9TaXRlcy80L2Fzc2V0LWFkbWluL2phdmFzY3JpcHQvc3JjL3N0YXRlL2dhbGxlcnkvYWN0aW9ucy5qcyIsIi9Vc2Vycy9zaHV0Y2hpbnNvbi9Eb2N1bWVudHMvU2l0ZXMvNC9hc3NldC1hZG1pbi9qYXZhc2NyaXB0L3NyYy9zdGF0ZS9nYWxsZXJ5L3JlZHVjZXIuanMiLCIvVXNlcnMvc2h1dGNoaW5zb24vRG9jdW1lbnRzL1NpdGVzLzQvYXNzZXQtYWRtaW4vamF2YXNjcmlwdC9zcmMvc3RhdGUvcmVkdWNlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZnJlZXplL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4LWxvZ2dlci9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQ0FjLFFBQVE7Ozs7c0JBQ0gsUUFBUTs7OztJQUVOLFdBQVc7V0FBWCxXQUFXOztBQUVwQixVQUZTLFdBQVcsQ0FFbkIsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRTt3QkFGbkYsV0FBVzs7QUFHOUIsNkJBSG1CLFdBQVcsNkNBR3RCOztBQUVSLE1BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLE1BQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzdCLE1BQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzdCLE1BQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzdCLE1BQUksQ0FBQyxLQUFLLEdBQUcsS0FB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QUFXLEdBQUcsNEJBQWdCO0FBQ2hDLFlBQVUsRUFBRSw0QkFBZ0I7QUFDeEIsV0FBTywrQkFBZ0I7R0FDMUIsQ0FBQztDQUNMLENBQUMsQ0FBQzs7cUJBRVksV0FBVzs7OztBQ3JCMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgJCBmcm9tICdqUXVlcnknO1xuaW1wb3J0IEV2ZW50cyBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWxlQmFja2VuZCBleHRlbmRzIEV2ZW50cyB7XG5cblx0Y29uc3RydWN0b3IoZmV0Y2hfdXJsLCBzZWFyY2hfdXJsLCB1cGRhdGVfdXJsLCBkZWxldGVfdXJsLCBsaW1pdCwgYnVsa0FjdGlvbnMsICRmb2xkZXIsIGN1cnJlbnRGb2xkZXIpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5mZXRjaF91cmwgPSBmZXRjaF91cmw7XG5cdFx0dGhpcy5zZWFyY2hfdXJsID0gc2VhcmNoX3VybDtcblx0XHR0aGlzLnVwZGF0ZV91cmwgPSB1cGRhdGVfdXJsO1xuXHRcdHRoaXMuZGVsZXRlX3VybCA9IGRlbGV0ZV91cmw7XG5cdFx0dGhpcy5saW1pdCA9IGxpbWl0O1xuXHRcdHRoaXMuYnVsa0FjdGlvbnMgPSBidWxrQWN0aW9ucztcblx0XHR0aGlzLiRmb2xkZXIgPSAkZm9sZGVyO1xuXHRcdHRoaXMuZm9sZGVyID0gY3VycmVudEZvbGRlcjtcblxuXHRcdHRoaXMucGFnZSA9IDE7XG5cdH1cblxuXHQvKipcblx0ICogQGZ1bmMgZmV0Y2hcblx0ICogQHBhcmFtIG51bWJlciBpZFxuXHQgKiBAZGVzYyBGZXRjaGVzIGEgY29sbGVjdGlvbiBvZiBGaWxlcyBieSBQYXJlbnRJRC5cblx0ICovXG5cdGZldGNoKGlkKSB7XG5cdFx0aWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnBhZ2UgPSAxO1xuXG5cdFx0dGhpcy5yZXF1ZXN0KCdQT1NUJywgdGhpcy5mZXRjaF91cmwsIHsgaWQ6IGlkIH0pLnRoZW4oKGpzb24pID0+IHtcblx0XHRcdHRoaXMuZW1pdCgnb25GZXRjaERhdGEnLCBqc29uKTtcblx0XHR9KTtcblx0fVxuXG5cdHNlYXJjaCgpIHtcblx0XHR0aGlzLnBhZ2UgPSAxO1xuXG5cdFx0dGhpcy5yZXF1ZXN0KCdHRVQnLCB0aGlzLnNlYXJjaF91cmwpLnRoZW4oKGpzb24pID0+IHtcblx0XHRcdHRoaXMuZW1pdCgnb25TZWFyY2hEYXRhJywganNvbik7XG5cdFx0fSk7XG5cdH1cblxuXHRtb3JlKCkge1xuXHRcdHRoaXMucGFnZSsrO1xuXG5cdFx0dGhpcy5yZXF1ZXN0KCdHRVQnLCB0aGlzLnNlYXJjaF91cmwpLnRoZW4oKGpzb24pID0+IHtcblx0XHRcdHRoaXMuZW1pdCgnb25Nb3JlRGF0YScsIGpzb24pO1xuXHRcdH0pO1xuXHR9XG5cblx0bmF2aWdhdGUoZm9sZGVyKSB7XG5cdFx0dGhpcy5wYWdlID0gMTtcblx0XHR0aGlzLmZvbGRlciA9IGZvbGRlcjtcblxuXHRcdHRoaXMucGVyc2lzdEZvbGRlckZpbHRlcihmb2xkZXIpO1xuXG5cdFx0dGhpcy5yZXF1ZXN0KCdHRVQnLCB0aGlzLnNlYXJjaF91cmwpLnRoZW4oKGpzb24pID0+IHtcblx0XHRcdHRoaXMuZW1pdCgnb25OYXZpZ2F0ZURhdGEnLCBqc29uKTtcblx0XHR9KTtcblx0fVxuXG5cdHBlcnNpc3RGb2xkZXJGaWx0ZXIoZm9sZGVyKSB7XG5cdFx0aWYgKGZvbGRlci5zdWJzdHIoLTEpID09PSAnLycpIHtcblx0XHRcdGZvbGRlciA9IGZvbGRlci5zdWJzdHIoMCwgZm9sZGVyLmxlbmd0aCAtIDEpO1xuXHRcdH1cblxuXHRcdHRoaXMuJGZvbGRlci52YWwoZm9sZGVyKTtcblx0fVxuXG5cdGRlbGV0ZShpZHMpIHtcblx0XHR2YXIgZmlsZXNUb0RlbGV0ZSA9IFtdO1xuXG5cdFx0Ly8gQWxsb3dzIHVzZXJzIHRvIHBhc3Mgb25lIG9yIG1vcmUgaWRzIHRvIGRlbGV0ZS5cblx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGlkcykgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcblx0XHRcdGZpbGVzVG9EZWxldGUucHVzaChpZHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWxlc1RvRGVsZXRlID0gaWRzO1xuXHRcdH1cblxuXHRcdHRoaXMucmVxdWVzdCgnR0VUJywgdGhpcy5kZWxldGVfdXJsLCB7XG5cdFx0XHQnaWRzJzogZmlsZXNUb0RlbGV0ZVxuXHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0Ly8gVXNpbmcgZm9yIGxvb3AgYmVjYXVzZSBJRTEwIGRvZXNuJ3QgaGFuZGxlICdmb3Igb2YnLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyB0cmFuc2NvbXBpbGVkIGludG8gYSBmdW5jdGlvbiB3aGljaCB1c2VzIFN5bWJvbCxcblx0XHRcdC8vIHRoZSB0aGluZyBJRTEwIGRpZXMgb24uXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVzVG9EZWxldGUubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0dGhpcy5lbWl0KCdvbkRlbGV0ZURhdGEnLCBmaWxlc1RvRGVsZXRlW2ldKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGZpbHRlcihuYW1lLCB0eXBlLCBmb2xkZXIsIGNyZWF0ZWRGcm9tLCBjcmVhdGVkVG8sIG9ubHlTZWFyY2hJbkZvbGRlcikge1xuXHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cdFx0dGhpcy50eXBlID0gdHlwZTtcblx0XHR0aGlzLmZvbGRlciA9IGZvbGRlcjtcblx0XHR0aGlzLmNyZWF0ZWRGcm9tID0gY3JlYXRlZEZyb207XG5cdFx0dGhpcy5jcmVhdGVkVG8gPSBjcmVhdGVkVG87XG5cdFx0dGhpcy5vbmx5U2VhcmNoSW5Gb2xkZXIgPSBvbmx5U2VhcmNoSW5Gb2xkZXI7XG5cblx0XHR0aGlzLnNlYXJjaCgpO1xuXHR9XG5cblx0c2F2ZShpZCwgdmFsdWVzKSB7XG5cdFx0dmFyIHVwZGF0ZXMgPSB7IGlkIH07XG5cdFx0XG5cdFx0dmFsdWVzLmZvckVhY2goZmllbGQgPT4ge1xuXHRcdFx0dXBkYXRlc1tmaWVsZC5uYW1lXSA9IGZpZWxkLnZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5yZXF1ZXN0KCdQT1NUJywgdGhpcy51cGRhdGVfdXJsLCB1cGRhdGVzKS50aGVuKCgpID0+IHtcblx0XHRcdHRoaXMuZW1pdCgnb25TYXZlRGF0YScsIGlkLCB1cGRhdGVzKTtcblx0XHR9KTtcblx0fVxuXG5cdHJlcXVlc3QobWV0aG9kLCB1cmwsIGRhdGEgPSB7fSkge1xuXHRcdGxldCBkZWZhdWx0cyA9IHtcblx0XHRcdCdsaW1pdCc6IHRoaXMubGltaXQsXG5cdFx0XHQncGFnZSc6IHRoaXMucGFnZSxcblx0XHR9O1xuXG5cdFx0aWYgKHRoaXMubmFtZSAmJiB0aGlzLm5hbWUudHJpbSgpICE9PSAnJykge1xuXHRcdFx0ZGVmYXVsdHMubmFtZSA9IGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLm5hbWUpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLmZvbGRlciAmJiB0aGlzLmZvbGRlci50cmltKCkgIT09ICcnKSB7XG5cdFx0XHRkZWZhdWx0cy5mb2xkZXIgPSBkZWNvZGVVUklDb21wb25lbnQodGhpcy5mb2xkZXIpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLmNyZWF0ZWRGcm9tICYmIHRoaXMuY3JlYXRlZEZyb20udHJpbSgpICE9PSAnJykge1xuXHRcdFx0ZGVmYXVsdHMuY3JlYXRlZEZyb20gPSBkZWNvZGVVUklDb21wb25lbnQodGhpcy5jcmVhdGVkRnJvbSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuY3JlYXRlZFRvICYmIHRoaXMuY3JlYXRlZFRvLnRyaW0oKSAhPT0gJycpIHtcblx0XHRcdGRlZmF1bHRzLmNyZWF0ZWRUbyA9IGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLmNyZWF0ZWRUbyk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMub25seVNlYXJjaEluRm9sZGVyICYmIHRoaXMub25seVNlYXJjaEluRm9sZGVyLnRyaW0oKSAhPT0gJycpIHtcblx0XHRcdGRlZmF1bHRzLm9ubHlTZWFyY2hJbkZvbGRlciA9IGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLm9ubHlTZWFyY2hJbkZvbGRlcik7XG5cdFx0fVxuXG5cdFx0dGhpcy5zaG93TG9hZGluZ0luZGljYXRvcigpO1xuXG5cdFx0cmV0dXJuICQuYWpheCh7XG5cdFx0XHQndXJsJzogdXJsLFxuXHRcdFx0J21ldGhvZCc6IG1ldGhvZCxcblx0XHRcdCdkYXRhVHlwZSc6ICdqc29uJyxcblx0XHRcdCdkYXRhJzogJC5leHRlbmQoZGVmYXVsdHMsIGRhdGEpXG5cdFx0fSkuYWx3YXlzKCgpID0+IHtcblx0XHRcdHRoaXMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKTtcblx0XHR9KTtcblx0fVxuXG5cdHNob3dMb2FkaW5nSW5kaWNhdG9yKCkge1xuXHRcdCQoJy5jbXMtY29udGVudCwgLnVpLWRpYWxvZycpLmFkZENsYXNzKCdsb2FkaW5nJyk7XG5cdFx0JCgnLnVpLWRpYWxvZy1jb250ZW50JykuY3NzKCdvcGFjaXR5JywgJy4xJyk7XG5cdH1cblxuXHRoaWRlTG9hZGluZ0luZGljYXRvcigpIHtcblx0XHQkKCcuY21zLWNvbnRlbnQsIC51aS1kaWFsb2cnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuXHRcdCQoJy51aS1kaWFsb2ctY29udGVudCcpLmNzcygnb3BhY2l0eScsICcxJyk7XG5cdH1cbn1cbiIsImltcG9ydCAkIGZyb20gJ2pRdWVyeSc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCBjb25maWd1cmVTdG9yZSBmcm9tICcuLi9zdGF0ZS9jb25maWd1cmVTdG9yZSc7XG5pbXBvcnQgR2FsbGVyeUNvbnRhaW5lciBmcm9tICcuLi9zZWN0aW9ucy9nYWxsZXJ5L2NvbnRyb2xsZXInO1xuaW1wb3J0IEZpbGVCYWNrZW5kIGZyb20gJy4uL2JhY2tlbmQvZmlsZS1iYWNrZW5kJztcblxuZnVuY3Rpb24gZ2V0VmFyKG5hbWUpIHtcblx0dmFyIHBhcnRzID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJz8nKTtcblxuXHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdHBhcnRzID0gcGFydHNbMV0uc3BsaXQoJyMnKTtcblx0fVxuXG5cdGxldCB2YXJpYWJsZXMgPSBwYXJ0c1swXS5zcGxpdCgnJicpO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdmFyaWFibGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0bGV0IHBhcnRzID0gdmFyaWFibGVzW2ldLnNwbGl0KCc9Jyk7XG5cblx0XHRpZiAoZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKSA9PT0gbmFtZSkge1xuXHRcdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGhhc1Nlc3Npb25TdG9yYWdlKCkge1xuXHRyZXR1cm4gdHlwZW9mIHdpbmRvdy5zZXNzaW9uU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnNlc3Npb25TdG9yYWdlICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBnZXRQcm9wcyhwcm9wcykge1xuXHR2YXIgJGNvbXBvbmVudFdyYXBwZXIgPSAkKCcuYXNzZXQtZ2FsbGVyeScpLmZpbmQoJy5hc3NldC1nYWxsZXJ5LWNvbXBvbmVudC13cmFwcGVyJyksXG5cdFx0JHNlYXJjaCA9ICQoJy5jbXMtc2VhcmNoLWZvcm0nKSxcblx0XHRpbml0aWFsRm9sZGVyID0gJCgnLmFzc2V0LWdhbGxlcnknKS5kYXRhKCdhc3NldC1nYWxsZXJ5LWluaXRpYWwtZm9sZGVyJyksXG5cdFx0Y3VycmVudEZvbGRlciA9IGdldFZhcigncVtGb2xkZXJdJykgfHwgaW5pdGlhbEZvbGRlcixcblx0XHRiYWNrZW5kLFxuXHRcdGRlZmF1bHRzO1xuXG5cdGlmICgkc2VhcmNoLmZpbmQoJ1t0eXBlPWhpZGRlbl1bbmFtZT1cInFbRm9sZGVyXVwiXScpLmxlbmd0aCA9PSAwKSB7XG5cdFx0JHNlYXJjaC5hcHBlbmQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInFbRm9sZGVyXVwiIC8+Jyk7XG5cdH1cblxuXHQvLyBEbyB3ZSBuZWVkIHRvIHNldCB1cCBhIGRlZmF1bHQgYmFja2VuZD9cblx0aWYgKHR5cGVvZiBwcm9wcyA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHByb3BzLmJhY2tlbmQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0YmFja2VuZCA9IG5ldyBGaWxlQmFja2VuZChcblx0XHRcdCRjb21wb25lbnRXcmFwcGVyLmRhdGEoJ2Fzc2V0LWdhbGxlcnktZmV0Y2gtdXJsJyksXG5cdFx0XHQkY29tcG9uZW50V3JhcHBlci5kYXRhKCdhc3NldC1nYWxsZXJ5LXNlYXJjaC11cmwnKSxcblx0XHRcdCRjb21wb25lbnRXcmFwcGVyLmRhdGEoJ2Fzc2V0LWdhbGxlcnktdXBkYXRlLXVybCcpLFxuXHRcdFx0JGNvbXBvbmVudFdyYXBwZXIuZGF0YSgnYXNzZXQtZ2FsbGVyeS1kZWxldGUtdXJsJyksXG5cdFx0XHQkY29tcG9uZW50V3JhcHBlci5kYXRhKCdhc3NldC1nYWxsZXJ5LWxpbWl0JyksXG5cdFx0XHQkY29tcG9uZW50V3JhcHBlci5kYXRhKCdhc3NldC1nYWxsZXJ5LWJ1bGstYWN0aW9ucycpLFxuXHRcdFx0JHNlYXJjaC5maW5kKCdbdHlwZT1oaWRkZW5dW25hbWU9XCJxW0ZvbGRlcl1cIl0nKSxcblx0XHRcdGN1cnJlbnRGb2xkZXJcblx0XHQpO1xuXG5cdFx0YmFja2VuZC5lbWl0KFxuXHRcdFx0J2ZpbHRlcicsXG5cdFx0XHRnZXRWYXIoJ3FbTmFtZV0nKSxcblx0XHRcdGdldFZhcigncVtBcHBDYXRlZ29yeV0nKSxcblx0XHRcdGdldFZhcigncVtGb2xkZXJdJyksXG5cdFx0XHRnZXRWYXIoJ3FbQ3JlYXRlZEZyb21dJyksXG5cdFx0XHRnZXRWYXIoJ3FbQ3JlYXRlZFRvXScpLFxuXHRcdFx0Z2V0VmFyKCdxW0N1cnJlbnRGb2xkZXJPbmx5XScpXG5cdFx0KTtcblx0fVxuXG5cdGRlZmF1bHRzID0ge1xuXHRcdGJhY2tlbmQ6IGJhY2tlbmQsXG5cdFx0Y3VycmVudF9mb2xkZXI6IGN1cnJlbnRGb2xkZXIsXG5cdFx0Y21zRXZlbnRzOiB7fSxcblx0XHRpbml0aWFsX2ZvbGRlcjogaW5pdGlhbEZvbGRlcixcblx0XHRuYW1lOiAkKCcuYXNzZXQtZ2FsbGVyeScpLmRhdGEoJ2Fzc2V0LWdhbGxlcnktbmFtZScpXG5cdH07XG5cblx0cmV0dXJuICQuZXh0ZW5kKHRydWUsIGRlZmF1bHRzLCBwcm9wcyk7XG59XG5cbmxldCBwcm9wcyA9IGdldFByb3BzKCk7XG5jb25zdCBzdG9yZSA9IGNvbmZpZ3VyZVN0b3JlKCk7IC8vQ3JlYXRlIHRoZSByZWR1eCBzdG9yZVxuXG5cblJlYWN0RE9NLnJlbmRlcihcbiAgICA8UHJvdmlkZXIgc3RvcmU9e3N0b3JlfT5cbiAgICAgICAgPEdhbGxlcnlDb250YWluZXIgey4uLnByb3BzfSAvPlxuICAgIDwvUHJvdmlkZXI+LFxuICAgICQoJy5hc3NldC1nYWxsZXJ5LWNvbXBvbmVudC13cmFwcGVyJylbMF1cbik7XG4iLCJpbXBvcnQgJCBmcm9tICdqUXVlcnknO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IFNpbHZlclN0cmlwZUNvbXBvbmVudCBmcm9tICdzaWx2ZXJzdHJpcGUtY29tcG9uZW50JztcbmltcG9ydCBSZWFjdFRlc3RVdGlscyBmcm9tICdyZWFjdC1hZGRvbnMtdGVzdC11dGlscyc7XG5pbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgYmluZEFjdGlvbkNyZWF0b3JzIH0gZnJvbSAncmVkdXgnO1xuaW1wb3J0ICogYXMgZ2FsbGVyeUFjdGlvbnMgZnJvbSAnLi4vLi4vc3RhdGUvZ2FsbGVyeS9hY3Rpb25zJztcbmltcG9ydCBpMThuIGZyb20gJ2kxOG4nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCdWxrQWN0aW9uc0NvbXBvbmVudCBleHRlbmRzIFNpbHZlclN0cmlwZUNvbXBvbmVudCB7XG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLm9uQ2hhbmdlVmFsdWUgPSB0aGlzLm9uQ2hhbmdlVmFsdWUuYmluZCh0aGlzKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHZhciAkc2VsZWN0ID0gJChSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKSkuZmluZCgnLmRyb3Bkb3duJyk7XG5cblx0XHQkc2VsZWN0LmNob3Nlbih7XG5cdFx0XHQnYWxsb3dfc2luZ2xlX2Rlc2VsZWN0JzogdHJ1ZSxcblx0XHRcdCdkaXNhYmxlX3NlYXJjaF90aHJlc2hvbGQnOiAyMFxuXHRcdH0pO1xuXG5cdFx0Ly8gQ2hvc2VuIHN0b3BzIHRoZSBjaGFuZ2UgZXZlbnQgZnJvbSByZWFjaGluZyBSZWFjdCBzbyB3ZSBoYXZlIHRvIHNpbXVsYXRlIGEgY2xpY2suXG5cdFx0JHNlbGVjdC5jaGFuZ2UoKCkgPT4gUmVhY3RUZXN0VXRpbHMuU2ltdWxhdGUuY2xpY2soJHNlbGVjdC5maW5kKCc6c2VsZWN0ZWQnKVswXSkpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cImdhbGxlcnlfX2J1bGstYWN0aW9ucyBmaWVsZGhvbGRlci1zbWFsbFwiPlxuXHRcdFx0PHNlbGVjdCBjbGFzc05hbWU9XCJkcm9wZG93biBuby1jaGFuZ2UtdHJhY2sgbm8tY2h6blwiIHRhYkluZGV4PVwiMFwiIGRhdGEtcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMuZ2FsbGVyeS5idWxrQWN0aW9ucy5wbGFjZWhvbGRlcn0gc3R5bGU9e3t3aWR0aDogJzE2MHB4J319PlxuXHRcdFx0XHQ8b3B0aW9uIHNlbGVjdGVkIGRpc2FibGVkIGhpZGRlbiB2YWx1ZT0nJz48L29wdGlvbj5cblx0XHRcdFx0e3RoaXMucHJvcHMuZ2FsbGVyeS5idWxrQWN0aW9ucy5vcHRpb25zLm1hcCgob3B0aW9uLCBpKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIDxvcHRpb24ga2V5PXtpfSBvbkNsaWNrPXt0aGlzLm9uQ2hhbmdlVmFsdWV9IHZhbHVlPXtvcHRpb24udmFsdWV9PntvcHRpb24ubGFiZWx9PC9vcHRpb24+O1xuXHRcdFx0XHR9KX1cblx0XHRcdDwvc2VsZWN0PlxuXHRcdDwvZGl2Pjtcblx0fVxuXG5cdGdldE9wdGlvbkJ5VmFsdWUodmFsdWUpIHtcblx0XHQvLyBVc2luZyBmb3IgbG9vcCBiZWNhdXNlIElFMTAgZG9lc24ndCBoYW5kbGUgJ2ZvciBvZicsXG5cdFx0Ly8gd2hpY2ggZ2V0cyB0cmFuc2NvbXBpbGVkIGludG8gYSBmdW5jdGlvbiB3aGljaCB1c2VzIFN5bWJvbCxcblx0XHQvLyB0aGUgdGhpbmcgSUUxMCBkaWVzIG9uLlxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wcm9wcy5nYWxsZXJ5LmJ1bGtBY3Rpb25zLm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdGlmICh0aGlzLnByb3BzLmdhbGxlcnkuYnVsa0FjdGlvbnMub3B0aW9uc1tpXS52YWx1ZSA9PT0gdmFsdWUpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucHJvcHMuZ2FsbGVyeS5idWxrQWN0aW9ucy5vcHRpb25zW2ldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG4gICAgXG4gICAgZ2V0U2VsZWN0ZWRGaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZ2FsbGVyeS5zZWxlY3RlZEZpbGVzO1xuICAgIH1cblxuXHRhcHBseUFjdGlvbih2YWx1ZSkge1xuXHRcdC8vIFdlIG9ubHkgaGF2ZSAnZGVsZXRlJyByaWdodCBub3cuLi5cblx0XHRzd2l0Y2ggKHZhbHVlKSB7XG5cdFx0XHRjYXNlICdkZWxldGUnOlxuXHRcdFx0XHR0aGlzLnByb3BzLmJhY2tlbmQuZGVsZXRlKHRoaXMuZ2V0U2VsZWN0ZWRGaWxlcygpKTtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRvbkNoYW5nZVZhbHVlKGV2ZW50KSB7XG5cdFx0dmFyIG9wdGlvbiA9IHRoaXMuZ2V0T3B0aW9uQnlWYWx1ZShldmVudC50YXJnZXQudmFsdWUpO1xuXG5cdFx0Ly8gTWFrZSBzdXJlIGEgdmFsaWQgb3B0aW9uIGhhcyBiZWVuIHNlbGVjdGVkLlxuXHRcdGlmIChvcHRpb24gPT09IG51bGwpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9uLmRlc3RydWN0aXZlID09PSB0cnVlKSB7XG5cdFx0XHRpZiAoY29uZmlybShpMThuLnNwcmludGYoaTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuQlVMS19BQ1RJT05TX0NPTkZJUk0nKSwgb3B0aW9uLmxhYmVsKSkpIHtcblx0XHRcdFx0dGhpcy5hcHBseUFjdGlvbihvcHRpb24udmFsdWUpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmFwcGx5QWN0aW9uKG9wdGlvbi52YWx1ZSk7XG5cdFx0fVxuXG5cdFx0Ly8gUmVzZXQgdGhlIGRyb3Bkb3duIHRvIGl0J3MgcGxhY2Vob2xkZXIgdmFsdWUuXG5cdFx0JChSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKSkuZmluZCgnLmRyb3Bkb3duJykudmFsKCcnKS50cmlnZ2VyKCdsaXN6dDp1cGRhdGVkJyk7XG5cdH1cbn07XG5cbmZ1bmN0aW9uIG1hcFN0YXRlVG9Qcm9wcyhzdGF0ZSkge1xuXHRyZXR1cm4ge1xuXHRcdGdhbGxlcnk6IHN0YXRlLmFzc2V0QWRtaW4uZ2FsbGVyeVxuXHR9XG59XG5cbmZ1bmN0aW9uIG1hcERpc3BhdGNoVG9Qcm9wcyhkaXNwYXRjaCkge1xuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnM6IGJpbmRBY3Rpb25DcmVhdG9ycyhnYWxsZXJ5QWN0aW9ucywgZGlzcGF0Y2gpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoQnVsa0FjdGlvbnNDb21wb25lbnQpO1xuIiwiaW1wb3J0ICQgZnJvbSAnalF1ZXJ5JztcbmltcG9ydCBpMThuIGZyb20gJ2kxOG4nO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7IGJpbmRBY3Rpb25DcmVhdG9ycyB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCAqIGFzIGdhbGxlcnlBY3Rpb25zIGZyb20gJy4uLy4uL3N0YXRlL2dhbGxlcnkvYWN0aW9ucyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgU2lsdmVyU3RyaXBlQ29tcG9uZW50IGZyb20gJ3NpbHZlcnN0cmlwZS1jb21wb25lbnQnO1xuXG5jbGFzcyBGaWxlQ29tcG9uZW50IGV4dGVuZHMgU2lsdmVyU3RyaXBlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5nZXRCdXR0b25UYWJJbmRleCA9IHRoaXMuZ2V0QnV0dG9uVGFiSW5kZXguYmluZCh0aGlzKTtcblx0XHR0aGlzLm9uRmlsZU5hdmlnYXRlID0gdGhpcy5vbkZpbGVOYXZpZ2F0ZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMub25GaWxlRWRpdCA9IHRoaXMub25GaWxlRWRpdC5iaW5kKHRoaXMpO1xuXHRcdHRoaXMub25GaWxlRGVsZXRlID0gdGhpcy5vbkZpbGVEZWxldGUuYmluZCh0aGlzKTtcblx0XHR0aGlzLmhhbmRsZURvdWJsZUNsaWNrID0gdGhpcy5oYW5kbGVEb3VibGVDbGljay5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuaGFuZGxlS2V5RG93biA9IHRoaXMuaGFuZGxlS2V5RG93bi5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuaGFuZGxlRm9jdXMgPSB0aGlzLmhhbmRsZUZvY3VzLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5oYW5kbGVCbHVyID0gdGhpcy5oYW5kbGVCbHVyLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5wcmV2ZW50Rm9jdXMgPSB0aGlzLnByZXZlbnRGb2N1cy5iaW5kKHRoaXMpO1xuXHRcdHRoaXMub25GaWxlU2VsZWN0ID0gdGhpcy5vbkZpbGVTZWxlY3QuYmluZCh0aGlzKTtcblx0fVxuXG5cdGhhbmRsZURvdWJsZUNsaWNrKGV2ZW50KSB7XG5cdFx0aWYgKGV2ZW50LnRhcmdldCAhPT0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzLnRpdGxlKSAmJiBldmVudC50YXJnZXQgIT09IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy50aHVtYm5haWwpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5vbkZpbGVOYXZpZ2F0ZShldmVudCk7XG5cdH1cblxuXHRvbkZpbGVOYXZpZ2F0ZShldmVudCkge1xuXHRcdGlmICh0aGlzLmlzRm9sZGVyKCkpIHtcblx0XHRcdHRoaXMucHJvcHMub25GaWxlTmF2aWdhdGUodGhpcy5wcm9wcywgZXZlbnQpXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5vbkZpbGVFZGl0KGV2ZW50KTtcblx0fVxuXG5cdG9uRmlsZVNlbGVjdChldmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3N0b3AgdHJpZ2dlcmluZyBjbGljayBvbiByb290IGVsZW1lbnRcblxuXHRcdGlmICh0aGlzLnByb3BzLmdhbGxlcnkuc2VsZWN0ZWRGaWxlcy5pbmRleE9mKHRoaXMucHJvcHMuaWQpID09PSAtMSkge1xuXHRcdFx0dGhpcy5wcm9wcy5hY3Rpb25zLnNlbGVjdEZpbGVzKHRoaXMucHJvcHMuaWQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnByb3BzLmFjdGlvbnMuZGVzZWxlY3RGaWxlcyh0aGlzLnByb3BzLmlkKTtcblx0XHR9XG5cdH1cblxuXHRvbkZpbGVFZGl0KGV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vc3RvcCB0cmlnZ2VyaW5nIGNsaWNrIG9uIHJvb3QgZWxlbWVudFxuXHRcdHRoaXMucHJvcHMuYWN0aW9ucy5zZXRFZGl0aW5nKHRoaXMucHJvcHMuZ2FsbGVyeS5maWxlcy5maW5kKGZpbGUgPT4gZmlsZS5pZCA9PT0gdGhpcy5wcm9wcy5pZCkpO1xuXHR9XG5cblx0b25GaWxlRGVsZXRlKGV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vc3RvcCB0cmlnZ2VyaW5nIGNsaWNrIG9uIHJvb3QgZWxlbWVudFxuXHRcdHRoaXMucHJvcHMub25GaWxlRGVsZXRlKHRoaXMucHJvcHMsIGV2ZW50KVxuXHR9XG5cblx0aXNGb2xkZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuY2F0ZWdvcnkgPT09ICdmb2xkZXInO1xuXHR9XG5cblx0Z2V0VGh1bWJuYWlsU3R5bGVzKCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmNhdGVnb3J5ID09PSAnaW1hZ2UnKSB7XG5cdFx0XHRyZXR1cm4geydiYWNrZ3JvdW5kSW1hZ2UnOiAndXJsKCcgKyB0aGlzLnByb3BzLnVybCArICcpJ307XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0Z2V0VGh1bWJuYWlsQ2xhc3NOYW1lcygpIHtcblx0XHR2YXIgdGh1bWJuYWlsQ2xhc3NOYW1lcyA9ICdpdGVtX190aHVtYm5haWwnO1xuXG5cdFx0aWYgKHRoaXMuaXNJbWFnZUxhcmdlclRoYW5UaHVtYm5haWwoKSkge1xuXHRcdFx0dGh1bWJuYWlsQ2xhc3NOYW1lcyArPSAnIGl0ZW1fX3RodW1ibmFpbC0tbGFyZ2UnO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aHVtYm5haWxDbGFzc05hbWVzO1xuXHR9XG5cdFxuXHRpc1NlbGVjdGVkKCkge1xuXHRcdHJldHVybiB0aGlzLnByb3BzLmdhbGxlcnkuc2VsZWN0ZWRGaWxlcy5pbmRleE9mKHRoaXMucHJvcHMuaWQpID4gLTE7XG5cdH1cbiAgICBcbiAgICBpc0ZvY3Vzc2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5nYWxsZXJ5LmZvY3VzID09PSB0aGlzLnByb3BzLmlkO1xuICAgIH1cbiAgICBcbiAgICBnZXRCdXR0b25UYWJJbmRleCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNGb2N1c3NlZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgIH1cblxuXHRnZXRJdGVtQ2xhc3NOYW1lcygpIHtcblx0XHR2YXIgaXRlbUNsYXNzTmFtZXMgPSAnaXRlbSBpdGVtLS0nICsgdGhpcy5wcm9wcy5jYXRlZ29yeTtcblxuXHRcdGlmICh0aGlzLmlzRm9jdXNzZWQoKSkge1xuXHRcdFx0aXRlbUNsYXNzTmFtZXMgKz0gJyBpdGVtLS1mb2N1c3NlZCc7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuaXNTZWxlY3RlZCgpKSB7XG5cdFx0XHRpdGVtQ2xhc3NOYW1lcyArPSAnIGl0ZW0tLXNlbGVjdGVkJztcblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbUNsYXNzTmFtZXM7XG5cdH1cblxuXHRpc0ltYWdlTGFyZ2VyVGhhblRodW1ibmFpbCgpIHtcblx0XHRsZXQgZGltZW5zaW9ucyA9IHRoaXMucHJvcHMuYXR0cmlidXRlcy5kaW1lbnNpb25zO1xuXG5cdFx0cmV0dXJuIGRpbWVuc2lvbnMuaGVpZ2h0ID4gY29uc3RhbnRzLlRIVU1CTkFJTF9IRUlHSFQgfHwgZGltZW5zaW9ucy53aWR0aCA+IGNvbnN0YW50cy5USFVNQk5BSUxfV0lEVEg7XG5cdH1cblxuXHRoYW5kbGVLZXlEb3duKGV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHQvL2lmIGV2ZW50IGRvZXNuJ3QgY29tZSBmcm9tIHRoZSByb290IGVsZW1lbnQsIGRvIG5vdGhpbmdcblx0XHRpZiAoZXZlbnQudGFyZ2V0ICE9PSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnMudGh1bWJuYWlsKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRcblx0XHQvL0lmIHNwYWNlIGlzIHByZXNzZWQsIGFsbG93IGZvY3VzIG9uIGJ1dHRvbnNcblx0XHRpZiAodGhpcy5wcm9wcy5zcGFjZUtleSA9PT0gZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy9TdG9wIHBhZ2UgZnJvbSBzY3JvbGxpbmdcblx0XHRcdCQoUmVhY3RET00uZmluZERPTU5vZGUodGhpcykpLmZpbmQoJy5pdGVtX19hY3Rpb25zX19hY3Rpb24nKS5maXJzdCgpLmZvY3VzKCk7XG5cdFx0fVxuXG5cdFx0Ly9JZiByZXR1cm4gaXMgcHJlc3NlZCwgbmF2aWdhdGUgZm9sZGVyXG5cdFx0aWYgKHRoaXMucHJvcHMucmV0dXJuS2V5ID09PSBldmVudC5rZXlDb2RlKSB7XG5cdFx0XHR0aGlzLm9uRmlsZU5hdmlnYXRlKGV2ZW50KTtcblx0XHR9XG5cdH1cblxuXHRoYW5kbGVGb2N1cygpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5hY3Rpb25zLnNldEZvY3VzKHRoaXMucHJvcHMuaWQpO1xuXHR9XG5cblx0aGFuZGxlQmx1cigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5hY3Rpb25zLnNldEZvY3VzKGZhbHNlKTtcblx0fVxuXHRcblx0cHJldmVudEZvY3VzKGV2ZW50KSB7XG5cdFx0Ly9UbyBhdm9pZCBicm93c2VyJ3MgZGVmYXVsdCBmb2N1cyBzdGF0ZSB3aGVuIHNlbGVjdGluZyBhbiBpdGVtXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gPGRpdiBjbGFzc05hbWU9e3RoaXMuZ2V0SXRlbUNsYXNzTmFtZXMoKX0gZGF0YS1pZD17dGhpcy5wcm9wcy5pZH0gb25Eb3VibGVDbGljaz17dGhpcy5oYW5kbGVEb3VibGVDbGlja30+XG5cdFx0XHQ8ZGl2IHJlZj1cInRodW1ibmFpbFwiIGNsYXNzTmFtZT17dGhpcy5nZXRUaHVtYm5haWxDbGFzc05hbWVzKCl9IHRhYkluZGV4PVwiMFwiIG9uS2V5RG93bj17dGhpcy5oYW5kbGVLZXlEb3dufSBzdHlsZT17dGhpcy5nZXRUaHVtYm5haWxTdHlsZXMoKX0gb25DbGljaz17dGhpcy5vbkZpbGVTZWxlY3R9IG9uTW91c2VEb3duPXt0aGlzLnByZXZlbnRGb2N1c30+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdpdGVtX19hY3Rpb25zJz5cblx0XHRcdFx0XHQ8YnV0dG9uXG5cdFx0XHRcdFx0XHRjbGFzc05hbWU9J2l0ZW1fX2FjdGlvbnNfX2FjdGlvbiBpdGVtX19hY3Rpb25zX19hY3Rpb24tLXNlbGVjdCBbIGZvbnQtaWNvbi10aWNrIF0nXG5cdFx0XHRcdFx0XHR0eXBlPSdidXR0b24nXG5cdFx0XHRcdFx0XHR0aXRsZT17aTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuU0VMRUNUJyl9XG5cdFx0XHRcdFx0XHR0YWJJbmRleD17dGhpcy5nZXRCdXR0b25UYWJJbmRleCgpfVxuXHRcdFx0XHRcdFx0b25DbGljaz17dGhpcy5vbkZpbGVTZWxlY3R9XG5cdFx0XHRcdFx0XHRvbkZvY3VzPXt0aGlzLmhhbmRsZUZvY3VzfVxuXHRcdFx0XHRcdFx0b25CbHVyPXt0aGlzLmhhbmRsZUJsdXJ9PlxuXHRcdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHRcdGNsYXNzTmFtZT0naXRlbV9fYWN0aW9uc19fYWN0aW9uIGl0ZW1fX2FjdGlvbnNfX2FjdGlvbi0tcmVtb3ZlIFsgZm9udC1pY29uLXRyYXNoIF0nXG5cdFx0XHRcdFx0XHR0eXBlPSdidXR0b24nXG5cdFx0XHRcdFx0XHR0aXRsZT17aTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuREVMRVRFJyl9XG5cdFx0XHRcdFx0XHR0YWJJbmRleD17dGhpcy5nZXRCdXR0b25UYWJJbmRleCgpfVxuXHRcdFx0XHRcdFx0b25DbGljaz17dGhpcy5vbkZpbGVEZWxldGV9XG5cdFx0XHRcdFx0XHRvbkZvY3VzPXt0aGlzLmhhbmRsZUZvY3VzfVxuXHRcdFx0XHRcdFx0b25CbHVyPXt0aGlzLmhhbmRsZUJsdXJ9PlxuXHRcdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHRcdGNsYXNzTmFtZT0naXRlbV9fYWN0aW9uc19fYWN0aW9uIGl0ZW1fX2FjdGlvbnNfX2FjdGlvbi0tZWRpdCBbIGZvbnQtaWNvbi1lZGl0IF0nXG5cdFx0XHRcdFx0XHR0eXBlPSdidXR0b24nXG5cdFx0XHRcdFx0XHR0aXRsZT17aTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuRURJVCcpfVxuXHRcdFx0XHRcdFx0dGFiSW5kZXg9e3RoaXMuZ2V0QnV0dG9uVGFiSW5kZXgoKX1cblx0XHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMub25GaWxlRWRpdH1cblx0XHRcdFx0XHRcdG9uRm9jdXM9e3RoaXMuaGFuZGxlRm9jdXN9XG5cdFx0XHRcdFx0XHRvbkJsdXI9e3RoaXMuaGFuZGxlQmx1cn0+XG5cdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0XHQ8cCBjbGFzc05hbWU9J2l0ZW1fX3RpdGxlJyByZWY9XCJ0aXRsZVwiPnt0aGlzLnByb3BzLnRpdGxlfTwvcD5cblx0XHQ8L2Rpdj47XG5cdH1cbn1cblxuRmlsZUNvbXBvbmVudC5wcm9wVHlwZXMgPSB7XG5cdGlkOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuXHR0aXRsZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0Y2F0ZWdvcnk6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdHVybDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0ZGltZW5zaW9uczogUmVhY3QuUHJvcFR5cGVzLnNoYXBlKHtcblx0XHR3aWR0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcblx0XHRoZWlnaHQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcblx0fSksXG5cdG9uRmlsZU5hdmlnYXRlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcblx0b25GaWxlRWRpdDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdG9uRmlsZURlbGV0ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdHNwYWNlS2V5OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuXHRyZXR1cm5LZXk6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG5cdG9uRmlsZVNlbGVjdDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdHNlbGVjdGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxufTtcblxuZnVuY3Rpb24gbWFwU3RhdGVUb1Byb3BzKHN0YXRlKSB7XG5cdHJldHVybiB7XG5cdFx0Z2FsbGVyeTogc3RhdGUuYXNzZXRBZG1pbi5nYWxsZXJ5XG5cdH1cbn1cblxuZnVuY3Rpb24gbWFwRGlzcGF0Y2hUb1Byb3BzKGRpc3BhdGNoKSB7XG5cdHJldHVybiB7XG5cdFx0YWN0aW9uczogYmluZEFjdGlvbkNyZWF0b3JzKGdhbGxlcnlBY3Rpb25zLCBkaXNwYXRjaClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShGaWxlQ29tcG9uZW50KTtcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgU2lsdmVyU3RyaXBlQ29tcG9uZW50IGZyb20gJ3NpbHZlcnN0cmlwZS1jb21wb25lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0RmllbGRDb21wb25lbnQgZXh0ZW5kcyBTaWx2ZXJTdHJpcGVDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLmhhbmRsZUNoYW5nZSA9IHRoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdmaWVsZCB0ZXh0Jz5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9J2xlZnQnIGh0bWxGb3I9eydnYWxsZXJ5XycgKyB0aGlzLnByb3BzLm5hbWV9Pnt0aGlzLnByb3BzLmxhYmVsfTwvbGFiZWw+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbWlkZGxlQ29sdW1uJz5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgaWQ9eydnYWxsZXJ5XycgKyB0aGlzLnByb3BzLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0ndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgdHlwZT0ndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgbmFtZT17dGhpcy5wcm9wcy5uYW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnZhbHVlfSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIH1cblxuICAgIGhhbmRsZUNoYW5nZShldmVudCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKCk7XG4gICAgfVxufVxuXG5UZXh0RmllbGRDb21wb25lbnQucHJvcFR5cGVzID0ge1xuICAgIGxhYmVsOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgbmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbn07XG4iLCJpbXBvcnQgaTE4biBmcm9tICdpMThuJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXHQnVEhVTUJOQUlMX0hFSUdIVCc6IDE1MCxcblx0J1RIVU1CTkFJTF9XSURUSCc6IDIwMCxcblx0J1NQQUNFX0tFWV9DT0RFJzogMzIsXG5cdCdSRVRVUk5fS0VZX0NPREUnOiAxMyxcblx0J0JVTEtfQUNUSU9OUyc6IFtcblx0XHR7XG5cdFx0XHR2YWx1ZTogJ2RlbGV0ZScsXG5cdFx0XHRsYWJlbDogaTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuQlVMS19BQ1RJT05TX0RFTEVURScpLFxuXHRcdFx0ZGVzdHJ1Y3RpdmU6IHRydWVcblx0XHR9XG5cdF0sXG4gICAgJ0JVTEtfQUNUSU9OU19QTEFDRUhPTERFUic6IGkxOG4uX3QoJ0Fzc2V0R2FsbGVyeUZpZWxkLkJVTEtfQUNUSU9OU19QTEFDRUhPTERFUicpXG59O1xuIiwiaW1wb3J0ICQgZnJvbSAnalF1ZXJ5JztcbmltcG9ydCBpMThuIGZyb20gJ2kxOG4nO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBTaWx2ZXJTdHJpcGVDb21wb25lbnQgZnJvbSAnc2lsdmVyc3RyaXBlLWNvbXBvbmVudCc7XG5pbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgYmluZEFjdGlvbkNyZWF0b3JzIH0gZnJvbSAncmVkdXgnO1xuaW1wb3J0ICogYXMgZ2FsbGVyeUFjdGlvbnMgZnJvbSAnLi4vLi4vc3RhdGUvZ2FsbGVyeS9hY3Rpb25zJztcbmltcG9ydCBUZXh0RmllbGRDb21wb25lbnQgZnJvbSAnLi4vLi4vY29tcG9uZW50cy90ZXh0LWZpZWxkL2luZGV4J1xuXG5jbGFzcyBFZGl0b3JDb250YWluZXIgZXh0ZW5kcyBTaWx2ZXJTdHJpcGVDb21wb25lbnQge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdHRoaXMuZmllbGRzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHQnbGFiZWwnOiAnVGl0bGUnLFxuXHRcdFx0XHQnbmFtZSc6ICd0aXRsZScsXG5cdFx0XHRcdCd2YWx1ZSc6IHRoaXMucHJvcHMuZmlsZS50aXRsZVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0J2xhYmVsJzogJ0ZpbGVuYW1lJyxcblx0XHRcdFx0J25hbWUnOiAnYmFzZW5hbWUnLFxuXHRcdFx0XHQndmFsdWUnOiB0aGlzLnByb3BzLmZpbGUuYmFzZW5hbWVcblx0XHRcdH1cblx0XHRdO1xuXG5cdFx0dGhpcy5vbkZpZWxkQ2hhbmdlID0gdGhpcy5vbkZpZWxkQ2hhbmdlLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5vbkZpbGVTYXZlID0gdGhpcy5vbkZpbGVTYXZlLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5vbkNhbmNlbCA9IHRoaXMub25DYW5jZWwuYmluZCh0aGlzKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KCk7XG5cblx0XHR0aGlzLnByb3BzLmFjdGlvbnMuc2V0RWRpdG9yRmllbGRzKHRoaXMuZmllbGRzKTtcblx0fVxuXHRcblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKTtcblx0XHRcblx0XHR0aGlzLnByb3BzLmFjdGlvbnMuc2V0RWRpdG9yRmllbGRzKCk7XG5cdH1cblxuXHRvbkZpZWxkQ2hhbmdlKGV2ZW50KSB7XG5cdFx0dGhpcy5wcm9wcy5hY3Rpb25zLnVwZGF0ZUVkaXRvckZpZWxkKHtcblx0XHRcdG5hbWU6IGV2ZW50LnRhcmdldC5uYW1lLFxuXHRcdFx0dmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuXHRcdH0pO1xuXHR9XG5cblx0b25GaWxlU2F2ZShldmVudCkge1xuXHRcdHRoaXMucHJvcHMub25GaWxlU2F2ZSh0aGlzLnByb3BzLmZpbGUuaWQsIHRoaXMucHJvcHMuZ2FsbGVyeS5lZGl0b3JGaWVsZHMsIGV2ZW50KTtcblx0fVxuXG5cdG9uQ2FuY2VsKGV2ZW50KSB7XG5cdFx0dGhpcy5wcm9wcy5hY3Rpb25zLnNldEVkaXRpbmcoZmFsc2UpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiA8ZGl2IGNsYXNzTmFtZT0nZWRpdG9yJz5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPSdDb21wb3NpdGVGaWVsZCBjb21wb3NpdGUgY21zLWZpbGUtaW5mbyBub2xhYmVsJz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J0NvbXBvc2l0ZUZpZWxkIGNvbXBvc2l0ZSBjbXMtZmlsZS1pbmZvLXByZXZpZXcgbm9sYWJlbCc+XG5cdFx0XHRcdFx0PGltZyBjbGFzc05hbWU9J3RodW1ibmFpbC1wcmV2aWV3JyBzcmM9e3RoaXMucHJvcHMuZmlsZS51cmx9IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nQ29tcG9zaXRlRmllbGQgY29tcG9zaXRlIGNtcy1maWxlLWluZm8tZGF0YSBub2xhYmVsJz5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nQ29tcG9zaXRlRmllbGQgY29tcG9zaXRlIG5vbGFiZWwnPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpZWxkIHJlYWRvbmx5Jz5cblx0XHRcdFx0XHRcdFx0PGxhYmVsIGNsYXNzTmFtZT0nbGVmdCc+e2kxOG4uX3QoJ0Fzc2V0R2FsbGVyeUZpZWxkLlRZUEUnKX06PC9sYWJlbD5cblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J21pZGRsZUNvbHVtbic+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdyZWFkb25seSc+e3RoaXMucHJvcHMuZmlsZS50eXBlfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmllbGQgcmVhZG9ubHknPlxuXHRcdFx0XHRcdFx0PGxhYmVsIGNsYXNzTmFtZT0nbGVmdCc+e2kxOG4uX3QoJ0Fzc2V0R2FsbGVyeUZpZWxkLlNJWkUnKX06PC9sYWJlbD5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdtaWRkbGVDb2x1bW4nPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J3JlYWRvbmx5Jz57dGhpcy5wcm9wcy5maWxlLnNpemV9PC9zcGFuPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J2ZpZWxkIHJlYWRvbmx5Jz5cblx0XHRcdFx0XHRcdDxsYWJlbCBjbGFzc05hbWU9J2xlZnQnPntpMThuLl90KCdBc3NldEdhbGxlcnlGaWVsZC5VUkwnKX06PC9sYWJlbD5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdtaWRkbGVDb2x1bW4nPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J3JlYWRvbmx5Jz5cblx0XHRcdFx0XHRcdFx0XHQ8YSBocmVmPXt0aGlzLnByb3BzLmZpbGUudXJsfSB0YXJnZXQ9J19ibGFuayc+e3RoaXMucHJvcHMuZmlsZS51cmx9PC9hPlxuXHRcdFx0XHRcdFx0XHQ8L3NwYW4+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmllbGQgZGF0ZV9kaXNhYmxlZCByZWFkb25seSc+XG5cdFx0XHRcdFx0XHQ8bGFiZWwgY2xhc3NOYW1lPSdsZWZ0Jz57aTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuQ1JFQVRFRCcpfTo8L2xhYmVsPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9J21pZGRsZUNvbHVtbic+XG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT0ncmVhZG9ubHknPnt0aGlzLnByb3BzLmZpbGUuY3JlYXRlZH08L3NwYW4+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZmllbGQgZGF0ZV9kaXNhYmxlZCByZWFkb25seSc+XG5cdFx0XHRcdFx0XHQ8bGFiZWwgY2xhc3NOYW1lPSdsZWZ0Jz57aTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuTEFTVEVESVQnKX06PC9sYWJlbD5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdtaWRkbGVDb2x1bW4nPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9J3JlYWRvbmx5Jz57dGhpcy5wcm9wcy5maWxlLmxhc3RVcGRhdGVkfTwvc3Bhbj5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPSdmaWVsZCByZWFkb25seSc+XG5cdFx0XHRcdFx0XHQ8bGFiZWwgY2xhc3NOYW1lPSdsZWZ0Jz57aTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuRElNJyl9OjwvbGFiZWw+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nbWlkZGxlQ29sdW1uJz5cblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPSdyZWFkb25seSc+e3RoaXMucHJvcHMuZmlsZS5hdHRyaWJ1dGVzLmRpbWVuc2lvbnMud2lkdGh9IHgge3RoaXMucHJvcHMuZmlsZS5hdHRyaWJ1dGVzLmRpbWVuc2lvbnMuaGVpZ2h0fXB4PC9zcGFuPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0XHR7dGhpcy5wcm9wcy5nYWxsZXJ5LmVkaXRvckZpZWxkcy5tYXAoKGZpZWxkLCBpKSA9PiB7XG5cdFx0XHRcdHJldHVybiA8VGV4dEZpZWxkQ29tcG9uZW50XG5cdFx0XHRcdFx0XHRrZXk9e2l9XG5cdFx0XHRcdFx0XHRsYWJlbD17ZmllbGQubGFiZWx9XG5cdFx0XHRcdFx0XHRuYW1lPXtmaWVsZC5uYW1lfVxuXHRcdFx0XHRcdFx0dmFsdWU9e2ZpZWxkLnZhbHVlfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9e3RoaXMub25GaWVsZENoYW5nZX0gLz5cblx0XHRcdH0pfVxuXHRcdFx0PGRpdj5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdHR5cGU9J3N1Ym1pdCdcblx0XHRcdFx0XHRjbGFzc05hbWU9XCJzcy11aS1idXR0b24gdWktYnV0dG9uIHVpLXdpZGdldCB1aS1zdGF0ZS1kZWZhdWx0IHVpLWNvcm5lci1hbGwgZm9udC1pY29uLWNoZWNrLW1hcmtcIlxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMub25GaWxlU2F2ZX0+XG5cdFx0XHRcdFx0e2kxOG4uX3QoJ0Fzc2V0R2FsbGVyeUZpZWxkLlNBVkUnKX1cblx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHR0eXBlPSdidXR0b24nXG5cdFx0XHRcdFx0Y2xhc3NOYW1lPVwic3MtdWktYnV0dG9uIHVpLWJ1dHRvbiB1aS13aWRnZXQgdWktc3RhdGUtZGVmYXVsdCB1aS1jb3JuZXItYWxsIGZvbnQtaWNvbi1jYW5jZWwtY2lyY2xlZFwiXG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy5vbkNhbmNlbH0+XG5cdFx0XHRcdFx0e2kxOG4uX3QoJ0Fzc2V0R2FsbGVyeUZpZWxkLkNBTkNFTCcpfVxuXHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2Pjtcblx0fVxufVxuXG5FZGl0b3JDb250YWluZXIucHJvcFR5cGVzID0ge1xuXHRmaWxlOiBSZWFjdC5Qcm9wVHlwZXMuc2hhcGUoe1xuXHRcdGlkOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuXHRcdHRpdGxlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdGJhc2VuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdHVybDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRzaXplOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdGNyZWF0ZWQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0bGFzdFVwZGF0ZWQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0ZGltZW5zaW9uczogUmVhY3QuUHJvcFR5cGVzLnNoYXBlKHtcblx0XHRcdHdpZHRoOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuXHRcdFx0aGVpZ2h0OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG5cdFx0fSlcblx0fSksXG5cdG9uRmlsZVNhdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuXHRvbkNhbmNlbDpSZWFjdC5Qcm9wVHlwZXMuZnVuY1xufTtcblxuZnVuY3Rpb24gbWFwU3RhdGVUb1Byb3BzKHN0YXRlKSB7XG5cdHJldHVybiB7XG5cdFx0Z2FsbGVyeTogc3RhdGUuYXNzZXRBZG1pbi5nYWxsZXJ5XG5cdH1cbn1cblxuZnVuY3Rpb24gbWFwRGlzcGF0Y2hUb1Byb3BzKGRpc3BhdGNoKSB7XG5cdHJldHVybiB7XG5cdFx0YWN0aW9uczogYmluZEFjdGlvbkNyZWF0b3JzKGdhbGxlcnlBY3Rpb25zLCBkaXNwYXRjaClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShFZGl0b3JDb250YWluZXIpO1xuIiwiaW1wb3J0ICQgZnJvbSAnalF1ZXJ5JztcbmltcG9ydCBpMThuIGZyb20gJ2kxOG4nO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7IGJpbmRBY3Rpb25DcmVhdG9ycyB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBSZWFjdFRlc3RVdGlscyBmcm9tICdyZWFjdC1hZGRvbnMtdGVzdC11dGlscyc7XG5pbXBvcnQgRmlsZUNvbXBvbmVudCBmcm9tICcuLi8uLi9jb21wb25lbnRzL2ZpbGUvaW5kZXgnO1xuaW1wb3J0IEVkaXRvckNvbnRhaW5lciBmcm9tICcuLi9lZGl0b3IvY29udHJvbGxlci5qcyc7XG5pbXBvcnQgQnVsa0FjdGlvbnNDb21wb25lbnQgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9idWxrLWFjdGlvbnMvaW5kZXgnO1xuaW1wb3J0IFNpbHZlclN0cmlwZUNvbXBvbmVudCBmcm9tICdzaWx2ZXJzdHJpcGUtY29tcG9uZW50JztcbmltcG9ydCBDT05TVEFOVFMgZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcbmltcG9ydCAqIGFzIGdhbGxlcnlBY3Rpb25zIGZyb20gJy4uLy4uL3N0YXRlL2dhbGxlcnkvYWN0aW9ucyc7XG5cbmZ1bmN0aW9uIGdldENvbXBhcmF0b3IoZmllbGQsIGRpcmVjdGlvbikge1xuXHRyZXR1cm4gKGEsIGIpID0+IHtcblx0XHRpZiAoZGlyZWN0aW9uID09PSAnYXNjJykge1xuXHRcdFx0aWYgKGFbZmllbGRdIDwgYltmaWVsZF0pIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVtmaWVsZF0gPiBiW2ZpZWxkXSkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKGFbZmllbGRdID4gYltmaWVsZF0pIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVtmaWVsZF0gPCBiW2ZpZWxkXSkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gMDtcblx0fTtcbn1cblxuZnVuY3Rpb24gZ2V0U29ydChmaWVsZCwgZGlyZWN0aW9uKSB7XG5cdGxldCBjb21wYXJhdG9yID0gZ2V0Q29tcGFyYXRvcihmaWVsZCwgZGlyZWN0aW9uKTtcblxuXHRyZXR1cm4gKCkgPT4ge1xuXHRcdGxldCBmb2xkZXJzID0gdGhpcy5wcm9wcy5nYWxsZXJ5LmZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUudHlwZSA9PT0gJ2ZvbGRlcicpO1xuXHRcdGxldCBmaWxlcyA9IHRoaXMucHJvcHMuZ2FsbGVyeS5maWxlcy5maWx0ZXIoZmlsZSA9PiBmaWxlLnR5cGUgIT09ICdmb2xkZXInKTtcblxuXHRcdHRoaXMucHJvcHMuYWN0aW9ucy5hZGRGaWxlKGZvbGRlcnMuc29ydChjb21wYXJhdG9yKS5jb25jYXQoZmlsZXMuc29ydChjb21wYXJhdG9yKSkpO1xuXHR9XG59XG5cbmNsYXNzIEdhbGxlcnlDb250YWluZXIgZXh0ZW5kcyBTaWx2ZXJTdHJpcGVDb21wb25lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXG5cdFx0dGhpcy5mb2xkZXJzID0gW3Byb3BzLmluaXRpYWxfZm9sZGVyXTtcblxuXHRcdHRoaXMuc29ydCA9ICduYW1lJztcblx0XHR0aGlzLmRpcmVjdGlvbiA9ICdhc2MnO1xuXG5cdFx0dGhpcy5zb3J0ZXJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHQnZmllbGQnOiAndGl0bGUnLFxuXHRcdFx0XHQnZGlyZWN0aW9uJzogJ2FzYycsXG5cdFx0XHRcdCdsYWJlbCc6IGkxOG4uX3QoJ0Fzc2V0R2FsbGVyeUZpZWxkLkZJTFRFUl9USVRMRV9BU0MnKSxcblx0XHRcdFx0J29uU29ydCc6IGdldFNvcnQuY2FsbCh0aGlzLCAndGl0bGUnLCAnYXNjJylcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdCdmaWVsZCc6ICd0aXRsZScsXG5cdFx0XHRcdCdkaXJlY3Rpb24nOiAnZGVzYycsXG5cdFx0XHRcdCdsYWJlbCc6IGkxOG4uX3QoJ0Fzc2V0R2FsbGVyeUZpZWxkLkZJTFRFUl9USVRMRV9ERVNDJyksXG5cdFx0XHRcdCdvblNvcnQnOiBnZXRTb3J0LmNhbGwodGhpcywgJ3RpdGxlJywgJ2Rlc2MnKVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0J2ZpZWxkJzogJ2NyZWF0ZWQnLFxuXHRcdFx0XHQnZGlyZWN0aW9uJzogJ2Rlc2MnLFxuXHRcdFx0XHQnbGFiZWwnOiBpMThuLl90KCdBc3NldEdhbGxlcnlGaWVsZC5GSUxURVJfREFURV9ERVNDJyksXG5cdFx0XHRcdCdvblNvcnQnOiBnZXRTb3J0LmNhbGwodGhpcywgJ2NyZWF0ZWQnLCAnZGVzYycpXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHQnZmllbGQnOiAnY3JlYXRlZCcsXG5cdFx0XHRcdCdkaXJlY3Rpb24nOiAnYXNjJyxcblx0XHRcdFx0J2xhYmVsJzogaTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuRklMVEVSX0RBVEVfQVNDJyksXG5cdFx0XHRcdCdvblNvcnQnOiBnZXRTb3J0LmNhbGwodGhpcywgJ2NyZWF0ZWQnLCAnYXNjJylcblx0XHRcdH1cblx0XHRdO1xuXG5cdFx0Ly8gQmFja2VuZCBldmVudCBsaXN0ZW5lcnNcblx0XHR0aGlzLm9uRmV0Y2hEYXRhID0gdGhpcy5vbkZldGNoRGF0YS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMub25TYXZlRGF0YSA9IHRoaXMub25TYXZlRGF0YS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMub25EZWxldGVEYXRhID0gdGhpcy5vbkRlbGV0ZURhdGEuYmluZCh0aGlzKTtcblx0XHR0aGlzLm9uTmF2aWdhdGVEYXRhID0gdGhpcy5vbk5hdmlnYXRlRGF0YS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMub25Nb3JlRGF0YSA9IHRoaXMub25Nb3JlRGF0YS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMub25TZWFyY2hEYXRhID0gdGhpcy5vblNlYXJjaERhdGEuYmluZCh0aGlzKTtcblxuXHRcdC8vIFVzZXIgZXZlbnQgbGlzdGVuZXJzXG5cdFx0dGhpcy5vbkZpbGVTYXZlID0gdGhpcy5vbkZpbGVTYXZlLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5vbkZpbGVOYXZpZ2F0ZSA9IHRoaXMub25GaWxlTmF2aWdhdGUuYmluZCh0aGlzKTtcblx0XHR0aGlzLm9uRmlsZURlbGV0ZSA9IHRoaXMub25GaWxlRGVsZXRlLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5vbkJhY2tDbGljayA9IHRoaXMub25CYWNrQ2xpY2suYmluZCh0aGlzKTtcblx0XHR0aGlzLm9uTW9yZUNsaWNrID0gdGhpcy5vbk1vcmVDbGljay5iaW5kKHRoaXMpO1xuXHRcdHRoaXMub25OYXZpZ2F0ZSA9IHRoaXMub25OYXZpZ2F0ZS5iaW5kKHRoaXMpO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKTtcblxuXHRcdGlmICh0aGlzLnByb3BzLmluaXRpYWxfZm9sZGVyICE9PSB0aGlzLnByb3BzLmN1cnJlbnRfZm9sZGVyKSB7XG5cdFx0XHR0aGlzLm9uTmF2aWdhdGUodGhpcy5wcm9wcy5jdXJyZW50X2ZvbGRlcik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucHJvcHMuYmFja2VuZC5zZWFyY2goKTtcblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLmJhY2tlbmQub24oJ29uRmV0Y2hEYXRhJywgdGhpcy5vbkZldGNoRGF0YSk7XG5cdFx0dGhpcy5wcm9wcy5iYWNrZW5kLm9uKCdvblNhdmVEYXRhJywgdGhpcy5vblNhdmVEYXRhKTtcblx0XHR0aGlzLnByb3BzLmJhY2tlbmQub24oJ29uRGVsZXRlRGF0YScsIHRoaXMub25EZWxldGVEYXRhKTtcblx0XHR0aGlzLnByb3BzLmJhY2tlbmQub24oJ29uTmF2aWdhdGVEYXRhJywgdGhpcy5vbk5hdmlnYXRlRGF0YSk7XG5cdFx0dGhpcy5wcm9wcy5iYWNrZW5kLm9uKCdvbk1vcmVEYXRhJywgdGhpcy5vbk1vcmVEYXRhKTtcblx0XHR0aGlzLnByb3BzLmJhY2tlbmQub24oJ29uU2VhcmNoRGF0YScsIHRoaXMub25TZWFyY2hEYXRhKTtcblx0fVxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG5cblx0XHR0aGlzLnByb3BzLmJhY2tlbmQucmVtb3ZlTGlzdGVuZXIoJ29uRmV0Y2hEYXRhJywgdGhpcy5vbkZldGNoRGF0YSk7XG5cdFx0dGhpcy5wcm9wcy5iYWNrZW5kLnJlbW92ZUxpc3RlbmVyKCdvblNhdmVEYXRhJywgdGhpcy5vblNhdmVEYXRhKTtcblx0XHR0aGlzLnByb3BzLmJhY2tlbmQucmVtb3ZlTGlzdGVuZXIoJ29uRGVsZXRlRGF0YScsIHRoaXMub25EZWxldGVEYXRhKTtcblx0XHR0aGlzLnByb3BzLmJhY2tlbmQucmVtb3ZlTGlzdGVuZXIoJ29uTmF2aWdhdGVEYXRhJywgdGhpcy5vbk5hdmlnYXRlRGF0YSk7XG5cdFx0dGhpcy5wcm9wcy5iYWNrZW5kLnJlbW92ZUxpc3RlbmVyKCdvbk1vcmVEYXRhJywgdGhpcy5vbk1vcmVEYXRhKTtcblx0XHR0aGlzLnByb3BzLmJhY2tlbmQucmVtb3ZlTGlzdGVuZXIoJ29uU2VhcmNoRGF0YScsIHRoaXMub25TZWFyY2hEYXRhKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcblx0XHR2YXIgJHNlbGVjdCA9ICQoUmVhY3RET00uZmluZERPTU5vZGUodGhpcykpLmZpbmQoJy5nYWxsZXJ5X19zb3J0IC5kcm9wZG93bicpO1xuXG5cdFx0Ly8gV2Ugb3B0LW91dCBvZiBsZXR0aW5nIHRoZSBDTVMgaGFuZGxlIENob3NlbiBiZWNhdXNlIGl0IGRvZXNuJ3QgcmUtYXBwbHkgdGhlIGJlaGF2aW91ciBjb3JyZWN0bHkuXG5cdFx0Ly8gU28gYWZ0ZXIgdGhlIGdhbGxlcnkgaGFzIGJlZW4gcmVuZGVyZWQgd2UgYXBwbHkgQ2hvc2VuLlxuXHRcdCRzZWxlY3QuY2hvc2VuKHtcblx0XHRcdCdhbGxvd19zaW5nbGVfZGVzZWxlY3QnOiB0cnVlLFxuXHRcdFx0J2Rpc2FibGVfc2VhcmNoX3RocmVzaG9sZCc6IDIwXG5cdFx0fSk7XG5cblx0XHQvLyBDaG9zZW4gc3RvcHMgdGhlIGNoYW5nZSBldmVudCBmcm9tIHJlYWNoaW5nIFJlYWN0IHNvIHdlIGhhdmUgdG8gc2ltdWxhdGUgYSBjbGljay5cblx0XHQkc2VsZWN0LmNoYW5nZSgoKSA9PiBSZWFjdFRlc3RVdGlscy5TaW11bGF0ZS5jbGljaygkc2VsZWN0LmZpbmQoJzpzZWxlY3RlZCcpWzBdKSk7XG5cdH1cblxuXHRnZXRGaWxlQnlJZChpZCkge1xuXHRcdHZhciBmb2xkZXIgPSBudWxsO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnByb3BzLmdhbGxlcnkuZmlsZXMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdGlmICh0aGlzLnByb3BzLmdhbGxlcnkuZmlsZXNbaV0uaWQgPT09IGlkKSB7XG5cdFx0XHRcdGZvbGRlciA9IHRoaXMucHJvcHMuZ2FsbGVyeS5maWxlc1tpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZvbGRlcjtcblx0fVxuXHRcblx0Z2V0Tm9JdGVtc05vdGljZSgpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5nYWxsZXJ5LmNvdW50IDwgMSkge1xuXHRcdFx0cmV0dXJuIDxwIGNsYXNzTmFtZT1cImdhbGxlcnlfX25vLWl0ZW0tbm90aWNlXCI+e2kxOG4uX3QoJ0Fzc2V0R2FsbGVyeUZpZWxkLk5PSVRFTVNGT1VORCcpfTwvcD47XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Z2V0QmFja0J1dHRvbigpIHtcblx0XHRpZiAodGhpcy5mb2xkZXJzLmxlbmd0aCA+IDEpIHtcblx0XHRcdHJldHVybiA8YnV0dG9uXG5cdFx0XHRcdGNsYXNzTmFtZT0nZ2FsbGVyeV9fYmFjayBzcy11aS1idXR0b24gdWktYnV0dG9uIHVpLXdpZGdldCB1aS1zdGF0ZS1kZWZhdWx0IHVpLWNvcm5lci1hbGwgZm9udC1pY29uLWxldmVsLXVwIG5vLXRleHQnXG5cdFx0XHRcdG9uQ2xpY2s9e3RoaXMub25CYWNrQ2xpY2t9XG5cdFx0XHRcdHJlZj1cImJhY2tCdXR0b25cIj48L2J1dHRvbj47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRnZXRCdWxrQWN0aW9uc0NvbXBvbmVudCgpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5nYWxsZXJ5LnNlbGVjdGVkRmlsZXMubGVuZ3RoID4gMCAmJiB0aGlzLnByb3BzLmJhY2tlbmQuYnVsa0FjdGlvbnMpIHtcblx0XHRcdHJldHVybiA8QnVsa0FjdGlvbnNDb21wb25lbnRcblx0XHRcdFx0YmFja2VuZD17dGhpcy5wcm9wcy5iYWNrZW5kfSAvPjtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGdldE1vcmVCdXR0b24oKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuZ2FsbGVyeS5jb3VudCA+IHRoaXMucHJvcHMuZ2FsbGVyeS5maWxlcy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiA8YnV0dG9uXG5cdFx0XHRcdGNsYXNzTmFtZT1cImdhbGxlcnlfX2xvYWRfX21vcmVcIlxuXHRcdFx0XHRvbkNsaWNrPXt0aGlzLm9uTW9yZUNsaWNrfT57aTE4bi5fdCgnQXNzZXRHYWxsZXJ5RmllbGQuTE9BRE1PUkUnKX08L2J1dHRvbj47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuZ2FsbGVyeS5lZGl0aW5nICE9PSBmYWxzZSkge1xuXHRcdFx0cmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdnYWxsZXJ5Jz5cblx0XHRcdFx0PEVkaXRvckNvbnRhaW5lclxuXHRcdFx0XHRcdGZpbGU9e3RoaXMucHJvcHMuZ2FsbGVyeS5lZGl0aW5nfVxuXHRcdFx0XHRcdG9uRmlsZVNhdmU9e3RoaXMub25GaWxlU2F2ZX1cblx0XHRcdFx0XHRvbkNhbmNlbD17dGhpcy5vbkNhbmNlbH0gLz5cblx0XHRcdDwvZGl2Pjtcblx0XHR9XG5cblx0XHRyZXR1cm4gPGRpdiBjbGFzc05hbWU9J2dhbGxlcnknPlxuXHRcdFx0e3RoaXMuZ2V0QmFja0J1dHRvbigpfVxuXHRcdFx0e3RoaXMuZ2V0QnVsa0FjdGlvbnNDb21wb25lbnQoKX1cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZ2FsbGVyeV9fc29ydCBmaWVsZGhvbGRlci1zbWFsbFwiPlxuXHRcdFx0XHQ8c2VsZWN0IGNsYXNzTmFtZT1cImRyb3Bkb3duIG5vLWNoYW5nZS10cmFjayBuby1jaHpuXCIgdGFiSW5kZXg9XCIwXCIgc3R5bGU9e3t3aWR0aDogJzE2MHB4J319PlxuXHRcdFx0XHRcdHt0aGlzLnNvcnRlcnMubWFwKChzb3J0ZXIsIGkpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiA8b3B0aW9uIGtleT17aX0gb25DbGljaz17c29ydGVyLm9uU29ydH0+e3NvcnRlci5sYWJlbH08L29wdGlvbj47XG5cdFx0XHRcdFx0fSl9XG5cdFx0XHRcdDwvc2VsZWN0PlxuXHRcdFx0PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT0nZ2FsbGVyeV9faXRlbXMnPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5nYWxsZXJ5LmZpbGVzLm1hcCgoZmlsZSwgaSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiA8RmlsZUNvbXBvbmVudCBrZXk9e2l9IHsuLi5maWxlfVxuXHRcdFx0XHRcdFx0c3BhY2VLZXk9e0NPTlNUQU5UUy5TUEFDRV9LRVlfQ09ERX1cblx0XHRcdFx0XHRcdHJldHVybktleT17Q09OU1RBTlRTLlJFVFVSTl9LRVlfQ09ERX1cblx0XHRcdFx0XHRcdG9uRmlsZURlbGV0ZT17dGhpcy5vbkZpbGVEZWxldGV9XG5cdFx0XHRcdFx0XHRvbkZpbGVOYXZpZ2F0ZT17dGhpcy5vbkZpbGVOYXZpZ2F0ZX0gLz47XG5cdFx0XHRcdH0pfVxuXHRcdFx0PC9kaXY+XG5cdFx0XHR7dGhpcy5nZXROb0l0ZW1zTm90aWNlKCl9XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImdhbGxlcnlfX2xvYWRcIj5cblx0XHRcdFx0e3RoaXMuZ2V0TW9yZUJ1dHRvbigpfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+O1xuXHR9XG5cblx0b25GZXRjaERhdGEoZGF0YSkge1xuXHRcdHRoaXMucHJvcHMuYWN0aW9ucy5hZGRGaWxlKGRhdGEuZmlsZXMsIGRhdGEuY291bnQpO1xuXHR9XG5cblx0b25TYXZlRGF0YShpZCwgdmFsdWVzKSB7XG5cdFx0dGhpcy5wcm9wcy5hY3Rpb25zLnNldEVkaXRpbmcoZmFsc2UpO1xuXHRcdHRoaXMucHJvcHMuYWN0aW9ucy51cGRhdGVGaWxlKGlkLCB7IHRpdGxlOiB2YWx1ZXMudGl0bGUsIGJhc2VuYW1lOiB2YWx1ZXMuYmFzZW5hbWUgfSk7XG5cdH1cblxuXHRvbkRlbGV0ZURhdGEoZGF0YSkge1xuXHRcdGNvbnN0IGZpbGVzID0gdGhpcy5wcm9wcy5nYWxsZXJ5LmZpbGVzLmZpbHRlcigoZmlsZSkgPT4ge1xuXHRcdFx0cmV0dXJuIGRhdGEgIT09IGZpbGUuaWQ7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnByb3BzLmFjdGlvbnMuYWRkRmlsZShmaWxlcywgdGhpcy5wcm9wcy5nYWxsZXJ5LmNvdW50IC0gMSk7XG5cdH1cblxuXHRvbk5hdmlnYXRlRGF0YShkYXRhKSB7XG5cdFx0dGhpcy5wcm9wcy5hY3Rpb25zLmFkZEZpbGUoZGF0YS5maWxlcywgZGF0YS5jb3VudCk7XG5cdH1cblxuXHRvbk1vcmVEYXRhKGRhdGEpIHtcblx0XHR0aGlzLnByb3BzLmFjdGlvbnMuYWRkRmlsZSh0aGlzLnByb3BzLmdhbGxlcnkuZmlsZXMuY29uY2F0KGRhdGEuZmlsZXMpLCBkYXRhLmNvdW50KTtcblx0fVxuXG5cdG9uU2VhcmNoRGF0YShkYXRhKSB7XG5cdFx0dGhpcy5wcm9wcy5hY3Rpb25zLmFkZEZpbGUoZGF0YS5maWxlcywgZGF0YS5jb3VudCk7XG5cdH1cblxuXHRvbkZpbGVEZWxldGUoZmlsZSwgZXZlbnQpIHtcblx0XHRpZiAoY29uZmlybShpMThuLl90KCdBc3NldEdhbGxlcnlGaWVsZC5DT05GSVJNREVMRVRFJykpKSB7XG5cdFx0XHR0aGlzLnByb3BzLmJhY2tlbmQuZGVsZXRlKGZpbGUuaWQpO1xuXHRcdFx0dGhpcy5lbWl0RmlsZURlbGV0ZWRDbXNFdmVudCgpO1xuXHRcdH1cblxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHR9XG5cblx0b25GaWxlTmF2aWdhdGUoZmlsZSkge1xuXHRcdHRoaXMuZm9sZGVycy5wdXNoKGZpbGUuZmlsZW5hbWUpO1xuXHRcdHRoaXMucHJvcHMuYmFja2VuZC5uYXZpZ2F0ZShmaWxlLmZpbGVuYW1lKTtcblxuXHRcdHRoaXMucHJvcHMuYWN0aW9ucy5kZXNlbGVjdEZpbGVzKCk7XG5cblx0XHR0aGlzLmVtaXRGb2xkZXJDaGFuZ2VkQ21zRXZlbnQoKTtcblx0fVxuXG5cdGVtaXRGb2xkZXJDaGFuZ2VkQ21zRXZlbnQoKSB7XG5cdFx0dmFyIGZvbGRlciA9IHtcblx0XHRcdHBhcmVudElkOiAwLFxuXHRcdFx0aWQ6IDBcblx0XHR9O1xuXG5cdFx0Ly8gVGhlIGN1cnJlbnQgZm9sZGVyIGlzIHN0b3JlZCBieSBpdCdzIG5hbWUgaW4gb3VyIGNvbXBvbmVudC5cblx0XHQvLyBXZSBuZWVkIHRvIGdldCBpdCdzIGlkIGJlY2F1c2UgdGhhdCdzIGhvdyBFbnR3aW5lIGNvbXBvbmVudHMgKEdyaWRGaWVsZCkgcmVmZXJlbmNlIGl0LlxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wcm9wcy5nYWxsZXJ5LmZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5nYWxsZXJ5LmZpbGVzW2ldLmZpbGVuYW1lID09PSB0aGlzLnByb3BzLmJhY2tlbmQuZm9sZGVyKSB7XG5cdFx0XHRcdGZvbGRlci5wYXJlbnRJZCA9IHRoaXMucHJvcHMuZ2FsbGVyeS5maWxlc1tpXS5wYXJlbnQuaWQ7XG5cdFx0XHRcdGZvbGRlci5pZCA9IHRoaXMucHJvcHMuZ2FsbGVyeS5maWxlc1tpXS5pZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fZW1pdENtc0V2ZW50KCdmb2xkZXItY2hhbmdlZC5hc3NldC1nYWxsZXJ5LWZpZWxkJywgZm9sZGVyKTtcblx0fVxuXG5cdGVtaXRGaWxlRGVsZXRlZENtc0V2ZW50KCkge1xuXHRcdHRoaXMuX2VtaXRDbXNFdmVudCgnZmlsZS1kZWxldGVkLmFzc2V0LWdhbGxlcnktZmllbGQnKTtcblx0fVxuXG5cdGVtaXRFbnRlckZpbGVWaWV3Q21zRXZlbnQoZmlsZSkge1xuXHRcdHZhciBpZCA9IDA7XG5cblx0XHR0aGlzLl9lbWl0Q21zRXZlbnQoJ2VudGVyLWZpbGUtdmlldy5hc3NldC1nYWxsZXJ5LWZpZWxkJywgZmlsZS5pZCk7XG5cdH1cblxuXHRlbWl0RXhpdEZpbGVWaWV3Q21zRXZlbnQoKSB7XG5cdFx0dGhpcy5fZW1pdENtc0V2ZW50KCdleGl0LWZpbGUtdmlldy5hc3NldC1nYWxsZXJ5LWZpZWxkJyk7XG5cdH1cblxuXHRvbk5hdmlnYXRlKGZvbGRlciwgc2lsZW50ID0gZmFsc2UpIHtcblx0XHQvLyBEb24ndCB0aGUgZm9sZGVyIGlmIGl0IGV4aXN0cyBhbHJlYWR5LlxuXHRcdGlmICh0aGlzLmZvbGRlcnMuaW5kZXhPZihmb2xkZXIpID09PSAtMSkge1xuXHRcdFx0dGhpcy5mb2xkZXJzLnB1c2goZm9sZGVyKTtcblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLmJhY2tlbmQubmF2aWdhdGUoZm9sZGVyKTtcblxuXHRcdGlmICghc2lsZW50KSB7XG5cdFx0XHR0aGlzLmVtaXRGb2xkZXJDaGFuZ2VkQ21zRXZlbnQoKTtcblx0XHR9XG5cdH1cblxuXHRvbk1vcmVDbGljayhldmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5wcm9wcy5iYWNrZW5kLm1vcmUoKTtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH1cblxuXHRvbkJhY2tDbGljayhldmVudCkge1xuXHRcdGlmICh0aGlzLmZvbGRlcnMubGVuZ3RoID4gMSkge1xuXHRcdFx0dGhpcy5mb2xkZXJzLnBvcCgpO1xuXHRcdFx0dGhpcy5wcm9wcy5iYWNrZW5kLm5hdmlnYXRlKHRoaXMuZm9sZGVyc1t0aGlzLmZvbGRlcnMubGVuZ3RoIC0gMV0pO1xuXHRcdH1cblxuXHRcdHRoaXMucHJvcHMuYWN0aW9ucy5kZXNlbGVjdEZpbGVzKCk7XG5cblx0XHR0aGlzLmVtaXRGb2xkZXJDaGFuZ2VkQ21zRXZlbnQoKTtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH1cblxuXHRvbkZpbGVTYXZlKGlkLCBzdGF0ZSwgZXZlbnQpIHtcblx0XHR0aGlzLnByb3BzLmJhY2tlbmQuc2F2ZShpZCwgc3RhdGUpO1xuXG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fVxufVxuXG5HYWxsZXJ5Q29udGFpbmVyLnByb3BUeXBlcyA9IHtcblx0YmFja2VuZDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG59O1xuXG5mdW5jdGlvbiBtYXBTdGF0ZVRvUHJvcHMoc3RhdGUpIHtcblx0cmV0dXJuIHtcblx0XHRnYWxsZXJ5OiBzdGF0ZS5hc3NldEFkbWluLmdhbGxlcnlcblx0fVxufVxuXG5mdW5jdGlvbiBtYXBEaXNwYXRjaFRvUHJvcHMoZGlzcGF0Y2gpIHtcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zOiBiaW5kQWN0aW9uQ3JlYXRvcnMoZ2FsbGVyeUFjdGlvbnMsIGRpc3BhdGNoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKEdhbGxlcnlDb250YWluZXIpO1xuIiwiZXhwb3J0IGNvbnN0IEdBTExFUlkgPSB7XG4gICAgQUREX0ZJTEU6ICdBRERfRklMRScsXG4gICAgVVBEQVRFX0ZJTEU6ICdVUERBVEVfRklMRScsXG4gICAgU0VMRUNUX0ZJTEVTOiAnU0VMRUNUX0ZJTEVTJyxcbiAgICBERVNFTEVDVF9GSUxFUzogJ0RFU0VMRUNUX0ZJTEVTJyxcbiAgICBTRVRfRURJVElORzogJ1NFVF9FRElUSU5HJyxcbiAgICBTRVRfRk9DVVM6ICdTRVRfRk9DVVMnLFxuICAgIFNFVF9FRElUT1JfRklFTERTOiAnU0VUX0VESVRPUl9GSUVMRFMnLFxuICAgIFVQREFURV9FRElUT1JfRklFTEQ6ICdVUERBVEVfRURJVE9SX0ZJRUxEJ1xufVxuIiwiLyoqXG4gKiBAZmlsZSBGYWN0b3J5IGZvciBjcmVhdGluZyBhIFJlZHV4IHN0b3JlLlxuICovXG5cbmltcG9ydCB7IGNyZWF0ZVN0b3JlLCBhcHBseU1pZGRsZXdhcmUgfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgdGh1bmtNaWRkbGV3YXJlIGZyb20gJ3JlZHV4LXRodW5rJzsgLy8gVXNlZCBmb3IgaGFuZGxpbmcgYXN5bmMgc3RvcmUgdXBkYXRlcy5cbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAncmVkdXgtbG9nZ2VyJzsgLy8gTG9ncyBzdGF0ZSBjaGFuZ2VzIHRvIHRoZSBjb25zb2xlLiBVc2VmdWwgZm9yIGRlYnVnZ2luZy5cbmltcG9ydCByb290UmVkdWNlciBmcm9tICcuL3JlZHVjZXInO1xuXG4vKipcbiAqIEBmdW5jIGNyZWF0ZVN0b3JlV2l0aE1pZGRsZXdhcmVcbiAqIEBwYXJhbSBmdW5jdGlvbiByb290UmVkdWNlclxuICogQHBhcmFtIG9iamVjdCBpbml0aWFsU3RhdGVcbiAqIEBkZXNjIENyZWF0ZXMgYSBSZWR1eCBzdG9yZSB3aXRoIHNvbWUgbWlkZGxld2FyZSBhcHBsaWVkLlxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgY3JlYXRlU3RvcmVXaXRoTWlkZGxld2FyZSA9IGFwcGx5TWlkZGxld2FyZShcblx0dGh1bmtNaWRkbGV3YXJlLFxuXHRjcmVhdGVMb2dnZXIoKVxuKShjcmVhdGVTdG9yZSk7XG5cbi8qKlxuICogQGZ1bmMgY29uZmlndXJlU3RvcmVcbiAqIEBwYXJhbSBvYmplY3QgaW5pdGlhbFN0YXRlXG4gKiBAcmV0dXJuIG9iamVjdCAtIEEgUmVkdXggc3RvcmUgdGhhdCBsZXRzIHlvdSByZWFkIHRoZSBzdGF0ZSwgZGlzcGF0Y2ggYWN0aW9ucyBhbmQgc3Vic2NyaWJlIHRvIGNoYW5nZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbmZpZ3VyZVN0b3JlKGluaXRpYWxTdGF0ZSA9IHt9KSB7XG5cdGNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmVXaXRoTWlkZGxld2FyZShyb290UmVkdWNlciwgaW5pdGlhbFN0YXRlKTtcblxuXHRyZXR1cm4gc3RvcmU7XG59OyIsImltcG9ydCB7IEdBTExFUlkgfSBmcm9tICcuLi9hY3Rpb24tdHlwZXMnO1xuXG4vKipcbiAqIEFkZHMgYSBmaWxlIHRvIHN0YXRlLlxuICpcbiAqIEBwYXJhbSBvYmplY3R8YXJyYXkgZmlsZSAtIEZpbGUgb2JqZWN0IG9yIGFycmF5IG9mIGZpbGUgb2JqZWN0cy5cbiAqIEBwYXJhbSBudW1iZXIgW2NvdW50XSAtIFRoZSBudW1iZXIgb2YgZmlsZXMgaW4gdGhlIGN1cnJlbnQgdmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEZpbGUoZmlsZSwgY291bnQpIHtcbiAgICByZXR1cm4gKGRpc3BhdGNoLCBnZXRTdGF0ZSkgPT4ge1xuICAgICAgICByZXR1cm4gZGlzcGF0Y2ggKHtcbiAgICAgICAgICAgIHR5cGU6IEdBTExFUlkuQUREX0ZJTEUsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IGZpbGUsIGNvdW50IH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgYSBmaWxlIHdpdGggbmV3IGRhdGEuXG4gKlxuICogQHBhcmFtIG51bWJlciBpZCAtIFRoZSBpZCBvZiB0aGUgZmlsZSB0byB1cGRhdGUuXG4gKiBAcGFyYW0gb2JqZWN0IHVwZGF0ZXMgLSBUaGUgbmV3IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUZpbGUoaWQsIHVwZGF0ZXMpIHtcbiAgICByZXR1cm4gKGRpc3BhdGNoLCBnZXRTdGF0ZSkgPT4ge1xuICAgICAgICByZXR1cm4gZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogR0FMTEVSWS5VUERBVEVfRklMRSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHsgaWQsIHVwZGF0ZXMgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogU2VsZWN0cyBhIGZpbGUgb3IgZmlsZXMuIElmIG5vIHBhcmFtIGlzIHBhc3NlZCBhbGwgZmlsZXMgYXJlIHNlbGVjdGVkLlxuICpcbiAqIEBwYXJhbSBudW1iZXJ8YXJyYXkgaWRzIC0gRmlsZSBpZCBvciBhcnJheSBvZiBmaWxlIGlkcyB0byBzZWxlY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RGaWxlcyhpZHMgPSBudWxsKSB7XG4gICAgcmV0dXJuIChkaXNwYXRjaCwgZ2V0U3RhdGUpID0+IHtcbiAgICAgICAgcmV0dXJuIGRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEdBTExFUlkuU0VMRUNUX0ZJTEVTLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBpZHMgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogRGVzZWxlY3RzIGEgZmlsZSBvciBmaWxlcy4gSWYgbm8gcGFyYW0gaXMgcGFzc2VkIGFsbCBmaWxlcyBhcmUgZGVzZWxlY3RlZC5cbiAqXG4gKiBAcGFyYW0gbnVtYmVyfGFycmF5IGlkcyAtIEZpbGUgaWQgb3IgYXJyYXkgb2YgZmlsZSBpZHMgdG8gZGVzZWxlY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXNlbGVjdEZpbGVzKGlkcyA9IG51bGwpIHtcbiAgICByZXR1cm4gKGRpc3BhdGNoLCBnZXRTdGF0ZSkgPT4ge1xuICAgICAgICByZXR1cm4gZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogR0FMTEVSWS5ERVNFTEVDVF9GSUxFUyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHsgaWRzIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFN0YXJ0cyBlZGl0aW5nIHRoZSBnaXZlbiBmaWxlIG9yIHN0b3BzIGVkaXRpbmcgaWYgZmFsc2UgaXMgZ2l2ZW4uXG4gKlxuICogQHBhcmFtIG9iamVjdHxib29sZWFuIGZpbGUgLSBUaGUgZmlsZSB0byBlZGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0RWRpdGluZyhmaWxlKSB7XG4gICAgcmV0dXJuIChkaXNwYXRjaCwgZ2V0U3RhdGUpID0+IHtcbiAgICAgICAgcmV0dXJuIGRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEdBTExFUlkuU0VUX0VESVRJTkcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IGZpbGUgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogU2V0cyB0aGUgZm9jdXMgc3RhdGUgb2YgYSBmaWxlLlxuICpcbiAqIEBwYXJhbSBudW1iZXJ8Ym9vbGVhbiBpZCAtIHRoZSBpZCBvZiB0aGUgZmlsZSB0byBmb2N1cyBvbiwgb3IgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRGb2N1cyhpZCkge1xuICAgIHJldHVybiAoZGlzcGF0Y2gsIGdldFN0YXRlKSA9PiB7XG4gICAgICAgIHJldHVybiBkaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBHQUxMRVJZLlNFVF9GT0NVUyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogU2V0cyB0aGUgc3RhdGUgb2YgdGhlIGZpZWxkcyBmb3IgdGhlIGVkaXRvciBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIG9iamVjdCBlZGl0b3JGaWVsZHMgLSB0aGUgY3VycmVudCBmaWVsZHMgaW4gdGhlIGVkaXRvciBjb21wb25lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEVkaXRvckZpZWxkcyhlZGl0b3JGaWVsZHMgPSBbXSkge1xuICAgIHJldHVybiAoZGlzcGF0Y2gsIGdldFN0YXRlKSA9PiB7XG5cdFx0cmV0dXJuIGRpc3BhdGNoICh7XG5cdFx0XHR0eXBlOiBHQUxMRVJZLlNFVF9FRElUT1JfRklFTERTLFxuXHRcdFx0cGF5bG9hZDogeyBlZGl0b3JGaWVsZHMgfVxuXHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZmllbGQuXG4gKlxuICogQHBhcmFtIG9iamVjdCB1cGRhdGVzIC0gVGhlIHZhbHVlcyB0byB1cGRhdGUgdGhlIGVkaXRvciBmaWVsZCB3aXRoLlxuICogQHBhcmFtIHN0cmluZyB1cGRhdGVzLm5hbWUgLSBUaGUgZWRpdG9yIGZpZWxkIG5hbWUuXG4gKiBAcGFyYW0gc3RyaW5nIHVwZGF0ZXMudmFsdWUgLSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBmaWVsZC5cbiAqIEBwYXJhbSBzdHJpbmcgW3VwZGF0ZXMubGFiZWxdIC0gVGhlIGZpZWxkIGxhYmVsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlRWRpdG9yRmllbGQodXBkYXRlcykge1xuICAgIHJldHVybiAoZGlzcGF0Y2gsIGdldFN0YXRlKSA9PiB7XG5cdFx0cmV0dXJuIGRpc3BhdGNoICh7XG5cdFx0XHR0eXBlOiBHQUxMRVJZLlVQREFURV9FRElUT1JfRklFTEQsXG5cdFx0XHRwYXlsb2FkOiB7IHVwZGF0ZXMgfVxuXHRcdH0pO1xuXHR9XG59XG4iLCJpbXBvcnQgZGVlcEZyZWV6ZSBmcm9tICdkZWVwLWZyZWV6ZSc7XG5pbXBvcnQgeyBHQUxMRVJZIH0gZnJvbSAnLi4vYWN0aW9uLXR5cGVzJztcbmltcG9ydCBDT05TVEFOVFMgZnJvbSAnLi4vLi4vY29uc3RhbnRzLmpzJztcblxuY29uc3QgaW5pdGlhbFN0YXRlID0ge1xuICAgIGNvdW50OiAwLCAvLyBUaGUgbnVtYmVyIG9mIGZpbGVzIGluIHRoZSBjdXJyZW50IHZpZXdcbiAgICBlZGl0aW5nOiBmYWxzZSxcbiAgICBmaWxlczogW10sXG4gICAgc2VsZWN0ZWRGaWxlczogW10sXG4gICAgZWRpdGluZzogZmFsc2UsXG4gICAgZm9jdXM6IGZhbHNlLFxuICAgIGJ1bGtBY3Rpb25zOiB7XG4gICAgICAgIHBsYWNlaG9sZGVyOiBDT05TVEFOVFMuQlVMS19BQ1RJT05TX1BMQUNFSE9MREVSLFxuICAgICAgICBvcHRpb25zOiBDT05TVEFOVFMuQlVMS19BQ1RJT05TXG4gICAgfSxcbiAgICBlZGl0b3JGaWVsZHM6IFtdXG59O1xuXG4vKipcbiAqIFJlZHVjZXIgZm9yIHRoZSBgYXNzZXRBZG1pbi5nYWxsZXJ5YCBzdGF0ZSBrZXkuXG4gKlxuICogQHBhcmFtIG9iamVjdCBzdGF0ZVxuICogQHBhcmFtIG9iamVjdCBhY3Rpb24gLSBUaGUgZGlzcGF0Y2hlZCBhY3Rpb24uXG4gKiBAcGFyYW0gc3RyaW5nIGFjdGlvbi50eXBlIC0gTmFtZSBvZiB0aGUgZGlzcGF0Y2hlZCBhY3Rpb24uXG4gKiBAcGFyYW0gb2JqZWN0IFthY3Rpb24ucGF5bG9hZF0gLSBPcHRpb25hbCBkYXRhIHBhc3NlZCB3aXRoIHRoZSBhY3Rpb24uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdhbGxlcnlSZWR1Y2VyKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pIHtcblxuICAgIHZhciBuZXh0U3RhdGU7XG5cbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICAgIGNhc2UgR0FMTEVSWS5BRERfRklMRTpcbiAgICAgICAgICAgIHJldHVybiBkZWVwRnJlZXplKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICAgICAgICAgICAgY291bnQ6IGFjdGlvbi5wYXlsb2FkLmNvdW50ICE9PSAndW5kZWZpbmVkJyA/IGFjdGlvbi5wYXlsb2FkLmNvdW50IDogc3RhdGUuY291bnQsXG4gICAgICAgICAgICAgICAgZmlsZXM6IHN0YXRlLmZpbGVzLmNvbmNhdChhY3Rpb24ucGF5bG9hZC5maWxlKVxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgIGNhc2UgR0FMTEVSWS5VUERBVEVfRklMRTpcbiAgICAgICAgICAgIGxldCBmaWxlSW5kZXggPSBzdGF0ZS5maWxlcy5tYXAoZmlsZSA9PiBmaWxlLmlkKS5pbmRleE9mKGFjdGlvbi5wYXlsb2FkLmlkKTtcbiAgICAgICAgICAgIGxldCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmZpbGVzW2ZpbGVJbmRleF0sIGFjdGlvbi5wYXlsb2FkLnVwZGF0ZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVlcEZyZWV6ZShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgICAgICAgICAgIGZpbGVzOiBzdGF0ZS5maWxlcy5tYXAoZmlsZSA9PiBmaWxlLmlkID09PSB1cGRhdGVkRmlsZS5pZCA/IHVwZGF0ZWRGaWxlIDogZmlsZSlcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICBjYXNlIEdBTExFUlkuU0VMRUNUX0ZJTEVTOlxuICAgICAgICAgICAgaWYgKGFjdGlvbi5wYXlsb2FkLmlkcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIE5vIHBhcmFtIHdhcyBwYXNzZWQsIGFkZCBldmVyeXRoaW5nIHRoYXQgaXNuJ3QgY3VycmVudGx5IHNlbGVjdGVkLCB0byB0aGUgc2VsZWN0ZWRGaWxlcyBhcnJheS5cbiAgICAgICAgICAgICAgICBuZXh0U3RhdGUgPSBkZWVwRnJlZXplKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRmlsZXM6IHN0YXRlLnNlbGVjdGVkRmlsZXMuY29uY2F0KHN0YXRlLmZpbGVzLm1hcChmaWxlID0+IGZpbGUuaWQpLmZpbHRlcihpZCA9PiBzdGF0ZS5zZWxlY3RlZEZpbGVzLmluZGV4T2YoaWQpID09PSAtMSkpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYWN0aW9uLnBheWxvYWQuaWRzID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGRlYWxpbmcgd2l0aCBhIHNpbmdsZSBpZCB0byBzZWxlY3QuXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBmaWxlIGlmIGl0J3Mgbm90IGFscmVhZHkgc2VsZWN0ZWQuXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkRmlsZXMuaW5kZXhPZihhY3Rpb24ucGF5bG9hZC5pZHMpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0U3RhdGUgPSBkZWVwRnJlZXplKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEZpbGVzOiBzdGF0ZS5zZWxlY3RlZEZpbGVzLmNvbmNhdChhY3Rpb24ucGF5bG9hZC5pZHMpXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZmlsZSBpcyBhbHJlYWR5IHNlbGVjdGVkLCBzbyByZXR1cm4gdGhlIGN1cnJlbnQgc3RhdGUuXG4gICAgICAgICAgICAgICAgICAgIG5leHRTdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgZGVhbGluZyB3aXRoIGFuIGFycmF5IGlmIGlkcyB0byBzZWxlY3QuXG4gICAgICAgICAgICAgICAgbmV4dFN0YXRlID0gZGVlcEZyZWV6ZShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEZpbGVzOiBzdGF0ZS5zZWxlY3RlZEZpbGVzLmNvbmNhdChhY3Rpb24ucGF5bG9hZC5pZHMuZmlsdGVyKGlkID0+IHN0YXRlLnNlbGVjdGVkRmlsZXMuaW5kZXhPZihpZCkgPT09IC0xKSlcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXh0U3RhdGU7XG5cbiAgICAgICAgY2FzZSBHQUxMRVJZLkRFU0VMRUNUX0ZJTEVTOlxuICAgICAgICAgICAgaWYgKGFjdGlvbi5wYXlsb2FkLmlkcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIE5vIHBhcmFtIHdhcyBwYXNzZWQsIGRlc2VsZWN0IGV2ZXJ5dGhpbmcuXG4gICAgICAgICAgICAgICAgbmV4dFN0YXRlID0gZGVlcEZyZWV6ZShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwgeyBzZWxlY3RlZEZpbGVzOiBbXSB9KSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhY3Rpb24ucGF5bG9hZC5pZHMgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgZGVhbGluZyB3aXRoIGEgc2luZ2xlIGlkIHRvIGRlc2VsZWN0LlxuICAgICAgICAgICAgICAgIGxldCBmaWxlSW5kZXggPSBzdGF0ZS5zZWxlY3RlZEZpbGVzLmluZGV4T2YoYWN0aW9uLnBheWxvYWQuaWRzKTtcblxuICAgICAgICAgICAgICAgIG5leHRTdGF0ZSA9IGRlZXBGcmVlemUoT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUsIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxlczogc3RhdGUuc2VsZWN0ZWRGaWxlcy5zbGljZSgwLCBmaWxlSW5kZXgpLmNvbmNhdChzdGF0ZS5zZWxlY3RlZEZpbGVzLnNsaWNlKGZpbGVJbmRleCArIDEpKVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgZGVhbGluZyB3aXRoIGFuIGFycmF5IGlmIGlkcyB0byBkZXNlbGVjdC5cbiAgICAgICAgICAgICAgICBuZXh0U3RhdGUgPSBkZWVwRnJlZXplKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRmlsZXM6IHN0YXRlLnNlbGVjdGVkRmlsZXMuZmlsdGVyKGlkID0+IGFjdGlvbi5wYXlsb2FkLmlkcy5pbmRleE9mKGlkKSA9PT0gLTEpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV4dFN0YXRlO1xuXG4gICAgICAgIGNhc2UgR0FMTEVSWS5TRVRfRURJVElORzpcbiAgICAgICAgICAgIHJldHVybiBkZWVwRnJlZXplKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICAgICAgICAgICAgZWRpdGluZzogYWN0aW9uLnBheWxvYWQuZmlsZVxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgIGNhc2UgR0FMTEVSWS5TRVRfRk9DVVM6XG4gICAgICAgICAgICByZXR1cm4gZGVlcEZyZWV6ZShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgICAgICAgICAgIGZvY3VzOiBhY3Rpb24ucGF5bG9hZC5pZFxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgIGNhc2UgR0FMTEVSWS5TRVRfRURJVE9SX0ZJRUxEUzpcbiAgICAgICAgICAgIHJldHVybiBkZWVwRnJlZXplKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICAgICAgICAgICAgZWRpdG9yRmllbGRzOiBhY3Rpb24ucGF5bG9hZC5lZGl0b3JGaWVsZHNcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgXG4gICAgICAgIGNhc2UgR0FMTEVSWS5VUERBVEVfRURJVE9SX0ZJRUxEOlxuICAgICAgICAgICAgbGV0IGZpZWxkSW5kZXggPSBzdGF0ZS5lZGl0b3JGaWVsZHMubWFwKGZpZWxkID0+IGZpZWxkLm5hbWUpLmluZGV4T2YoYWN0aW9uLnBheWxvYWQudXBkYXRlcy5uYW1lKTtcbiAgICAgICAgICAgIGxldCB1cGRhdGVkRmllbGQgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5lZGl0b3JGaWVsZHNbZmllbGRJbmRleF0sIGFjdGlvbi5wYXlsb2FkLnVwZGF0ZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVlcEZyZWV6ZShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgICAgICAgICAgIGVkaXRvckZpZWxkczogc3RhdGUuZWRpdG9yRmllbGRzLm1hcChmaWVsZCA9PiBmaWVsZC5uYW1lID09PSB1cGRhdGVkRmllbGQubmFtZSA/IHVwZGF0ZWRGaWVsZCA6IGZpZWxkKVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG59XG4iLCIvKipcbiAqIEBmaWxlIFRoZSByZWR1Y2VyIHdoaWNoIG9wZXJhdGVzIG9uIHRoZSBSZWR1eCBzdG9yZS5cbiAqL1xuXG5pbXBvcnQgeyBjb21iaW5lUmVkdWNlcnMgfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgZ2FsbGVyeVJlZHVjZXIgZnJvbSAnLi9nYWxsZXJ5L3JlZHVjZXIuanMnO1xuXG4vKipcbiAqIE9wZXJhdGVzIG9uIHRoZSBSZWR1eCBzdG9yZSB0byB1cGRhdGUgYXBwbGljYXRpb24gc3RhdGUuXG4gKlxuICogQHBhcmFtIG9iamVjdCBzdGF0ZSAtIFRoZSBjdXJyZW50IHN0YXRlLlxuICogQHBhcmFtIG9iamVjdCBhY3Rpb24gLSBUaGUgZGlzcGF0Y2hlZCBhY3Rpb24uXG4gKiBAcGFyYW0gc3RyaW5nIGFjdGlvbi50eXBlIC0gVGhlIHR5cGUgb2YgYWN0aW9uIHRoYXQgaGFzIGJlZW4gZGlzcGF0Y2hlZC5cbiAqIEBwYXJhbSBvYmplY3QgW2FjdGlvbi5wYXlsb2FkXSAtIE9wdGlvbmFsIGRhdGEgcGFzc2VkIHdpdGggdGhlIGFjdGlvbi5cbiAqL1xuY29uc3Qgcm9vdFJlZHVjZXIgPSBjb21iaW5lUmVkdWNlcnMoe1xuICAgIGFzc2V0QWRtaW46IGNvbWJpbmVSZWR1Y2Vycyh7XG4gICAgICAgIGdhbGxlcnk6IGdhbGxlcnlSZWR1Y2VyXG4gICAgfSlcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb290UmVkdWNlcjtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVlcEZyZWV6ZSAobykge1xuICBPYmplY3QuZnJlZXplKG8pO1xuXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG8pLmZvckVhY2goZnVuY3Rpb24gKHByb3ApIHtcbiAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShwcm9wKVxuICAgICYmIG9bcHJvcF0gIT09IG51bGxcbiAgICAmJiAodHlwZW9mIG9bcHJvcF0gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIG9bcHJvcF0gPT09IFwiZnVuY3Rpb25cIilcbiAgICAmJiAhT2JqZWN0LmlzRnJvemVuKG9bcHJvcF0pKSB7XG4gICAgICBkZWVwRnJlZXplKG9bcHJvcF0pO1xuICAgIH1cbiAgfSk7XG4gIFxuICByZXR1cm4gbztcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHJlcGVhdCA9IGZ1bmN0aW9uIHJlcGVhdChzdHIsIHRpbWVzKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodGltZXMgKyAxKS5qb2luKHN0cik7XG59O1xudmFyIHBhZCA9IGZ1bmN0aW9uIHBhZChudW0sIG1heExlbmd0aCkge1xuICByZXR1cm4gcmVwZWF0KFwiMFwiLCBtYXhMZW5ndGggLSBudW0udG9TdHJpbmcoKS5sZW5ndGgpICsgbnVtO1xufTtcbnZhciBmb3JtYXRUaW1lID0gZnVuY3Rpb24gZm9ybWF0VGltZSh0aW1lKSB7XG4gIHJldHVybiBcIiBAIFwiICsgcGFkKHRpbWUuZ2V0SG91cnMoKSwgMikgKyBcIjpcIiArIHBhZCh0aW1lLmdldE1pbnV0ZXMoKSwgMikgKyBcIjpcIiArIHBhZCh0aW1lLmdldFNlY29uZHMoKSwgMikgKyBcIi5cIiArIHBhZCh0aW1lLmdldE1pbGxpc2Vjb25kcygpLCAzKTtcbn07XG5cbi8vIFVzZSB0aGUgbmV3IHBlcmZvcm1hbmNlIGFwaSB0byBnZXQgYmV0dGVyIHByZWNpc2lvbiBpZiBhdmFpbGFibGVcbnZhciB0aW1lciA9IHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ID09PSBcImZ1bmN0aW9uXCIgPyBwZXJmb3JtYW5jZSA6IERhdGU7XG5cbi8qKlxuICogQ3JlYXRlcyBsb2dnZXIgd2l0aCBmb2xsb3dlZCBvcHRpb25zXG4gKlxuICogQG5hbWVzcGFjZVxuICogQHByb3BlcnR5IHtvYmplY3R9IG9wdGlvbnMgLSBvcHRpb25zIGZvciBsb2dnZXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBvcHRpb25zLmxldmVsIC0gY29uc29sZVtsZXZlbF1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy5kdXJhdGlvbiAtIHByaW50IGR1cmF0aW9uIG9mIGVhY2ggYWN0aW9uP1xuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLnRpbWVzdGFtcCAtIHByaW50IHRpbWVzdGFtcCB3aXRoIGVhY2ggYWN0aW9uP1xuICogQHByb3BlcnR5IHtvYmplY3R9IG9wdGlvbnMuY29sb3JzIC0gY3VzdG9tIGNvbG9yc1xuICogQHByb3BlcnR5IHtvYmplY3R9IG9wdGlvbnMubG9nZ2VyIC0gaW1wbGVtZW50YXRpb24gb2YgdGhlIGBjb25zb2xlYCBBUElcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy5sb2dFcnJvcnMgLSBzaG91bGQgZXJyb3JzIGluIGFjdGlvbiBleGVjdXRpb24gYmUgY2F1Z2h0LCBsb2dnZWQsIGFuZCByZS10aHJvd24/XG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9wdGlvbnMuY29sbGFwc2VkIC0gaXMgZ3JvdXAgY29sbGFwc2VkP1xuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLnByZWRpY2F0ZSAtIGNvbmRpdGlvbiB3aGljaCByZXNvbHZlcyBsb2dnZXIgYmVoYXZpb3JcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IG9wdGlvbnMuc3RhdGVUcmFuc2Zvcm1lciAtIHRyYW5zZm9ybSBzdGF0ZSBiZWZvcmUgcHJpbnRcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IG9wdGlvbnMuYWN0aW9uVHJhbnNmb3JtZXIgLSB0cmFuc2Zvcm0gYWN0aW9uIGJlZm9yZSBwcmludFxuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gb3B0aW9ucy5lcnJvclRyYW5zZm9ybWVyIC0gdHJhbnNmb3JtIGVycm9yIGJlZm9yZSBwcmludFxuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUxvZ2dlcigpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIF9vcHRpb25zJGxldmVsID0gb3B0aW9ucy5sZXZlbDtcbiAgdmFyIGxldmVsID0gX29wdGlvbnMkbGV2ZWwgPT09IHVuZGVmaW5lZCA/IFwibG9nXCIgOiBfb3B0aW9ucyRsZXZlbDtcbiAgdmFyIF9vcHRpb25zJGxvZ2dlciA9IG9wdGlvbnMubG9nZ2VyO1xuICB2YXIgbG9nZ2VyID0gX29wdGlvbnMkbG9nZ2VyID09PSB1bmRlZmluZWQgPyB3aW5kb3cuY29uc29sZSA6IF9vcHRpb25zJGxvZ2dlcjtcbiAgdmFyIF9vcHRpb25zJGxvZ0Vycm9ycyA9IG9wdGlvbnMubG9nRXJyb3JzO1xuICB2YXIgbG9nRXJyb3JzID0gX29wdGlvbnMkbG9nRXJyb3JzID09PSB1bmRlZmluZWQgPyB0cnVlIDogX29wdGlvbnMkbG9nRXJyb3JzO1xuICB2YXIgY29sbGFwc2VkID0gb3B0aW9ucy5jb2xsYXBzZWQ7XG4gIHZhciBwcmVkaWNhdGUgPSBvcHRpb25zLnByZWRpY2F0ZTtcbiAgdmFyIF9vcHRpb25zJGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbjtcbiAgdmFyIGR1cmF0aW9uID0gX29wdGlvbnMkZHVyYXRpb24gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX29wdGlvbnMkZHVyYXRpb247XG4gIHZhciBfb3B0aW9ucyR0aW1lc3RhbXAgPSBvcHRpb25zLnRpbWVzdGFtcDtcbiAgdmFyIHRpbWVzdGFtcCA9IF9vcHRpb25zJHRpbWVzdGFtcCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IF9vcHRpb25zJHRpbWVzdGFtcDtcbiAgdmFyIHRyYW5zZm9ybWVyID0gb3B0aW9ucy50cmFuc2Zvcm1lcjtcbiAgdmFyIF9vcHRpb25zJHN0YXRlVHJhbnNmbyA9IG9wdGlvbnMuc3RhdGVUcmFuc2Zvcm1lcjtcbiAgdmFyIC8vIGRlcHJlY2F0ZWRcbiAgc3RhdGVUcmFuc2Zvcm1lciA9IF9vcHRpb25zJHN0YXRlVHJhbnNmbyA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9IDogX29wdGlvbnMkc3RhdGVUcmFuc2ZvO1xuICB2YXIgX29wdGlvbnMkYWN0aW9uVHJhbnNmID0gb3B0aW9ucy5hY3Rpb25UcmFuc2Zvcm1lcjtcbiAgdmFyIGFjdGlvblRyYW5zZm9ybWVyID0gX29wdGlvbnMkYWN0aW9uVHJhbnNmID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoYWN0bikge1xuICAgIHJldHVybiBhY3RuO1xuICB9IDogX29wdGlvbnMkYWN0aW9uVHJhbnNmO1xuICB2YXIgX29wdGlvbnMkZXJyb3JUcmFuc2ZvID0gb3B0aW9ucy5lcnJvclRyYW5zZm9ybWVyO1xuICB2YXIgZXJyb3JUcmFuc2Zvcm1lciA9IF9vcHRpb25zJGVycm9yVHJhbnNmbyA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9IDogX29wdGlvbnMkZXJyb3JUcmFuc2ZvO1xuICB2YXIgX29wdGlvbnMkY29sb3JzID0gb3B0aW9ucy5jb2xvcnM7XG4gIHZhciBjb2xvcnMgPSBfb3B0aW9ucyRjb2xvcnMgPT09IHVuZGVmaW5lZCA/IHtcbiAgICB0aXRsZTogZnVuY3Rpb24gdGl0bGUoKSB7XG4gICAgICByZXR1cm4gXCIjMDAwMDAwXCI7XG4gICAgfSxcbiAgICBwcmV2U3RhdGU6IGZ1bmN0aW9uIHByZXZTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBcIiM5RTlFOUVcIjtcbiAgICB9LFxuICAgIGFjdGlvbjogZnVuY3Rpb24gYWN0aW9uKCkge1xuICAgICAgcmV0dXJuIFwiIzAzQTlGNFwiO1xuICAgIH0sXG4gICAgbmV4dFN0YXRlOiBmdW5jdGlvbiBuZXh0U3RhdGUoKSB7XG4gICAgICByZXR1cm4gXCIjNENBRjUwXCI7XG4gICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24gZXJyb3IoKSB7XG4gICAgICByZXR1cm4gXCIjRjIwNDA0XCI7XG4gICAgfVxuICB9IDogX29wdGlvbnMkY29sb3JzO1xuXG4gIC8vIGV4aXQgaWYgY29uc29sZSB1bmRlZmluZWRcblxuICBpZiAodHlwZW9mIGxvZ2dlciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHRyYW5zZm9ybWVyKSB7XG4gICAgY29uc29sZS5lcnJvcihcIk9wdGlvbiAndHJhbnNmb3JtZXInIGlzIGRlcHJlY2F0ZWQsIHVzZSBzdGF0ZVRyYW5zZm9ybWVyIGluc3RlYWRcIik7XG4gIH1cblxuICB2YXIgbG9nQnVmZmVyID0gW107XG4gIGZ1bmN0aW9uIHByaW50QnVmZmVyKCkge1xuICAgIGxvZ0J1ZmZlci5mb3JFYWNoKGZ1bmN0aW9uIChsb2dFbnRyeSwga2V5KSB7XG4gICAgICB2YXIgc3RhcnRlZCA9IGxvZ0VudHJ5LnN0YXJ0ZWQ7XG4gICAgICB2YXIgYWN0aW9uID0gbG9nRW50cnkuYWN0aW9uO1xuICAgICAgdmFyIHByZXZTdGF0ZSA9IGxvZ0VudHJ5LnByZXZTdGF0ZTtcbiAgICAgIHZhciBlcnJvciA9IGxvZ0VudHJ5LmVycm9yO1xuICAgICAgdmFyIHRvb2sgPSBsb2dFbnRyeS50b29rO1xuICAgICAgdmFyIG5leHRTdGF0ZSA9IGxvZ0VudHJ5Lm5leHRTdGF0ZTtcblxuICAgICAgdmFyIG5leHRFbnRyeSA9IGxvZ0J1ZmZlcltrZXkgKyAxXTtcbiAgICAgIGlmIChuZXh0RW50cnkpIHtcbiAgICAgICAgbmV4dFN0YXRlID0gbmV4dEVudHJ5LnByZXZTdGF0ZTtcbiAgICAgICAgdG9vayA9IG5leHRFbnRyeS5zdGFydGVkIC0gc3RhcnRlZDtcbiAgICAgIH1cbiAgICAgIC8vIG1lc3NhZ2VcbiAgICAgIHZhciBmb3JtYXR0ZWRBY3Rpb24gPSBhY3Rpb25UcmFuc2Zvcm1lcihhY3Rpb24pO1xuICAgICAgdmFyIHRpbWUgPSBuZXcgRGF0ZShzdGFydGVkKTtcbiAgICAgIHZhciBpc0NvbGxhcHNlZCA9IHR5cGVvZiBjb2xsYXBzZWQgPT09IFwiZnVuY3Rpb25cIiA/IGNvbGxhcHNlZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgICB9LCBhY3Rpb24pIDogY29sbGFwc2VkO1xuXG4gICAgICB2YXIgZm9ybWF0dGVkVGltZSA9IGZvcm1hdFRpbWUodGltZSk7XG4gICAgICB2YXIgdGl0bGVDU1MgPSBjb2xvcnMudGl0bGUgPyBcImNvbG9yOiBcIiArIGNvbG9ycy50aXRsZShmb3JtYXR0ZWRBY3Rpb24pICsgXCI7XCIgOiBudWxsO1xuICAgICAgdmFyIHRpdGxlID0gXCJhY3Rpb24gXCIgKyBmb3JtYXR0ZWRBY3Rpb24udHlwZSArICh0aW1lc3RhbXAgPyBmb3JtYXR0ZWRUaW1lIDogXCJcIikgKyAoZHVyYXRpb24gPyBcIiBpbiBcIiArIHRvb2sudG9GaXhlZCgyKSArIFwiIG1zXCIgOiBcIlwiKTtcblxuICAgICAgLy8gcmVuZGVyXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoaXNDb2xsYXBzZWQpIHtcbiAgICAgICAgICBpZiAoY29sb3JzLnRpdGxlKSBsb2dnZXIuZ3JvdXBDb2xsYXBzZWQoXCIlYyBcIiArIHRpdGxlLCB0aXRsZUNTUyk7ZWxzZSBsb2dnZXIuZ3JvdXBDb2xsYXBzZWQodGl0bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjb2xvcnMudGl0bGUpIGxvZ2dlci5ncm91cChcIiVjIFwiICsgdGl0bGUsIHRpdGxlQ1NTKTtlbHNlIGxvZ2dlci5ncm91cCh0aXRsZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZyh0aXRsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb2xvcnMucHJldlN0YXRlKSBsb2dnZXJbbGV2ZWxdKFwiJWMgcHJldiBzdGF0ZVwiLCBcImNvbG9yOiBcIiArIGNvbG9ycy5wcmV2U3RhdGUocHJldlN0YXRlKSArIFwiOyBmb250LXdlaWdodDogYm9sZFwiLCBwcmV2U3RhdGUpO2Vsc2UgbG9nZ2VyW2xldmVsXShcInByZXYgc3RhdGVcIiwgcHJldlN0YXRlKTtcblxuICAgICAgaWYgKGNvbG9ycy5hY3Rpb24pIGxvZ2dlcltsZXZlbF0oXCIlYyBhY3Rpb25cIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMuYWN0aW9uKGZvcm1hdHRlZEFjdGlvbikgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgZm9ybWF0dGVkQWN0aW9uKTtlbHNlIGxvZ2dlcltsZXZlbF0oXCJhY3Rpb25cIiwgZm9ybWF0dGVkQWN0aW9uKTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGlmIChjb2xvcnMuZXJyb3IpIGxvZ2dlcltsZXZlbF0oXCIlYyBlcnJvclwiLCBcImNvbG9yOiBcIiArIGNvbG9ycy5lcnJvcihlcnJvciwgcHJldlN0YXRlKSArIFwiOyBmb250LXdlaWdodDogYm9sZFwiLCBlcnJvcik7ZWxzZSBsb2dnZXJbbGV2ZWxdKFwiZXJyb3JcIiwgZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29sb3JzLm5leHRTdGF0ZSkgbG9nZ2VyW2xldmVsXShcIiVjIG5leHQgc3RhdGVcIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMubmV4dFN0YXRlKG5leHRTdGF0ZSkgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgbmV4dFN0YXRlKTtlbHNlIGxvZ2dlcltsZXZlbF0oXCJuZXh0IHN0YXRlXCIsIG5leHRTdGF0ZSk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxvZ2dlci5ncm91cEVuZCgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dnZXIubG9nKFwi4oCU4oCUIGxvZyBlbmQg4oCU4oCUXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGxvZ0J1ZmZlci5sZW5ndGggPSAwO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIGdldFN0YXRlID0gX3JlZi5nZXRTdGF0ZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIC8vIGV4aXQgZWFybHkgaWYgcHJlZGljYXRlIGZ1bmN0aW9uIHJldHVybnMgZmFsc2VcbiAgICAgICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgPT09IFwiZnVuY3Rpb25cIiAmJiAhcHJlZGljYXRlKGdldFN0YXRlLCBhY3Rpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsb2dFbnRyeSA9IHt9O1xuICAgICAgICBsb2dCdWZmZXIucHVzaChsb2dFbnRyeSk7XG5cbiAgICAgICAgbG9nRW50cnkuc3RhcnRlZCA9IHRpbWVyLm5vdygpO1xuICAgICAgICBsb2dFbnRyeS5wcmV2U3RhdGUgPSBzdGF0ZVRyYW5zZm9ybWVyKGdldFN0YXRlKCkpO1xuICAgICAgICBsb2dFbnRyeS5hY3Rpb24gPSBhY3Rpb247XG5cbiAgICAgICAgdmFyIHJldHVybmVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChsb2dFcnJvcnMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuZWRWYWx1ZSA9IG5leHQoYWN0aW9uKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dFbnRyeS5lcnJvciA9IGVycm9yVHJhbnNmb3JtZXIoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybmVkVmFsdWUgPSBuZXh0KGFjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dFbnRyeS50b29rID0gdGltZXIubm93KCkgLSBsb2dFbnRyeS5zdGFydGVkO1xuICAgICAgICBsb2dFbnRyeS5uZXh0U3RhdGUgPSBzdGF0ZVRyYW5zZm9ybWVyKGdldFN0YXRlKCkpO1xuXG4gICAgICAgIHByaW50QnVmZmVyKCk7XG5cbiAgICAgICAgaWYgKGxvZ0VudHJ5LmVycm9yKSB0aHJvdyBsb2dFbnRyeS5lcnJvcjtcbiAgICAgICAgcmV0dXJuIHJldHVybmVkVmFsdWU7XG4gICAgICB9O1xuICAgIH07XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlTG9nZ2VyOyJdfQ==