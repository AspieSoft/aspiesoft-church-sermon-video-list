/*
The MIT License

Copyright (c) 2020 aspiesoftweb@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

;(function($){

	const urlParams = new URLSearchParams(window.location.search);
	const dateParam = (function(){
		let date = urlParams.get('date') || urlParams.get('d');
		if(!date || date.toString().trim() === ''){return null;}
		return date.replace(/[^0-9-]/gs, '-').replace(/--/gs, '-');
	})();

	(function(){
		let cssAnimation = '@keyframes video-list-rotate-gradient {';
		for(let i = 0; i <= 100; i++){
			cssAnimation += i+'% {background: radial-gradient(ellipse at top, #052330, transparent), radial-gradient(ellipse at bottom, #4a4a4a, transparent), linear-gradient('+(3.6*i)+'deg, #5c5c5c, #242424);}';
		}
		cssAnimation += '}';
		$('head').append('<style>'+cssAnimation+'</style>');
	})();

	function simplifySearchTerms(str){
		str = str.toLowerCase(); // make everything lowercase
		str = str.replace(/[!?\.,"'`]/g, ''); // remove basic punctuation

		// spelling simplifications
		str = str.replace(/([a-z])\1/g, '$1'); // remove double letters
		str = str.replace(/[aeiou][a-z][aeiou]/g, 'a'); // match nearby vowels
		str = str.replace(/ph/g, 'f'); // phonetic ph to f
		str = str.replace(/ie/g, 'i'); // phonetic ie to i
		str = str.replace(/er/g, 'r'); // phonetic er to r
		str = str.replace(/ed/g, 'd'); // phonetic ed to d
		str = str.replace(/c[^eiy]/g, 'k'); // similar c to k sound
		str = str.replace(/qu/g, 'k'); // sometimes similar qu to k sound

		return str;
	}

	/*const iframeContainer = $('.video-list-iframe-container');
	iframeContainer.css('height', (iframeContainer.width()*9/16)+'px');
	$(window).on('resize', function(){
		iframeContainer.css('height', (iframeContainer.width()*9/16)+'px');
	});*/

	const iframe = $('.video-list-iframe');

	$(document).on('click', '.video-list-item', function(e){
		e.preventDefault();
		let url = $(this).attr('href');
		if(!url || url === ''){
			alert('Error: Video Not Found');
			return;
		}
		if(url.includes('<iframe')){
			url = url.replace(/<iframe .*?src=(["'])(.*?)\1.*?>.*?<\/iframe>/, '$2');
		}

		let facebook = false;
		if(url.includes('facebook.com')){
			let query = url.substring(url.indexOf('?')+1).split('&');
			facebook = {};
			for(let i = 0; i < query.length; i++){
				if(query[i].startsWith('width')){
					facebook.width = Number(query[i].substring(query[i].indexOf('=')+1).replace(/[^0-9.]/gs, ''));
				}else if(query[i].startsWith('height')){
					facebook.height = Number(query[i].substring(query[i].indexOf('=')+1).replace(/[^0-9.]/gs, ''));
				}
			}
		}

		if(url.includes('?')){url += '&autoplay=1&mute=0';}
		else{url += '?autoplay=1&mute=0';}
		iframe.attr('src', url);

		if(facebook){
			if(!facebook.width){facebook.width = 267;}
			if(!facebook.height){
				if(facebook.width < 300){
					facebook.height = facebook.width*16/9;
				}else{
					facebook.height = facebook.width*9/16;
				}
			}
			iframe.attr('width', facebook.width);
			iframe.attr('height', facebook.height);
		}else{
			iframe.attr('width', '100%');
			iframe.attr('height', '100%');
			setTimeout(function(){
				iframe.attr('height', (iframe.width()*9/16));
			}, 10);
		}

		let name = $(this).html() || '';
		$('.video-list-current-name').html(''+name+'');
		
		let videoDate = $('.video-list-item-date', this).text();
		if(!videoDate){videoDate = $(this).text();}
		if(!videoDate.match(/^[0-9]+\-[0-9]+\-[0-9]+$/)){videoDate = false;}

		if(videoDate){
			let url = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
			let newUrl = url+'?date='+videoDate.toString().replace(/[^0-9-]/gs, '-').replace(/--/gs, '-');

			replaceUrl(newUrl);
		}

		$('.video-list-search').val('').trigger('input');
	});

	$(document).on('input', '.video-list-search', function(){
		let searchValue = simplifySearchTerms(this.value.toLowerCase().replace(/&(amp;|)/g, ' and ').replace(/  /g, ' '));
		$('.video-list-item', '.video-list').each(function(){
			if(!searchValue || searchValue.trim() === ''){
				$(this).css('display', '');
				return;
			}

			let name = simplifySearchTerms(this.innerHTML.replace(/<.*?>.*?<\/.*?>/gsi, '').toLowerCase().replace(/&(amp;|)/g, ' and ').replace(/  /g, ' '));
			let date = simplifySearchTerms($(this).attr('date').toLowerCase().replace(/[\/\\]/gs, '-').replace(/&(amp;|)/g, ' and ').replace(/  /g, ' '));
			let scripture = $(this).attr('scripture');
			if(scripture){
				scripture = simplifySearchTerms(scripture.replace(/<.*?>.*?<\/.*?>/gsi, '').toLowerCase().replace(/&(amp;|)/g, ' and ').replace(/  /g, ' '));
			}

			let showElm = false;

			let isByDate = false;
			if(searchValue.match(/^[0-9]+\s*?[\/\\\-]\s*?[0-9]+\s*?([\/\\\-]\s*?[0-9]+|)$/)){
				isByDate = true;
			}

			let value = searchValue.replace(/[\/\\]/gs, '-').replace(/ /gs, '');
			if(date.includes(value)){
				showElm = true;
			}
			if(!showElm && isByDate){
				date = date.split('-');
				value = value.split('-');
				if((!(date[0] && value[0]) || Number(date[0]) === Number(value[0])) && (!(date[1] && value[1]) || Number(date[1]) === Number(value[1])) && (!(date[2] && value[2]) || Number(date[2]) === Number(value[2]) || Number(date[2].replace('20', '')) === Number(value[2]))){
					showElm = true;
				}else if((!(date[0] && value[1]) || Number(date[0]) === Number(value[1])) && (!(date[1] && value[0]) || Number(date[1]) === Number(value[0])) && (!(date[2] && value[2]) || Number(date[2]) === Number(value[2]) || Number(date[2].replace('20', '')) === Number(value[2]))){
					showElm = true;
				}
			}

			if(!showElm && !isByDate){
				if(scripture && (scripture.includes(value) || scripture.includes(searchValue))){
					showElm = true;
				}

				if(!showElm && (name.includes(value) || name.includes(searchValue))){
					showElm = true;
				}

				if(!showElm){
					let matchNameCount = 0;
					let nameValue = searchValue.split(/[ :-]/);

					if(scripture){
						let scriptureWords = scripture.split(/[ :]/);

						for(let i = 0; i < scriptureWords.length; i++){
							let checkNumberRange = false;
							if(scriptureWords[i].match(/^([0-9]+)\-([0-9]+)$/g)){
								checkNumberRange = scriptureWords[i].replace(/([0-9]+)\-([0-9]+)/g, function(str, n1, n2){
									if(n1 === n2){return str;}
									n1 = Number(n1); n2 = Number(n2);
									if(n1 === NaN || n2 === NaN){return str;}
									if(n1 > n2){
										let nt = n1;
										n1 = n2; n2 = nt;
									}
									let result = [];
									for(let i = n1; i <= n2; i++){
										result.push(i.toString());
									}
									return result.join('-');
								}).split(/[-]/);
							}
							for(let v = 0; v < nameValue.length; v++){
								if(scriptureWords[i].includes(nameValue[v]) || (checkNumberRange && checkNumberRange.includes(nameValue[v]))){
									matchNameCount++;
									break;
								}
							}
						}
						if(matchNameCount >= nameValue.length){
							showElm = true;
						}
					}

					if(!showElm){
						let nameWords = name.split(/[ :-]/);

						for(let i = 0; i < nameWords.length; i++){
							for(let v = 0; v < nameValue.length; v++){
								if(nameWords[i].includes(nameValue[v])){
									matchNameCount++;
									break;
								}
							}
						}

						if(matchNameCount >= nameValue.length){
							showElm = true;
						}
					}
				}
			}

			if(showElm){
				$(this).css('display', '');
			}else{
				$(this).css('display', 'none');
			}

		});
	});

	$(document).ready(function(){

		$('.video-list').on('scroll', function(){
			if(this.scrollTop > 0){
				$(this).css('box-shadow', 'inset 0 7px 3px -3px rgba(0, 0, 0, 0.3)');
			}else{
				$(this).css('box-shadow', '');
			}
		});

		$('.video-list-item').each(function(){
			if($(this).parent().hasClass('video-list') || $(this).parent().parent().hasClass('video-list')){
				$(this).html($(this).html().replace(/&amp;amp;/g, '&amp;'));
			}else{
				// fix for bug with duplicates outside list (may be caused by theme)
				$(this).remove();
			}
		});

		let index = false;
		if(dateParam){
			$('.video-list-item').each(function(i){
				if(index === false && $('.video-list-item-date', this).text() === dateParam){
					index = i;
				}
			});
		}
		if(index === false || typeof index !== 'number'){index = 0;}

		$('.video-list-item').get(index).click();
	});

})(jQuery);

const replaceUrl = (function(){
	//let replaceMode = 0;
	return function(url){
		if(url === window.location.href){return;}
		setTimeout(function(){
			window.history.replaceState(window.history.state, '', url);
		}, 1000);
	}
})();
