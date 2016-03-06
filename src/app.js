var UI = require('ui');
var Vibe = require('ui/vibe');
var ajax = require('ajax');
var Vector2 = require('vector2');

var readings = new (function(){
  
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
})();

var rosary = new (function(){
  var _this = this;
  
  this.typeMenu = function(){
    
  };
  
  this.beads = [
    0,1,2,3,2,
    1,2,3,2,3,2,3,2,3,2,3,
    1,2,3,2,3,2,3,2,3,2,3,
    1,2,3,2,3,2,3,2,3,2,3,
    1,2,3,2,3,2,3,2,3,2,3,
    1,2,3,2,3,2,3,2,3,2,3,1
  ];
  
  var _window = '';
  this.pray = function(bead){
    if(_window !== '')
      _window.hide();
    
    if(bead < 0 || bead > _this.beads.length)
      return;
    
    var window = new UI.Window();
    _window = window;
    
    if(_this.beads[bead] === 0){
      console.log('bead 0');
      var r1 = new UI.Rect({
        position: new Vector2(72 - 5,83 - 42),
        size: new Vector2(10,84)
      });
      _window.add(r1);
      var r2 = new UI.Rect({
        position: new Vector2(72 - 30,83 - 20),
        size: new Vector2(60,10)
      });
      _window.add(r2);
    }
    else if(_this.beads[bead] === 1){
      console.log('bead 1');
      Vibe.vibrate('short');
      _window.add(new UI.Circle({
        position: new Vector2(72,83),
        radius: 30
      }));
    }
    else if (_this.beads[bead] === 2){
      console.log('bead 2');
      _window.add(new UI.Circle({
        position: new Vector2(72,83),
        radius: 15,
        borderColor: 'white'
      }));
    }
    else if (_this.beads[bead] === 3){
      console.log('bead 2');
      _window.add(new UI.Circle({
        position: new Vector2(72,83),
        radius: 15,
        backgroundColor: 'black',
        borderColor: 'white'
      }));
    }
    else{
      mainMenu();
    }
    
    _window.on('click','up',function(){_this.pray(bead + 1);});
    _window.on('click','down',function(){_this.pray(bead - 1);});
    
    _window.show();
  };
})();

function mainMenu(){
  var items = [
    {title: 'Daily Readings'},
    {title: 'Rosary'}
  ];
  
  var menu = new UI.Menu();
  menu.items(0,items);
  
  menu.on('select',function(e){
    console.log(e.itemIndex);
    if(e.itemIndex === 0)
      readings.readingsGetDateMenu();
    else
      rosary.pray(0);
  });
  
  menu.show();
}
mainMenu();