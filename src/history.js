(function() {
  'use strict';

  function route() {
    var route = window.location.hash;
    if (route) {
      var segments = route.split('/');
      return routeBySegments(segments);
    }
    return 'Welcome';
  }

  function routeBySegments(segments) {
   if (segments.length > 0) {
      if (segments[0] === '#') {
        segments.splice(0, 1);
        return routeBySegments(segments);
      }
    }
    if (segments[0] === 'play') {
      // is there a base64 encoded level in the query params?
      var levelJson = convertBase64QueryToJson(window.location.search);
      if (levelJson) {
        if (game.loadLevelFromJson(levelJson)) {
          return 'Play';
        }
      }

      var categoryId = segments[1];
      var levelId = segments[2];
      if (categoryId && levelId) {
        game.category = game.levels.categories[categoryId];
        game.category.id = categoryId;
        game.levelId = levelId;
        return 'Play';
      } else if (categoryId) {
        game.category = game.levels.categories[categoryId];
        game.category.id = categoryId;
        return 'LevelSelect';
      } else {
        return 'CategorySelect';
      }
    } else if (segments[0] === 'instructions') {
      var page = segments[1] || '1'
      return 'Instructions' + page;
    } else if (segments[0] === 'editor') {
      // is there a base64 encoded level in the query params?
      var levelJson = convertBase64QueryToJson(window.location.search);
      if (levelJson) {
        game.loadLevelFromJson(levelJson);
      }
      return 'LevelEditor';
    }

    return 'Welcome';
  }

  function convertBase64QueryToJson(search) {
    if (!search || search.length === 0) { return null; }
    var regex = /[\\?&]level=([^&#]*)/
    var base64 = regex.exec(search);
    if (!base64) { return null; }
    try {
      return atob(base64[1]);
    } catch (e) {
      return null;
    }
  }

  window.addEventListener('popstate', function(e) {
    var scene = route(window.location.hash);
    if (scene) {
      Crafty.scene(scene);
    }
  });

  hb.router = {
    route: route,
  };

})();
