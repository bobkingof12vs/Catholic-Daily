var UI = require('ui');
var Vibe = require('ui/vibe');
var ajax = require('ajax');
var Vector2 = require('vector2');
/*
prayers = [
  {Title: 'Apostle\'s Creed', text: 'I believe in God, the Father Almighty, Creator of Heaven and earth; '+
    'and in Jesus Christ, His only Son Our Lord, '+
    'Who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. '+
    'He descended into Hell; the third day He rose again from the dead; '+
    'He ascended into Heaven, and sitteth at the right hand of God, the Father almighty; from thence He shall come to judge the living and the dead.'+
    'I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body and life everlasting. Amen'},
  {Title:'Our Father', Text: 'Our Father, Who art in heaven, '+
   'Hallowed be Thy Name. Thy Kingdom come. '+
   'Thy Will be done, on earth as it is in Heaven. Give us this day our daily bread. '+
   'And forgive us our trespasses, as we forgive those who trespass against us.'+
   'And lead us not into temptation, but deliver us from evil. Amen.'},
  {Title: 'Hail Mary', text:'Hail Mary, '+
   'Full of Grace, The Lord is with thee. Blessed art thou among women, '+
   'and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, '+
   'pray for us sinners now, and at the hour of death. Amen.'},
  {Title: 'Glory Be', text:'Glory be to the Father, and to the Son and to the Holy Spirit. As it was in the beginning, is now and will be forever. Amen'},
  {Title: 'Oh My Jesus', text:'Oh my Jesus, forgive us our sins, save us from the fires of Hell and lead all souls to Heaven'+
   ', especially those in most need of thine mercy.'},
  {Title: 'Hail Holy Queen', text:'Hail Holy Queen, Mother of Mercy. Our life, our Sweetness and our Hope. To thee do we cry, poor banished children of Eve,'+
   'To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then most gracious advocate, thing eyes of mercy towards us. '+
   'And after this our exile, show unto us, the blessed fruit of thy womb, Jesus. Oh Clemen, oh Loving, oh Sweet Virgin Mary. Pray for us, '+
   'oh most holy Mother of God. That we may be made worthy, of the promises of christ. Amen'},
  {Title: 'Oh Precious Blood and Water...', text:'Oh precious blood and water, which gushed forth from the heart of jesus as a font of mercy for us, I trust in you.'},
  {Title: 'Eternal Father...', text:'Eternal Father, I offer you the body, blood, soul and divinity of your dearly beloved son, our lord Jesus Christ\n'+
   'In attonement for our sins, and those of the whole World.'},
  {Title: 'For the sake...', text:'For the sake of his sorrowful passion\n'+
   'Have mercy on us and on the whole World.'},
  {Title: 'Holy God...', text:'Holy God, Holy Mighty One, Holy Immortal One. Have mercy on us and on the whole World'},
  {Title: 'Jesus, I trust in you', text:'Jesus, I trust in you'}
];
*/
var readings = function(){
  
  var _this = this;
  
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
    ajax(
      {
        url: 'http://universalis.com/Europe.England.Westminster/'+date+'/jsonpmass.js'
      },
      function(data, status, request) {
        data = JSON.parse(data.substring(data.length - 3, 20));
        
        var items = [];
        items.push({title: 'Reading 1', subtitle: data.Mass_R1.source, data: data.Mass_R1});
        items.push({title: 'Psalm', subtitle: data.Mass_Ps.source, data: data.Mass_Ps});
        if(data.Mass_R2 !== undefined)
          items.push({title: 'Reading 2', subtitle: data.Mass_R2.source, data: data.Mass_R2});
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
}

var rosary = function(type){
  var _this = this;
  
  this.type = type;
  
  this.window = new UI.Window({fullscreen: true});
  console.log(this.window);
  this.beads = [
    null,null,-1,0,1,2,3,4,
    5,11,11,11,11,11,11,11,11,11,11,
    6,11,11,11,11,11,11,11,11,11,11,
    7,11,11,11,11,11,11,11,11,11,11,
    8,11,11,11,11,11,11,11,11,11,11,
    9,11,11,11,11,11,11,11,11,11,11,
    10,null,null
  ];
  
  this.padding = 3;
  this.elements = [];
  this.beadElement = function(top, y, radius){
    console.log('adding bead: '+radius);
    var halfHeight = (radius * 2) + _this.padding;
    var cir = new UI.Circle({
        position: new Vector2(72, 83 + y),
        radius: radius
      });
    cir.yoffset = 0;
    cir.halfHeight = halfHeight;
    cir.radius = radius;
    if(top)
      _this.elements.push(cir);
    else
      _this.elements.unshift(cir);
    
    if(radius > 5)
      _this.window.insert(1, _this.elements[top ? (_this.elements.length - 1) : 0]);
  };
  
  this.crossElement = function(top, y, piece){ 
    console.log('adding cross: ' + piece);
    var rect = {};
    if(piece === 0){
      rect = new UI.Rect({
        position: new Vector2(72 - 4, 84 - 23 + y),
        size: new Vector2(8, 68)
      });
      rect.yoffset = 23;
    }
    else{
      rect = new UI.Rect({
        position: new Vector2(72 - 24, 84 - 2 - 50 + y),
        size: new Vector2(48, 8)
      });
      rect.yoffset = 52;
    }
    
    if(top)
      _this.elements.push(rect);
    else
      _this.elements.unshift(rect);
    
    _this.window.insert(1, _this.elements[top ? (_this.elements.length - 1) : 0]);
  };
  
  this.bead = 2;
  this.lastTime = new Date().getTime();
  this.pray = function(inc){
    
    if(new Date().getTime() - this.lastTime < 400)
      return;
    this.lastTime = new Date().getTime();
    
    var top = (inc == 1);
    
    var pushBead = _this.bead + (3 * inc);
    
    console.log('rosary inc: ' + inc, _this.beads[_this.bead + inc], _this.beads[pushBead]);
    
    if(_this.beads[_this.bead + inc] === null || _this.beads[_this.bead + inc] === -1)
      return;
    if(_this.beads[pushBead] === null)
      _this.beadElement(top, inc * -150, 3);
    else if([0,-1].indexOf(_this.beads[pushBead]) != -1)
      _this.crossElement(top, inc * -150, _this.beads[pushBead]);
    else if([2,3,4,11].indexOf(_this.beads[pushBead]) != -1)
      _this.beadElement(top, inc * -150, 10);
    else if([1,5,6,7,8,9,10].indexOf(_this.beads[pushBead]) != -1)
      _this.beadElement(top, inc * -150, 18);
    else
      console.warn('case not found');
    
    _this.bead += inc;
    
    var t = _this.type.text[_this.beads[_this.bead]];
    _this.text.text(_this.beads[_this.bead]+':'+[0,1,2,3,4].indexOf(t) != -1 ? _this.type.mysteries[t] : t);
    
    if([5,6,7,8,9].indexOf(_this.beads[_this.bead]) != -1)
      Vibe.vibrate('short');
    else if(_this.beads[_this.bead] == 10)
      Vibe.vibrate('long');
    
    for (var asdf in _this.elements[0]. _queue)
      console.log(asdf);
    
    _this.window.remove(top ? _this.elements.shift() : _this.elements.pop());
    
    var i = _this.elements.length;
    console.log(i);
    
    while(i--){
      var pos = _this.elements[i].position();
      pos.y =  84 + ((3 - i) * 50) - _this.elements[i].yoffset;
      console.log(i+', '+ pos.y+', '+_this.elements[i].radius);
      _this.elements[i].animate('position', pos, 400);
    }
  };
  
  this.elements = [];
  this.beadElement(true, 150, 0);
  this.beadElement(true, 100, 0);
  this.crossElement(true, 50, -1);
  this.crossElement(true, 0, 0);
  this.beadElement(true, -50, 18);
  this.beadElement(true, -100, 10);
  this.beadElement(true, -150, 10);
  this.bead = 3;

  this.rect = new UI.Rect({
    position: new Vector2(0, 147),
    size: new Vector2(144,20),
    backgroundColor: 'white'
  });
  this.window.add(_this.rect);

  this.text = new UI.Text({
    position: new Vector2(0, 140),
    size: new Vector2(144,20),
    textAlign: 'center',
    color: 'black',
    text: _this.type.text[0]
  });
  this.window.add(_this.text);

  this.window.on('click','up',function(){_this.pray(1);});
  this.window.on('click','down',function(){_this.pray(-1);});
  
  this.window.show();
};

var rosaryMenu = function(){
  var typicalRosary = ['Apostle\'s Creed','Our Father','Hail Mary','Hail Mary','Hail Mary',0,1,2,3,4,'Hail Holy Queen','Hail Mary'];
  var types = [
    {title: 'Divine Mercy', subtitle: 'Daily Chaplet', text: ['Sign of the Cross','Openeing Prayer','Our Father','Hail Mary','Apostle\'s Creed','Eternal Father...','Eternal Father...','Eternal Father...','Eternal Father...','Eternal Father...','Closing Prayer','For the sake...']},
    {title: 'Joyful', subtitle: 'Monday, Saturday', text: typicalRosary, mysteries: ['The Annunciation','The Visitation','The Nativity','The Presentation','Finding of Jesus']},
    {title: 'Sorrowful', subtitle: 'Tuesday, Friday', text: typicalRosary, mysteries: ['Agony in the Garden','The Scourging','Crowning of thorns','Carrying the Cross','The Crucifixtion']},
    {title: 'Glorious', subtitle: 'Wednesday, Sunday', text: typicalRosary, mysteries: ['The Resurrection','The Ascension','Decent of the Spirit','The Assumption','Cronwing of Mary']},
    {title: 'Luminous', subtitle: 'Thursday', text: typicalRosary, mysteries: ['The Baptisism','Wedding at Cana','Procloing the kingdowm','The Transifguration','Institution of the Eucharist']}
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
      var r = new readings();
      r.readingsGetDateMenu();
    }
    else{
      rosaryMenu();
    }
  });
  
  menu.show();
}
mainMenu();