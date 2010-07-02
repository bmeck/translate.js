// Andrew Lunny and Marak Squires
// Mit yo, copy paste us some credit
var sys=require('sys')

// stupid if else statement, i felt like actually making his library dual-sided instead of bashing my head against gemini.js
if(typeof exports === 'undefined'){
  // simple fn to get the path given text to translate
  var getLanguagePair = function (lang, text, callback) {

    // set the default input and output languages to English and Spanish
    var input = languages[lang.input] || false,
    output = languages[lang.output] || 'en';
    sys.puts(output)

    if(input) {
      callback([''
              ,encodeURIComponent(text)
              ,'&langpair=' + input + '|' + output].join(""))
      callback(input,output)
    }
    else {
      $.ajax({
          url:['http://ajax.googleapis.com/ajax/services/language/detect?v=1.0&q='
            ,encodeURIComponent(text)].join('')
          ,dataType: 'json'
          ,success: function(rsp) {
            input=rsp.responseData.language
            callback(input,output)
          }
        }
      )
    }
  }


  var translate = {
    text: function( lang, text, callback) {

      // this is not a good curry recipe. needs moar spice
      if(typeof lang !== 'object'){
        callback = text;
        text = lang;
      }
      getLanguagePair(lang,text,function(input,output){
        $.ajax({
          url: ['http://ajax.googleapis.com/ajax/services/language/translate?v=1.0&q='
              ,encodeURIComponent(text)
              ,'&langpair=' + input + '|' + output].join(""),
          dataType: 'json',
          success: function(rsp){
            callback(rsp.responseData.translatedText);
          }
        })
      })
    }
  };


}
else{

  var sys = require('sys')
    , http = require('http');

  var languages = require('./languages').getLangs();
  var translates = exports;

  // http client for accessing google api
  var googleTranslate = http.createClient(80, 'ajax.googleapis.com');

  // simple fn to get the path given text to translate
  var getLanguagePair = function (lang, text, callback) {

    // set the default input and output languages to English and Spanish
    var input = languages[lang.input] || false,
    output = languages[lang.output] || 'en';
    if(input) {
      callback([''
              ,encodeURIComponent(text)
              ,'&langpair=' + input + '|' + output].join(""))
      callback(input,output)
    }
    else {
      var req=googleTranslate.request('GET',
          ['http://ajax.googleapis.com/ajax/services/language/detect?v=1.0&q='
          ,encodeURIComponent(text)].join('')
        ,{'host': 'ajax.googleapis.com', 'encoding':'utf-8'}
      )
      req.addListener('response', function (response) {
        var responseBody = "";
        response.addListener('data', function (chunk) {
          responseBody += chunk;
        });
        response.addListener('end', function () {
          var bodyObj = JSON.parse(responseBody);
          if (bodyObj.responseStatus === 200) {
            input=bodyObj.responseData.language
            callback(input,output);
          } else {
            sys.debug("Translate API call failed");
          }
        });
      });
      req.end();
    }
  }

  // translate the text
  exports.text = function (lang, text, callback) {
    // this is not a good curry recipe. needs moar spice
    if(typeof lang !== 'object'){
      callback = text;
      text = lang;
    }
    getLanguagePair(lang,text,function(input,output) {
      var req = googleTranslate.request('GET', [
          'http://ajax.googleapis.com/ajax/services/language/translate?v=1.0&q='
          ,encodeURIComponent(text)
          ,'&langpair=' + input + '|' + output].join(""),
        {'host': 'ajax.googleapis.com', 'encoding':'utf-8'});
      req.addListener('response', function (response) {
        var responseBody = "";
        response.addListener('data', function (chunk) {
          responseBody += chunk;
        });
        response.addListener('end', function () {
          var bodyObj = JSON.parse(responseBody);
          if (bodyObj.responseStatus === 200) {
            callback(bodyObj.responseData.translatedText);
          } else {
            sys.debug("Translate API call failed");
          }
        });
      });
      req.end();
    })
  }




}
