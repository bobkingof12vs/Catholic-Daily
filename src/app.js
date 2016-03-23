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
      'resurrection of the body and life everlasting. Amen'
    ]};
    case 1:  return {Title:'Our Father', text: [
      'Our Father, Who art in heaven, Hallowed be Thy Name. Thy Kingdom',
      'come. Thy Will be done, on earth as it is in Heaven. Give us this day our daily',
      'bread. And forgive us our trespasses, as we forgive those who trespass',
      'against us. And lead us not into temptation, but deliver us from evil. Amen.'
      ]};
    case 2:  return {Title: 'Hail Mary', text: [
      'Hail Mary, Full of Grace, The Lord is with thee. Blessed art thou among',
      'women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, ',
      'pray for us sinners now, and at the hour of death. Amen.'
    ]};
    case 3:  return {Title: 'Glory Be', text:[
      'Glory be to the Father, and to the Son and to the Holy Spirit.',
      'As it was in the beginning, is now and will be forever. Amen'
    ]};
    case 4:  return {Title: 'Oh My Jesus', text:[
      'Oh my Jesus, forgive us our sins, save us from the fires of Hell and lead all',
      'souls to Heaven, especially those in most need of thine mercy.'
    ]};
    case 5:  return {Title: 'Hail Holy Queen', text:[
      'Hail Holy Queen, Mother of Mercy. Our life, our Sweetness and our Hope. To ',
      'thee do we cry, poor banished children of Eve, To thee do we send up our ',
      'sighs, mourning and weeping in this valley of tears. Turn then most gracious ',
      'advocate, thine eyes of mercy towards us. And after this our exile, show unto us, the ',
      'blessed fruit of thy womb, Jesus. ',
      'Oh Clemen, oh Loving, oh Sweet Virgin Mary. ',
      'Pray for us, oh most holy Mother of God. That we may be made worthy, of the ',
      'promises of christ. Amen'
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
  
  var _readings = '';
  var _lastDate = '';
  var _menuExists = '';
  this.readingsReadMenu = function(date){
    date = (date == 'last' ? _lastDate : date);
    _lastDate = date;
    
    console.log('http://universalis.com/Europe.England.Westminster/'+date+'/jsonpmass.js');
    _this.ajax(
      {
        url: 'http://universalis.com/Europe.England.Westminster/'+date+'/jsonpmass.js'
      },
      function(data, status, request) {
        data = JSON.parse(data.substring(data.length - 3, 20));
        
        var items = [];
        items.push({title: 'Reading 1', subtitle: data.Mass_R1.source, data: data.Mass_R1});
        items.push({title: 'Psalm', subtitle: data.Mass_Ps.source, data: data.Mass_Ps});
        for(var i = 2; i < 10; i++){
          if(data['Mass_R'+i] !== undefined)
            items.push({title: 'Reading '+i, subtitle: data['Mass_R'+i].source, data: data['Mass_R'+i]});
          if(data['Mass_Ps'+i] !== undefined)
            items.push({title: 'Psalm '+i, subtitle: data['Mass_Ps'+i].source, data: data['Mass_Ps'+i]}); 
        }
        items.push({title: 'Gospel', subtitle: data.Mass_G.source, data: data.Mass_G});
        data.copyright.source = 'Universalis';
        items.push({title: 'Copyright', subtitle: 'for the readings', data: data.copyright});
  
        _readings = items;
        
        
        var menu = new UI.Menu();
        menu.items(0,items);
        menu.on('select', function(e){_this.displayReading(0,e);});
        
        if(_menuExists !== '')
          _menuExists.hide();
        _menuExists = menu;
        
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
  
  this.displayReading = function(curChunk, e){
    if(_readings[e.itemIndex] === undefined)
      return _this.readingsReadMenu('last');
    
    var body = _readings[e.itemIndex].data.text;
    body = (body === undefined ? '[No text to be displayed, Sorry]' : body);
    body = body.split('</div>').join('\n\n');
    body = body.replace(/<\/?[^>]+(>|$)/g, "");
    body = _this.decodeHtmlEntity(body);
    body = _readings[e.itemIndex].data.source+':\n\n'+body+'  ';
  
    var ChunkSize = 900;
    var numChunks = Math.ceil(body.length/ChunkSize);
    var chunks = [];
    
    chunks.push(body.substring(0, body.lastIndexOf(" ", ChunkSize)));
    for(var i = 1; i < numChunks; i++){
      chunks[i - 1] += '\n[press select to continue]';
      var chunkText = body.substring(body.lastIndexOf(" ", (ChunkSize * i)), body.lastIndexOf(" ", (ChunkSize * (i + 1))));
      chunks.push('[page '+(i+1)+']\n\n'+chunkText);
    }
    
    if(curChunk < 0)
      curChunk = numChunks - 1;
    
    console.log(chunks[curChunk].length);
    var card = new UI.Card({
      title: (_readings[e.itemIndex].title),
      body: (chunks[curChunk]),
      scrollable: true
    });
    
    card.on('click','select',function(){
      card.hide();
      if(curChunk < numChunks - 1)
        _this.displayReading(curChunk + 1, {itemIndex: e.itemIndex});
      else
        _this.displayReading(0, {itemIndex: e.itemIndex + 1});
    });
    
    card.on('click','back',function(){
      card.hide();
      if(curChunk > 0)
        _this.displayReading(curChunk - 1, {itemIndex: e.itemIndex});
      else
        _this.displayReading(-1, {itemIndex: e.itemIndex - 1});
    });
    
    card.show();
  };
};

var rosary = function(type){
  var _this = this;
  
  this.Vibe = require('ui/vibe');
  this.Vector2 = require('vector2');
  this.window = new UI.Window({fullscreen: true});
  
  this.type = type;

  this.beads = [
    null,null,null,null,
    0,1,2,3,4,
    5,11,11,11,11,11,11,11,11,11,11,
//     6,11,11,11,11,11,11,11,11,11,11,
//     7,11,11,11,11,11,11,11,11,11,11,
//     8,11,11,11,11,11,11,11,11,11,11,
//     9,11,11,11,11,11,11,11,11,11,11,
    10,
    null,null,null,null
  ];
  
  this.beadElement = function(y, radius){
    console.log('adding bead: '+radius);
    var cir = new UI.Circle({
        position: new _this.Vector2(20, 83 + y),
        radius: radius
      });
    cir.yoffset = 0;
    
    return [cir];
  };
  
  this.crossElement = function(y){ 
    console.log('adding cross');
    var rects = [
      new UI.Rect({
        position: new _this.Vector2(20 - 3, 84 - 23 + y),
        size: new _this.Vector2(8, 44)
      }),
      new UI.Rect({
        position: new _this.Vector2(20 - 15, 84 - 10 + y),
        size: new _this.Vector2(30, 8)
      })
    ];
    rects[0].yoffset = 23;
    rects[1].yoffset = 10;
    return rects;
  };
  
  this.bead = 4;
  this.lastTime = new Date().getTime();
  this.pray = function(inc){
    var i = 0;//to get cloud pebble to stop warning me :|
    
    if(new Date().getTime() - this.lastTime < 500)
      return;
    this.lastTime = new Date().getTime();
    
    var pushBead = _this.bead + (4 * inc);
    
    var newBead = [];
    if(_this.beads[_this.bead + inc] === null || _this.beads[_this.bead + inc] === -1)
      return;
    if(_this.beads[pushBead] === null)
      console.log('adding nothing');
    else if([0,-1].indexOf(_this.beads[pushBead]) != -1)
      newBead = _this.crossElement(inc * -150, _this.beads[pushBead]);
    else if([2,3,4,11].indexOf(_this.beads[pushBead]) != -1)
      newBead = _this.beadElement(inc * -150, 8);
    else if([1,5,6,7,8,9,10].indexOf(_this.beads[pushBead]) != -1)
      newBead = _this.beadElement(inc * -150, 13);
    else
      return console.warn('case not found');
    
    _this.bead += inc;
    
    var t = _this.type.text[_this.beads[_this.bead]];
    _this.curPrayer = [];
    if([100,101,102,103,104].indexOf(t) != -1)
      _this.curPrayer = getPrayer(t, _this.type.mysteries[t - 100]);
    else
      _this.curPrayer = getPrayer(t);

    _this.curChunk = 0;
    _this.moveText(0);
    
    if([5,6,7,8,9].indexOf(_this.beads[_this.bead]) != -1)
      _this.Vibe.vibrate('short');
    else if(_this.beads[_this.bead] == 10)
      _this.Vibe.vibrate('long');
    
    for(i = 0; i < newBead.length; i++)
      _this.window.add(newBead[i]);
    
    var removeBead = [];
    if(inc == 1){
      removeBead = _this.elements.shift();
      _this.elements.push(newBead);
    }
    else{
      removeBead = _this.elements.pop();
      _this.elements.unshift(newBead);
    }
    for(i = 0; i < removeBead.length; i++)
      _this.window.remove(removeBead[i]);

    for(i = 0; i < _this.elements.length; i++){
      console.log(i);
      for(var j = 0; j < _this.elements[i].length; j++){
        var pos = _this.elements[i][j].position();
        pos.y =  84 + ((3 - i) * 50) - _this.elements[i][j].yoffset;
        _this.elements[i][j].animate('position', pos, 400);
      }
    }
  };
  
  this.moveText = function(upDown){
    if(_this.curChunk + upDown >= 0 && _this.curChunk + upDown < _this.curPrayer.text.length)
      _this.curChunk += upDown;
    
    _this.text.text(_this.curPrayer.text[_this.curChunk]);
  };
  
  this.elements = [
    [], [], [],
    this.crossElement(0),
    this.beadElement(-50,  13),
    this.beadElement(-100, 8),
    this.beadElement(-150, 8)
  ];
  
  for(var i = 0; i < this.elements.length; i++)
    for(var j = 0; j < this.elements[i].length; j++)
      this.window.add(this.elements[i][j]);
  
  this.bead = 4;

  this.text = new UI.Text({
    position: new _this.Vector2(40, 4),
    size: new _this.Vector2(100, 160),
    textAlign: 'center',
    textOverflow: 'wrap',
    color: 'black',
    backgroundColor: 'white',
    text: '',
  });
  
  this.curPrayer = getPrayer(_this.type.text[0]);
  this.curChunk = 0;
  this.moveText(0);
  
  this.window.add(_this.text);
  
  this.window.add(new UI.Circle({
    position: new _this.Vector2(39, 84),
    radius: 4,
    borderColor : 'black'
  }));

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
  menu.on('select',function(e){new rosary(types[e.itemIndex]);});
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
    console.log(e.itemIndex);
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