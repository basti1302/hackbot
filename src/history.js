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
      return 'LevelEditor';
    }

    return 'Welcome';
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
