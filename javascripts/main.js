
var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');

var pl = models.Playlist.fromURI('spotify:user:benjou95:playlist:54jUydNRBYmX3MtcXXzfw4');

$.mongohq.authenticate({ apikey: 'lyy9jpbiiygwhg5z0xoi'});
$.mongohq.databases.all({
  success : function(plans){
    console.log(plans);
  }
});

var Track, PlayList, PlayListView, TrackView, myTracks, myPlaylist;

/*
$.getJSON('/tracklist', function(data){
  myTracks = data;
  myPlaylist = new PlayList(myTracks);
});
*/

$(function(){

  Track = Backbone.Model.extend({
  defaults: {
      name: 'Empty title',
      artist: [],
      href: '#'
  },
  initialize: function(){
      this.bind('add', function(){
        console.log(this);
      }, this);
  },
});
  
PlayList = Backbone.Collection.extend({
    model: Track,
    initialize: function(){
      this.bind('add', this.addOne, this.last());
      this.bind('remove', function(){ 
        plView.render();
      });
      plView = new PlayListView({collection: this, el: $('#tracklist')}).render();
    },
    addOne: function(track){
      trackData = {
        artist: track.toJSON().artist,
        href: track.toJSON().href,
        name: track.toJSON().name
      };
      /*$.get('/tracklist/add',{
        data: trackData
      });*/
      // $.mongohq.documents.create({db_name: 'integration', col_name: 'spotify', data: {document:trackData}})
      plView.render();   
    }
});

PlayListView = Backbone.View.extend({
  initialize : function() {
    this.updatePlaylistView();
  },
 
  render : function() {
    this.updatePlaylistView();
    var that = this;
    // Clear out this element.
    $(this.el).empty();
 
    // Render each sub-view and append it to the parent view's element.
    _(this._trackViews).each(function(tv) {
      $(that.el).append(tv.render().el);
    });
    return this;
  },

  updatePlaylistView: function(){
    var that = this;
    this._trackViews = [];
 
    this.collection.each(function(track) {
      that._trackViews.push(new TrackView({
        model : track,
        tagName : 'li'
      }));
    });
  },

  addOne : function(track) {
    this.render();
  }
});

TrackView = Backbone.View.extend({
  tagName : "div",
  className : "track",

  events: {
    "click .remove":  "remove"
  },
 
  render : function() {
    $(this.el).html(_.template($("#track-template").html(), this.model.toJSON()));   
    return this;
  },

  remove: function(event){
    myPlaylist.remove(this.model);
    /*$.get('/tracklist/delete', {
      id: this.model.cid.replace('c','')
    });*/
    // plView.render();
  }
});

// Occurences
myTracks = [];
myPlaylist = new PlayList(myTracks);

  var songs = $("#songs");
	songs.autocomplete({
    // source: "http://ws.spotify.com/search/1/track.json?q="+songs.val(),
    source: function( request, response ) {
      var q = request.term;
      $.getJSON( "http://ws.spotify.com/search/1/track.json", {
        q: songs.val()
      }, function( data, status, xhr ) {
        response( data.tracks );
        // console.log(data.tracks);
      });
    },
    minLength: 2,
    select: function( event, ui ) {
      songs.val( ui.item.name + " - " + ui.item.artists[0].name );
      track = new Track(ui.item);
      myPlaylist.add(track);
      return false;
    },
    focus: function( event, ui ) {
      songs.val( ui.item.name + " - " + ui.item.artists[0].name );
    }
  }).data( "autocomplete" )._renderItem = function( ul, item ) {
    var el = $( "<li></li>" );
    el.data( "item.autocomplete", item )
      .append( "<a>" + item.name + " - " + item.artists[0].name + "</a>")
      .appendTo(ul);
    return el;
  };
});

