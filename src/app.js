var UI = require('ui');

function getPrayer(num, insert){
  switch (num) {
    case 0:  return {Title: 'Apostle\'s Creed', text: [
      'I believe in God, the Father Almighty, Creator of Heaven and earth;',
      'and in Jesus Christ, His only Son Our Lord, Who was conceived by the Holy',
      'Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was',
      'crucified, died, and was buried. He descended into Hell; the third',
      'day He rose again from the dead; He ascended into Heaven, and is seated',
      'at the right hand of God, the Father almighty; from thence He shall come',
      'to judge the living and the dead. I believe in the Holy Spirit, the holy',
      'Catholic Church, the communion of saints, the forgiveness of sins, the',
      'resurrection of the body and life everlasting. \nAmen'
    ]};
    case 1:  return {Title:'Our Father', text: [
      'Our Father, Who art in heaven, Hallowed be Thy Name. Thy Kingdom come.',
      'Thy Will be done, on Earth as it is in Heaven. Give us this day our daily bread. ',
      'And forgive us our trespasses, as we forgive those who trespass against us.',
      'And lead us not into temptation, but deliver us from evil. \nAmen.'
      ]};
    case 2:  return {Title: 'Hail Mary', text: [
      'Hail Mary, full of Grace, The Lord is with thee. Blessed art thou among women,',
      'and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, ',
      'pray for us sinners now, and at the hour of death. \nAmen.'
    ]};
    case 3:  return {Title: 'Glory Be', text:[
      'Glory be to the Father, and to the Son and to the Holy Spirit.',
      'As it was in the beginning, is now and will be forever. \nAmen'
    ]};
    case 4:  return {Title: 'Oh My Jesus', text:[
      'Oh my Jesus, forgive us our sins, save us from the fires of Hell and lead all souls',
      'to Heaven, especially those in most need of thine mercy.'
    ]};
    case 5:  return {Title: 'Hail Holy Queen', text:[
      'Hail Holy Queen, Mother of Mercy. Our life, our Sweetness and our Hope. To thee',
      'do we cry, poor banished children of Eve, To thee do we send up our sighs,',
      'mourning and weeping in this valley of tears. Turn then most gracious advocate, ',
      'thine eyes of mercy towards us. And after this our exile, show unto us,',
      'the blessed fruit of thy womb, Jesus. ',
      'Oh Clement, \noh Loving, \noh Sweet Virgin Mary. ',
      'Pray for us, oh most holy Mother of God. ',
      'That we may be made worthy, of the promises of Christ. \nAmen'
    ]};
    case 6:  return {Title: 'Oh Precious Blood and Water...', text:[
      'Oh precious blood and water, which gushed forth from the heart of jesus as a',
      'font of mercy for us, I trust in you.'
    ]};
    case 7:  return {Title: 'Eternal Father...', text:[
      'Eternal Father, I offer you the body, blood, soul and divinity of your dearly beloved',
      'son, our lord Jesus Christ In attonement for our sins, and those of the whole World.'
    ]};
    case 8:  return {Title: 'For the sake...', text:[
      'For the sake of his sorrowful passion, have mercy on us and on the whole World.'
    ]};
    case 9:  return {Title: 'Holy God...', text:[
      'Holy God, Holy Mighty One, Holy Immortal One.',
      'Have mercy on us and on the whole World'
    ]};
    case 10: return {Title: 'Jesus, I trust in you', text:[
      'Jesus, I trust in you'
    ]};
    case 12: return {Title: 'Closing Prayer', text: 
      getPrayer(3).text.concat(getPrayer(4).text, getPrayer(5).text)
    };
    case 13: return {Title: 'Sign of the Cross', text: [
      'In the name of The Father, and of The Son, and of the Holy Spirit. Amen'
    ]};
    case 14: return {Title: 'Opening Prayer', text: 
      getPrayer(6).text.concat(getPrayer(6).text, getPrayer(6).text)
    };  
    case 15: return {Title: 'Closing Prayer', text: 
      getPrayer(9).text.concat(getPrayer(9).text, getPrayer(9).text, getPrayer(10).text, getPrayer(10).text, getPrayer(10).text, getPrayer(13).text)
    };  
      
    //this covers all the mysteries easily
    case 100: case 101: case 102: case 103: case 104:
      return {Title: 'Mystery', size: 1100, text: 
        ['\n'+insert].concat(getPrayer(3).text, getPrayer(4).text, ['\n'+insert], getPrayer(1).text)
      };
  }
}

