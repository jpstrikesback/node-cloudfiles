/*
 * storage-object.js: Instance of a single rackspace cloudserver
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */

require.paths.unshift(require('path').join(__dirname, '..'));

var cloudfiles = require('cloudfiles'),
    eyes = require('eyes'),
    sys = require('sys'),
    utils = require('./utils');
 
var StorageObject = function (details) {
  if (!details) {
    throw new Error("StorageObject must be constructed with at least basic details.")
  }
  
  this._setProperties(details);
};

function clone(obj) {
  var clone = {};
  for (var i in obj) {
    clone[i] = obj[i];
  }
  return clone;
}

StorageObject.prototype = {
  // Remark: Not fully implemented
  addMetadata: function (metadata, callback) {
    var newMetadata = clone(this.metadata);
    Object.keys(metadata).forEach(function (key) {
      newMetadata[key] = metadata[key];
    });
    
    var options = {
      uri: this.fullPath,
      method: 'POST', 
      headers: this._createHeaders(newMetadata) 
    };
    
    utils.rackspace(options, callback, function (body, res) {
      this.metadata = newMetadata;
      callback(null, true);
    });
  },
  
  // Remark: This method is untested
  copy: function (container, destination, callback) {
    var copyOptions = {
      method: 'PUT',
      uri: this.fullPath,
      headers: {
        'X-COPY-DESTINATION': [container, destination].join('/'),
        'CONTENT-LENGTH': this.bytes
      }
    };
    
    utils.rackspace(copyOptions, callback, function (body, res) {
      callback(null, true);
    });
  },
  
  destroy: function (callback) {
    cloudfiles.destroyFile(this.containerName, this.name, callback);
  },
  
  // Remark: Not fully implemented
  getMetadata: function (callback) {
    utils.rackspace('HEAD', this.fullPath, function (body, res) {
      var metadata = {};
      Object.keys(res.headers).forEach(function (header) {
        var match;
        if (match = header.match(/x-object-meta-(\w+)/i)) {
          metadata[match[1]] = res.headers[header];
        }
      });
      
      callback(null, metadata);
    });
  },
  
  // Remark: Not fully implemented
  removeMetadata: function (keys, callback) {
    var newMetadata = {};
    Object.keys(this.metadata).forEach(function (key) {
      if (keys.indexOf(key) !== -1) {
        newMetadata[key] = this.metadata[key];
      }
    });
    
    // TODO: Finish writing this method
  },
  
  update: function (data, callback) {
    
  },
  
  get fullPath() {
    return utils.storageUrl(this.containerName, this.name);
  },
  
  get containerName() {
    return this.container instanceof cloudfiles.Container ? this.container.name : this.container; 
  },
  
  _setProperties: function (details) {
    // TODO: Should probably take this in from details or something.
    this.metadata = {};
    
    this.container = details.container;
    this.name = details.name;
    this.hash = details.hash;
    this.bytes = details.bytes;
    this.data = details.data;
    this.contentType = details.content_type;
    this.lastModified = details.last_modified;
  },
  
  _createHeaders: function (metadata) {
    var headers = {};
    Object.keys(metadata).forEach(function (key) {
      var header = "x-object-meta-" + key;
      headers[header] = metadata[key];
    });
    
    return headers;
  }
};

exports.StorageObject = StorageObject;