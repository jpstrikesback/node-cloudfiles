/*
 * container-test.js: Tests for rackspace cloudfiles containers
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */
 
var path = require('path'),
    vows = require('vows'),
    eyes = require('eyes'),
    fs = require('fs'),
    helpers = require('./helpers')
    assert = require('assert');
    
require.paths.unshift(path.join(__dirname, '..', 'lib'));

var cloudfiles = require('cloudfiles');

var sampleData = fs.readFileSync(path.join(__dirname, '..', 'test', 'data', 'fillerama.txt')).toString(),
    testData = {};

vows.describe('node-cloudfiles/storage-object').addBatch({
  "The node-cloudfiles client": {
    "when authenticated": {
      topic: function () {
        var options = cloudfiles.config
        cloudfiles.setAuth(options.auth, this.callback);
      },
      "should return with 204": function (err, res) {
        assert.equal(res.statusCode, 204);
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the addFile() method": {
      topic: function () {
        cloudfiles.addFile('test_container', 'file1.txt', sampleData, this.callback);
      },
      "should respond with true": function (err, uploaded) {
        assert.isTrue(uploaded);
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the getFile() method": {
      "for a file that exists": {
        topic: function () {
          cloudfiles.getFile('test_container', 'file1.txt', this.callback);
        },
        "should return a valid StorageObject": function (err, file) {
          assert.equal(file.data.length, sampleData.length);
          helpers.assertFile(file);
          testData.file = file;
        }
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the addMetadata() method": {
      topic: function () {
        testData.file.addMetadata({ "ninja": "true" }, this.callback); 
      },
      "should response with true": function (err, added) {
        assert.isTrue(added);
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the getMetadata() method": {
      topic: function () {
        testData.file.getMetadata(this.callback); 
      },
      "should response with true": function (err, added) {
        assert.isTrue(added);
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the destroyFile() method": {
      "for a file that exists": {
        topic: function () {
          cloudfiles.destroyFile('test_container', 'file1.txt', this.callback);
        },
        "should return true": function (err, deleted) {
          assert.isTrue(deleted);
        }
      }
    }
  }
}).export(module);