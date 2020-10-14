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

	const replaceUrl = (function(){
		//let replaceMode = 0;
		return function(url){
			if(url === window.location.href){return;}
			setTimeout(function(){
				window.history.replaceState(window.history.state, '', url);
			}, 1000);
		}
	})();

  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = (function(){
    let date = urlParams.get('date') || urlParams.get('d');
    if(!date || date.toString().trim() === ''){return null;}
    return date.replace(/[^0-9-]/gs, '-').replace(/--/gs, '-');
  })();

  (function(){
    let cssAnimation = '@keyframes video-list-rotate-gradient {';
    for(let i = 0; i <= 100; i++){
      cssAnimation += `${i}% {
        background:
          radial-gradient(ellipse at top, #052330, transparent), /* light #052330 #132f80 */
          radial-gradient(ellipse at bottom, #4a4a4a, transparent), /* dark #4a4a4a #050536 */
          linear-gradient(${3.6*i}deg, #5c5c5c, #242424);
      }`;
    }
    cssAnimation += '}';
    $('head').append('<style>'+cssAnimation.replace(/[\r\n]|\/\*.*?\*\//gs, '').replace(/([^A-Za-z0-9])\s/, '$1')+'</style>');
  })();

  function simplifySearchTerms(str){
    str = str.toLowerCase(); // make everything lowercase
    str = str.replace(/[!?\.,"'`]/g, ''); // remove basic punctuation

    return str;
  }

  function simplifySpelling(str){
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

  function similarity(s1, s2){
    var longer = s1;
    var shorter = s2;
    if(s1.length < s2.length){
    longer = s2;
    shorter = s1;
    }
    var longerLength = longer.length;
    if(longerLength === 0){
    return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }
  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
      costs[j] = j;
      else {
      if (j > 0) {
        var newValue = costs[j - 1];
        if (s1.charAt(i - 1) != s2.charAt(j - 1))
        newValue = Math.min(Math.min(newValue, lastValue),
          costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
    }
    return costs[s2.length];
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

  const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const monthPrefixes = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

  $(document).on('input', '.video-list-search', function(){
    let searchValue = simplifySearchTerms(this.value.toLowerCase().replace(/&(amp;|)/g, ' and ').replace(/  /g, ' '));
    $('.video-list-item', '.video-list').each(function(){
      if(!searchValue || searchValue.trim() === ''){
        $(this).css('display', '');
        return;
      }

			let name = simplifySearchTerms(this.innerHTML.replace(/<.*?>.*?<\/.*?>/gsi, '').toLowerCase().replace(/&(amp;|)/g, ' and ').replace(/  /g, ' '));

			let date = simplifySearchTerms($(this).attr('date').toLowerCase().replace(/[\/\\]/gs, '-').replace(/&(amp;|)/g, ' and ').replace(/  /g, ' '));
			let dateParts = [];
			if(date){
				date = date.replace(/([0-9a-z]+)(?:\s*[\/\\\-,]\s*|\s)([0-9]+)(?:(?:\s*[\/\\\-,]\s*|\s)([0-9]+)|)/, function(str, num1, num2, num3){
					if(!num1.match(/^[0-9]+$/)){
						num1 = monthNames.indexOf(num1);
						if(num1 === -1){
							num1 = monthPrefixes.indexOf(num1);
						}
						if(num1 !== -1){
							num1++;
						}else{
							return;
						}
					}

					dateParts = [num1, num2, num3];
					return num1+'-'+num2+'-'+num3;
				});
			}

			let scripture = $(this).attr('scripture');
			let scriptureParts = [];
      if(scripture){
				scripture = simplifySearchTerms(scripture.replace(/<.*?>.*?<\/.*?>/gsi, '').toLowerCase().replace(/&(amp;|)/g, ' and ').replace(/  /g, ' '));
				scripture.replace(/([0-9]*)\s*([\w\-]+)\s*([0-9]+)\s*:\s*([0-9]+)(?:\s*\-\s*([0-9]+)|)/, function(str, name1, name2, verse1, verse2, verse3){
					if(name1){name2 = name1+' '+name2;}
					scriptureParts = [name2, verse1, verse2, verse3];
				});
      }

			let showElm = undefined;
			
			// check scripture for match
			if(showElm === undefined){
				searchValue.replace(/([0-9]*)\s*([\w\-]+)(?:\s*([0-9]+)(?:\s*:\s*([0-9]+)(?:\s*\-\s*([0-9]+)|)|)|)/, function(str, name1, name2, verse1, verse2, verse3){
					if(name1){name2 = name1+' '+name2;}
					if(verse1 === ''){verse1 = undefined;}
					if(verse2 === ''){verse2 = undefined;}
					if(verse3 === ''){verse3 = undefined;}

					if(!(scriptureParts[0] === name2 || scriptureParts[0].includes(name2) || similarity(scriptureParts[0], name2) > 0.75)){
						return;
					}

					if(verse1 && scriptureParts[1] === verse1){
						if(verse2 && verse3 && scriptureParts[2] === verse2 && scriptureParts[3] === verse3){
							showElm = true;
						}else if(verse2 && !verse3 && Number(verse2) >= Number(scriptureParts[2]) && Number(verse2) <= Number(scriptureParts[3])){
							showElm = true;
						}else if(!verse2 && !verse3){
							showElm = true;
						}else if(verse2 && !verse3){
							let hasMatch = false;
							for(let i = Number(scriptureParts[2]); i <= Number(scriptureParts[3]); i++){
								if(i.toString().startsWith(verse2)){
									hasMatch = true;
									break;
								}
							}
							if(hasMatch){
								showElm = true;
							}else{
								showElm = false;
							}
						}else{
							showElm = false;
						}
					}else if(!verse1){
						showElm = true;
					}else if(verse1 && scriptureParts[1] !== verse1){
						showElm = false;
					}
				});
			}

			// check date for match
			if(showElm === undefined){
				searchValue.replace(/([0-9a-z]+)(?:\s*[\/\\\-,]\s*|\s)([0-9]+)(?:(?:\s*[\/\\\-,]\s*|\s)([0-9]+)|)/, function(str, num1, num2, num3){
					if(!num1.match(/^[0-9]+$/)){
						num1 = monthNames.indexOf(num1);
						if(num1 === -1){
							num1 = monthPrefixes.indexOf(num1);
						}
						if(num1 !== -1){
							num1++;
						}else{
							return;
						}
					}

					if(num3 === ''){num3 = undefined;}

					if(dateParts[0] === num1.toString() && dateParts[1].startsWith(num2) && (!num3 || dateParts[2].startsWith(num3))){
						showElm = true;
					}else{
						showElm = false;
					}
				});
			}

			// check date month for match
			if(showElm === undefined){
				searchValue.replace(/[a-z]+/g, function(str){
					if(showElm !== undefined){return;}

					let num = monthNames.indexOf(str);
					if(num === -1){
						num = monthPrefixes.indexOf(str);
					}
					if(num !== -1){
						num++;
						if(dateParts[0] === num.toString()){
							showElm = true;
						}else{
							showElm = false;
						}
					}
				});
			}

			// check name for match
			if(showElm === undefined){
				let searchArr = searchValue.split(' ').filter(v => {return v && v.trim() !== ''});
				let nameArr = name.split(' ').filter(v => {return v && v.trim() !== ''});

				let matchScore = 0, matchMax = Math.max(nameArr.length, searchArr.length);
				for(let i = 0; i < nameArr.length; i++){
					let score = 0;
					for(let j = 0; j < searchArr.length; j++){
						if(nameArr[i] === searchArr[j] || nameArr[i].includes(searchArr[j]) || similarity(nameArr[i], searchArr[j]) > 0.75){
							let s = matchMax-Math.abs(i - j);
							if(s > score){
								score = s;
							}
						}
					}
					matchScore += score;
				}

				if(matchScore >= (nameArr.length*searchArr.length)*2/3){
					showElm = true;
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