var readings = function(){
  
  var _this = this;
  this.ajax = require('ajax');
  
  var _days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  this.readingsGetDateMenu = function(){
    var dateString = function(d){return _days[d.getDay()]+' '+(d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear();};
    
    var day = new Date(), items = [];
    for(var i = 0; i < 7; i++){
      if(i) day.setDate(day.getDate()+1);
      items.push({title: dateString(day), d: new Date(day)});
    }
    
    var menu = new UI.Menu();
    menu.items(0,items);
    
    menu.on('select',function(e){
      var day = items[e.itemIndex].d;
      var y = day.getFullYear();
      var m = ((day.getMonth()) < 9  ? '0' : '') + (day.getMonth()+1);
      var d = ((day.getDate())  < 10 ? '0' : '') + day.getDate();
      _this.readingsReadMenu(y+m+d);
    });
    
    menu.show();
  };
  
  this.readings = '';
  this.lastDate = '';
  this.menuExists = '';
  this.window = '';
  this.text = '';
  this.pos = '';
  this.Vector2 = '';
  this.readingsReadMenu = function(date){
    
    if(_this.window !== ''){
      _this.window.hide();
      _this.window = '';
    }
    
    _this.Vector2 = require('vector2');
    
    date = (date == 'last' ? _this.lastDate : date);
    _this.lastDate = date;
    
    console.log('http://universalis.com/Europe.England.Westminster/'+date+'/jsonpmass.js');
    _this.ajax(
      {
        url: 'http://universalis.com/Europe.England.Westminster/'+date+'/jsonpmass.js'
      },
      function(data, status, request) {
        
        //parse our json data
        data = JSON.parse(data.substring(data.length - 3, 20));
        _this.readings = _this.universalisCallback(data);
        
        var menu = new UI.Menu();
        menu.items(0,_this.readings);
        menu.on('select', function(e){
          _this.window = new UI.Window({fullscreen: true});
          _this.text = new UI.Text({
            position: new _this.Vector2(13, 4),
            size: new _this.Vector2(130, 160),
            textAlign: 'center',
            textOverflow: 'wrap',
            color: 'black',
            backgroundColor: 'white',
            text: '',
          });
          _this.window.add(_this.text);
          
          _this.pos = new UI.Circle({
            position: new _this.Vector2(6, 10),
            radius: 4
          });
          _this.window.add(_this.pos);
          
          _this.curChunk = 0; 
          _this.readingNum = e.itemIndex;
          _this.displayReading(0, 0);
          
          _this.window.on('click','select',function(){_this.displayReading( 0,  1);});
          _this.window.on('click','back',  function(){_this.displayReading( 0, -1);});
          _this.window.on('click','up',    function(){_this.displayReading(-1,  0);});
          _this.window.on('click','down',  function(){_this.displayReading( 1,  0);});
          
          _this.window.show();
        });
        
        if(_this.menuExists !== '')
          _this.menuExists.hide();
        _this.menuExists = menu;
        
        menu.show();
      },
      function(error, status, request) {
        var card = new UI.Card();
        card.title('Request Failed');
        card.subtitle(error);
        card.body('press back and try again');
        card.show();
      }
    );
  };
  
  //credit https://gist.github.com/CatTail/4174511
  this.decodeHtmlEntity = function(str) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
      return String.fromCharCode(dec);
    });
  };
  
  this.universalisCallback = function(readings){
    var pages = [];
    for(var r in readings){
      
      var page = {};
      
      if(!readings.hasOwnProperty(r) || (r.indexOf('Mass_') < 0 && r.indexOf('opyright') < 0)) continue;

      if(r.indexOf('Mass_R') >= 0)
        page.title = 'Reading';
      else if(r.indexOf('Mass_Ps') >= 0)
        page.title = 'Psalm';
      else if(r.indexOf('Mass_G') >= 0)
        page.title = 'Gospel';
      else if(r.indexOf('opyright') >= 0)
        page.title = 'Copyright';

      page.subtitle = readings[r].source;
      var sub = (readings[r].source !== undefined ? '<div>' + readings[r].source.replace(',',', ') + '</div>' : '');

      var text = '<div>'+page.title+'</div>' + sub + readings[r].text;
      text = text.replace(/ style="[^"]+"/gi,"");
      text = _this.decodeHtmlEntity(text);
      var regexp = /<div>.*?<\/div>/g;
      var match;

      var charLimit = 16;
      var chunkTemp = [];
      var chunks = [];

      while ((match = regexp.exec(text)) !== null){
        var line = '';
        match = match[0].substring(5,match[0].length-6).replace(/\s\s/g,'');
        match = match.replace(/<i>/,"R: ");
        match = match.replace(/<.*?>/gi,"");
        var explode = match.split(' ');
        for(var i = 0; i < explode.length; i++){
          if((line + ' ' + explode[i]).length > charLimit){
            chunkTemp.push(line.trim());
            line = '';
          }
          line += ' ' + explode[i];
        }

        if(match.trim() === 'or'){
          chunkTemp.pop();
          chunkTemp.push(line);
        }
        else{
          chunkTemp.push(line);
          chunkTemp.push('');
        }
      }

      for(var j = 0; j < chunkTemp.length; j += 6){
        var len = chunks.push(chunkTemp[j]);
        for(var k = j + 1; k < j + 6; k++){
          if(chunkTemp[k] === undefined)
            break;
          chunks[len - 1] += "\n" + chunkTemp[k];
        }
      }

      page.text = chunks;
      pages.push(page);
    }
    return pages;
  };
  
  this.curChunk = 0;
  this.readingNum = 0;
  this.displayReading = function(chunkInc, itemInc){
    _this.readingNum += itemInc;
    _this.curChunk += chunkInc;
    
    if(itemInc !== 0)
      _this.curChunk = 0;
    
    if(_this.readings[_this.readingNum] === undefined)
      return _this.window.hide();
      
 
    if(_this.readings[_this.readingNum].text[_this.curChunk]  === undefined)
      _this.curChunk =  _this.curChunk > 0 ? _this.readings[_this.readingNum].text.length - 1 : 0;
    
    _this.title = _this.readings[_this.readingNum].title;
    _this.text.text(_this.readings[_this.readingNum].text[_this.curChunk]);
    
    var pos = _this.pos.position();
    var l = _this.readings[_this.readingNum].text.length;
    pos.y = 10 + ((132/(l-1)) * (l - (l - 1 - _this.curChunk)));
    _this.pos.animate('position',pos,400);
  };
};

