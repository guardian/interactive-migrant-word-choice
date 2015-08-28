/**
 * Guardian visuals interactive project
 *
 * ./utils/analytics.js - Add Google analytics
 * ./utils/detect.js	- Device and env detection
 */
require('./utils/classList');
var Handlebars = require('handlebars/dist/cjs/handlebars');
var getJSON = require('./utils/getjson');
var template = require('./html/base.html');
var userAnswers = {};
var caseAnswers = {};
var data;
var header;

function boot(el) {

	var key = '1gblHjOmrLaYmaMItiCvQnuPybyDlKAL7q141bx7c4T8';
	var isLive = ( window.location.origin.search('interactive.guim.co.uk') || window.location.origin.search('preview.gutools.co.uk') > -1) ? false : true;
    var folder = (!isLive)? 'docsdata-test' : 'docsdata';

    header = document.querySelector('.content__head');
    if(!header){
    	header = document.querySelector('.article__header');
    }

    

    getJSON('https://interactive.guim.co.uk/' + folder + '/' + key + '.json', function(json){
    	render(el, json)
    });

}


function render(el, docData) {
	data = docData;

	Handlebars.registerHelper({
        'get_index': function(index) {
    	    return index + 1;
    	},
    	'get_responses': function(responses){

    		var value = '';
    		if(responses.length == 0){
    			return '';
    		}


    		if (responses.length ==1){
    			value = "The <strong>word you've chosen</strong> to use is "
			} else if (responses.length >1){
				value = "The <strong>words you've chosen</strong> to use include "
			}

    		for(var i = 0; i < responses.length; i ++){
    			value += responses[i];
    			
    				//include an and
    				if(responses.length > 2){
    					if( i < responses.length -2){
    						value += ', ';
    					}
    				}

	    			if( responses.length > 1 && i == responses.length - 2){
    					value += ' and ';
	    			}

    			
    		}

    		return value + '.';
    	},
    	'get_annotation': function(annotation){
    		return annotation.replace(/’/g, "'");
    	}
    });

	if(header){
		header.innerHTML = Handlebars.compile( 
                        require('./html/header.html'), 
                        { 
                            compat: true
                        }
                )(data);
	}
	

	

	data.examples.forEach(function(e){
		e.excerpt = e.excerpt.replace(/<div>/g, "<div class='gv-blank'>").replace(/\+\+\+/g, "<div class='gv-break-text'><div class='gv-break-line'></div></div>")
	})

	

	Handlebars.registerPartial({
        'excerpt': require('./html/excerpt.html')
    });

	var content = Handlebars.compile( 
                        require('./html/base.html'), 
                        { 
                            compat: true
                        }
                );
  	
  	el.innerHTML = content(data);

  	init(el);

  	updateTotal();
}

function init(el){

	var selectors = el.querySelectorAll('select');
	for(var s = 0; s < selectors.length; s ++){
		selectors[s].addEventListener('change', function(){
			var value = this.options[this.selectedIndex].value;
			var id = this.getAttribute('id').replace('gv-select-', '');
			

			document.getElementById('gv-user-choice-' + id).innerHTML = value;

			document.getElementById('gv-block-' + id).classList.add('gv-selected');

			var blanks = el.querySelectorAll('#gv-excerpt-' + id + ' .gv-blank span')
			for(var b = 0; b < blanks.length; b ++){
				var word = sanitizeWord(blanks[b].innerHTML);
				console.log(word)
				if(caseAnswers[value]){
					caseAnswers[value] += 1;
				} else {
					caseAnswers[value] = 1;
				}
			}
			if(userAnswers[value]){
				userAnswers[value] += 1;
			} else {
				userAnswers[value] = 1;
			}

			updateTotal();
		
		});
	}

}

function sanitizeWord(word){
	if(word.slice(word.length-1, word.length) == 's'){
		return word.slice(0,word.length-1);
	}
	return word
}

function updateTotal(){

	var responseData = {
		userAnswers: [],
		caseAnswers: [],
		actualWordsUsed: data.actualWordsUsed
	}

	for(var c in caseAnswers ){
		responseData.caseAnswers.push(c);
	}

	for(var u in userAnswers ){
		responseData.userAnswers.push(u);
	}


	var response = Handlebars.compile( 
                        require('./html/response.html'), 
                        { 
                            compat: true
                        }
                );
  	
  	document.getElementById('gv-response').innerHTML = response(responseData);

}


module.exports = { boot: boot };