var rosary = function(type){
  var _this = this;
  
  this.Vibe = require('ui/vibe');
  this.Vector2 = require('vector2');
  this.window = new UI.Window({fullscreen: true});
  
  this.type = type;
  
  this.beads = [
    {screen: 1, beads: [null,0,1,2,3,4,5]},
    {screen: 0, beads: [5,11,11,11,11,11,11,11,11,11,11,6]},
    {screen: 0, beads: [6,11,11,11,11,11,11,11,11,11,11,7]},
    {screen: 0, beads: [7,11,11,11,11,11,11,11,11,11,11,8]},
    {screen: 0, beads: [8,11,11,11,11,11,11,11,11,11,11,9]},
    {screen: 0, beads: [9,11,11,11,11,11,11,11,11,11,11,10]},
    {screen: 1, beads: [10,null]}
  ];
  
  this.beadSet = [[],[]];
  //decade beadset
  this.beadSet[0].push(new UI.Circle({
    position: new _this.Vector2(15, (13 * 12) + 2),
    radius: 7
  }));
  for (var i = 11; i >= 2; i--)
    this.beadSet[0].push(new UI.Circle({
      position: new _this.Vector2(15, (13 * i) + 0),
      radius: 5
    }));
  this.beadSet[0].push(new UI.Circle({
    position: new _this.Vector2(15, (13 * 1) - 2),
    radius: 7
  }));

  //cross beadset
  this.beadSet[1].push(new UI.Rect({
    position: new _this.Vector2(15 - 2, (13 * 6) + 1),
    size: new _this.Vector2(4, 24)
  }));
  this.beadSet[1].push(new UI.Rect({
    position: new _this.Vector2(15 - 8, (13 * 6) + 8),
    size: new _this.Vector2(16, 4)
  }));
  this.beadSet[1].push(new UI.Circle({
    position: new _this.Vector2(15, (13 * 5) + 2),
    radius: 7
  }));
  for (i = 4; i >= 2; i--)
    this.beadSet[1].push(new UI.Circle({
      position: new _this.Vector2(15, (13 * i) + 0),
      radius: 5
    }));
  this.beadSet[1].push(new UI.Circle({
    position: new _this.Vector2(15, (13 * 1) - 2),
    radius: 7
  }));
  
  this.switchBeads = function(num){
    var notNum = num == 1 ? 0 : 1;
    //take off what shouldn't be there
    for(i = 0; i < _this.beadSet[notNum].length; i++)
      _this.window.remove(_this.beadSet[notNum][i]);
    
    //add what should
    for(i = 0; i < _this.beadSet[num].length; i++)
      _this.window.add(_this.beadSet[num][i]);
  };
  this.switchBeads(1);
  
  this.lastTime = new Date().getTime();
  this.pray = function(inc){
  
    var temptime = new Date().getTime();
    if(temptime - this.lastTime < 500)
      return;
    this.lastTime = temptime;
    
    var pos = {};
    if(_this.bead[1] + inc < 0 && _this.bead[0] > 0){
      console.log('moving down');
      _this.bead[0]--;
      _this.bead[1] = _this.beads[_this.bead[0]].beads.length - 2;
      _this.switchBeads(_this.beads[_this.bead[0]].screen);
    }
    else if(_this.bead[1] + inc > _this.beads[_this.bead[0]].beads.length - 2 && _this.bead[0] < 6){
      console.log('moving up');
      _this.bead[0]++;
      _this.bead[1] = 0;
      _this.switchBeads(_this.beads[_this.bead[0]].screen);
    }
    else if(_this.bead[1] + inc >= 0 && _this.bead[1] + inc <= _this.beads[_this.bead[0]].beads.length - 2 && _this.beads[_this.bead[0]].beads[_this.bead[1] + inc] !== null){
      console.log('just moving');
      _this.bead[1] += inc;
    }
    console.log(_this.bead[0], _this.bead[1]);
  
    pos = _this.pointer.position();
    pos.y = _this.beadSet[_this.beads[_this.bead[0]].screen][_this.bead[1]].position().y;
    _this.pointer.animate('position',pos,400);
    
    var t = _this.type.text[_this.beads[_this.bead[0]].beads[_this.bead[1]]];
    _this.curPrayer = [];
    if([100,101,102,103,104].indexOf(t) != -1)
      _this.curPrayer = getPrayer(t, _this.type.mysteries[t - 100]);
    else
      _this.curPrayer = getPrayer(t);

    _this.curChunk = 0;
    _this.moveText(0);
    
    console.log(_this.beads[_this.bead[0]].beads[_this.bead[1]]);
    if([5,6,7,8,9].indexOf(_this.beads[_this.bead[0]].beads[_this.bead[1]]) != -1)
      _this.Vibe.vibrate('short');
    else if(_this.beads[_this.bead[0]].beads[_this.bead[1]] == 10)
      _this.Vibe.vibrate('long');
  };
  
  this.moveText = function(upDown){
    if(_this.curChunk + upDown >= 0 && _this.curChunk + upDown < _this.curPrayer.text.length)
      _this.curChunk += upDown;
    
    _this.text.text(_this.curPrayer.text[_this.curChunk]);
    
    if(_this.curPrayer.text.length === 1)
      _this.cont.text(' \n\n\n>\n\n\n ');
    else if(_this.curChunk == _this.curPrayer.text.length - 1)
      _this.cont.text('•\n\n\n>\n\n\n ');
    else if(_this.curChunk === 0)
      _this.cont.text(' \n\n\n>\n\n\n•');
    else
      _this.cont.text('•\n\n\n>\n\n\n•');
    
      
  };
  
  this.bead = [0,1];

  this.text = new UI.Text({
    position: new _this.Vector2(30, 4),
    size: new _this.Vector2(106, 160),
    textAlign: 'center',
    textOverflow: 'wrap',
    color: 'black',
    backgroundColor: 'white',
    text: '',
  });
  this.curPrayer = getPrayer(_this.type.text[0]);
  this.curChunk = 0;
  this.window.add(_this.text);
  
  this.cont = new UI.Text({
    position: new _this.Vector2(144 - 7, 14),
    size: new _this.Vector2(8, 144),
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'clear',
    font: 'gothic-18-bold', 
    text: '',
  });
  this.window.add(_this.cont);
  
  //needs to be after to set the cont correctly
  this.moveText(0);
  
  this.pointer = new UI.Circle({
    position: new _this.Vector2(29, this.beadSet[1][1].position().y),
    radius: 4,
    borderColor : 'black'
  });
  this.window.add(this.pointer);
  
  this.window.on('click','select',function(){_this.pray(1);});
  this.window.on('longClick','select',function(){_this.pray(-1);});
  this.window.on('click','up',function(){_this.moveText(-1);});
  this.window.on('click','down',function(){_this.moveText(1);});
  
  this.window.show();
};

var rosaryMenu = function(){
  var typicalRosary = [0,1,2,2,2,100,101,102,103,104,12,2];
  var types = [
    {title: 'Divine Mercy', subtitle: 'Daily Chaplet', text: [13,14,1,2,0,7,7,7,7,7,15,8]},
    {title: 'Joyful', subtitle: 'Monday, Saturday', text: typicalRosary, mysteries: ['The Annunciation','The Visitation','The Nativity','The Presentation','The Finding of Jesus in the Temple']},
    {title: 'Sorrowful', subtitle: 'Tuesday, Friday', text: typicalRosary, mysteries: ['The Agony in the Garden','The Scourging at the Pillar','The Crowning of Thorns','The Carrying the Cross','The Crucifixtion']},
    {title: 'Glorious', subtitle: 'Wednesday, Sunday', text: typicalRosary, mysteries: ['The Resurrection','The Ascension','The Decent of the Spirit','The Assumption','The Cronwing of Mary']},
    {title: 'Luminous', subtitle: 'Thursday', text: typicalRosary, mysteries: ['The Baptisism','The Wedding at Cana','The Procrolation of the Kingdom of Heaven','The Transifguration','the Institution of the Eucharist']}
  ];
  
  var menu = new UI.Menu();
  menu.items(0, types);
  menu.on('select',function(e){new rosary(types[e.itemIndex], 3);});
  menu.show();
};

function mainMenu(){
  var items = [
    {title: 'Daily Readings'},
    {title: 'Rosary'}
  ];
  
  var menu = new UI.Menu();
  menu.items(0,items);
  
  menu.on('select',function(e){
    if(e.itemIndex === 0){
      new readings().readingsGetDateMenu();
    }
    else{
      rosaryMenu();
    }
  });
  
  menu.show();
}
mainMenu();